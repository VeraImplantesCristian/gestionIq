<!-- src/views/admin/CrearOrdenDePagoView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Nueva Orden de Pago</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Revisá las cirugías, ajustá los montos si es necesario y registrá el pago.
      </p>
    </header>

    <div v-if="isLoading" class="text-center p-10">
      <p>Cargando datos de instrumentadores y cirugías pendientes...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
      {{ error }}
    </div>

    <div v-else class="payment-layout">
      <!-- Columna Principal (Izquierda) -->
      <div class="main-content">
        <div v-for="instrumentador in instrumentadoresConCirugias" :key="instrumentador.dni" class="step-card">
          <h2 class="step-title">{{ instrumentador.nombre_completo }}</h2>
          <div v-if="instrumentador.cirugias.length === 0" class="text-center p-4 text-slate-500">
            No tiene cirugías pendientes.
          </div>
          <div v-else class="cirugia-list">
            <div class="table-header">
              <input type="checkbox" @change="toggleSelectAllForInstrumentador(instrumentador.dni, $event)" :checked="areAllSelectedForInstrumentador(instrumentador.dni)" class="checkbox" />
              <span>FECHA</span>
              <span>PACIENTE / PROCEDIMIENTO</span>
              <span class="text-right">MONTO SUGERIDO</span>
              <span class="text-right">MONTO FINAL</span>
            </div>
            <div v-for="cirugia in instrumentador.cirugias" :key="cirugia.id" class="cirugia-item">
              <input type="checkbox" :value="cirugia.id" v-model="selectedCirugiaIds" class="checkbox" />
              <span class="text-sm text-slate-500">{{ formatDate(cirugia.fecha_cirugia) }}</span>
              <div>
                <p class="font-semibold">{{ cirugia.paciente }}</p>
                <p class="text-sm text-slate-500">{{ cirugia.tipo_cirugia }}</p>
              </div>
              <span class="text-right text-sm text-slate-500">{{ formatCurrency(cirugia.monto_sugerido) }}</span>
              <input 
                type="number" 
                v-model="cirugia.monto_final" 
                class="form-input text-right font-semibold"
                :class="{ 'adjusted': cirugia.monto_final != cirugia.monto_sugerido }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Columna de Resumen (Derecha) -->
      <div class="summary-panel">
        <div class="summary-card">
          <h2 class="step-title">Resumen de la Orden</h2>
          <p class="total-amount">{{ formatCurrency(totalGeneralAPagar) }}</p>
          <p class="selected-count">{{ selectedCirugiaIds.length }} cirugías en {{ instrumentadoresSeleccionados.length }} instrumentador(es)</p>
          
          <div class="form-group">
            <label for="fecha_pago">Fecha de Pago</label>
            <input type="date" id="fecha_pago" v-model="paymentDetails.fecha_emision" class="form-input" />
          </div>
          
          <div class="form-group">
            <label>Comprobante de Transferencia</label>
            <FileUpload ref="fileUploaderRef" area="comprobantes-pago" owner-id="orden-de-pago" />
          </div>

          <div class="form-group">
            <label for="notas">Notas (Opcional)</label>
            <textarea id="notas" v-model="paymentDetails.notas" rows="2" class="form-input" placeholder="Ej: Pago semanal..."></textarea>
          </div>

          <div class="mt-6 space-y-2">
            <button @click="confirmarYRegistrar" :disabled="!isFormValid || isSaving" class="btn-primary w-full">
              {{ isSaving ? 'Registrando...' : 'Registrar Orden de Pago' }}
            </button>
            <router-link :to="{ name: 'PagosDashboard' }" class="btn-secondary w-full text-center block">Cancelar</router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { supabase } from '../../services/supabase';
import FileUpload from '../../components/uploader/FileUpload.vue';
import { useOrdenDePagoPDF } from '../../composables/useOrdenDePagoPDF';

const route = useRoute();
const router = useRouter();
const toast = useToast();
const { generatePDF } = useOrdenDePagoPDF();

const isLoading = ref(true);
const error = ref(null);
const instrumentadoresConCirugias = ref([]);
const selectedCirugiaIds = ref([]);
const isSaving = ref(false);
const fileUploaderRef = ref(null);

const paymentDetails = reactive({
  fecha_emision: new Date().toISOString().split('T')[0],
  notas: '',
});

const fetchData = async () => {
  const dnis = route.query.dnis?.split(',');
  if (!dnis || dnis.length === 0) {
    error.value = "No se seleccionaron instrumentadores. Volvé al dashboard de pagos.";
    isLoading.value = false;
    return;
  }

  try {
    const { data: instData, error: instError } = await supabase
      .from('instrumentadores')
      .select('dni, nombre_completo')
      .in('dni', dnis);
    if (instError) throw instError;

    const cirugiasPromises = dnis.map(dni => 
      supabase.rpc('obtener_cirugias_pendientes', { p_instrumentador_dni: dni })
    );
    const cirugiasResults = await Promise.all(cirugiasPromises);

    const data = instData.map((inst, index) => {
      const cirugias = cirugiasResults[index].data || [];
      return {
        ...inst,
        cirugias: cirugias.map(c => ({ ...c, monto_final: c.monto_sugerido }))
      };
    });

    instrumentadoresConCirugias.value = data;

  } catch (err) {
    error.value = "Error al cargar los datos para la orden de pago.";
    toast.error(err.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const allCirugias = computed(() => instrumentadoresConCirugias.value.flatMap(i => i.cirugias));

const totalGeneralAPagar = computed(() => {
  return allCirugias.value
    .filter(c => selectedCirugiaIds.value.includes(c.id))
    .reduce((sum, c) => sum + Number(c.monto_final || 0), 0);
});

const instrumentadoresSeleccionados = computed(() => {
  const dnis = new Set();
  allCirugias.value
    .filter(c => selectedCirugiaIds.value.includes(c.id))
    .forEach(c => {
      const inst = instrumentadoresConCirugias.value.find(i => i.cirugias.some(ic => ic.id === c.id));
      if (inst) dnis.add(inst.dni);
    });
  return Array.from(dnis);
});

const isFormValid = computed(() => {
  const hasSelectedCirugias = selectedCirugiaIds.value.length > 0;
  const hasPaymentDate = !!paymentDetails.fecha_emision;
  const hasFilesAttached = !!(fileUploaderRef.value && fileUploaderRef.value.hasFiles);
  
  return hasSelectedCirugias && hasPaymentDate && hasFilesAttached;
});

const areAllSelectedForInstrumentador = (dni) => {
  const inst = instrumentadoresConCirugias.value.find(i => i.dni === dni);
  if (!inst || inst.cirugias.length === 0) return false;
  return inst.cirugias.every(c => selectedCirugiaIds.value.includes(c.id));
};

const toggleSelectAllForInstrumentador = (dni, event) => {
  const inst = instrumentadoresConCirugias.value.find(i => i.dni === dni);
  const cirugiaIds = inst.cirugias.map(c => c.id);
  if (event.target.checked) {
    selectedCirugiaIds.value = [...new Set([...selectedCirugiaIds.value, ...cirugiaIds])];
  } else {
    selectedCirugiaIds.value = selectedCirugiaIds.value.filter(id => !cirugiaIds.includes(id));
  }
};

const confirmarYRegistrar = async () => {
  if (!isFormValid.value) {
    toast.warning("Debes seleccionar cirugías, la fecha y adjuntar un comprobante.");
    return;
  }
  isSaving.value = true;
  try {
    const uploadedFiles = await fileUploaderRef.value.startUpload();
    if (uploadedFiles.length === 0) throw new Error("La subida del comprobante falló.");
    
    const ordenPayload = {
      monto_total_general: totalGeneralAPagar.value,
      fecha_emision: paymentDetails.fecha_emision,
      comprobante_object_key: uploadedFiles[0].object_key,
      notas: paymentDetails.notas,
      lotes_instrumentadores: instrumentadoresSeleccionados.value.map(dni => {
        const inst = instrumentadoresConCirugias.value.find(i => i.dni === dni);
        const cirugiasDelInstrumentador = inst.cirugias.filter(c => selectedCirugiaIds.value.includes(c.id));
        return {
          instrumentador_dni: dni,
          monto_total_instrumentador: cirugiasDelInstrumentador.reduce((sum, c) => sum + Number(c.monto_final || 0), 0),
          reporte_ids: cirugiasDelInstrumentador.map(c => c.id)
        };
      }).filter(lote => lote.reporte_ids.length > 0)
    };

    const { data: newOrdenId, error } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenPayload });
    if (error) throw error;

    toast.success(`¡Orden de Pago #${newOrdenId} registrada con éxito!`);

    // Generamos el PDF
    const { data: ordenDetails, error: detailsError } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: newOrdenId });
    if (detailsError) throw detailsError;
    
    generatePDF(ordenDetails);

    router.push({ name: 'PagosDashboard' });

  } catch (err) {
    toast.error("Error al registrar la orden de pago: " + err.message);
  } finally {
    isSaving.value = false;
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric' });
const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
</script>

<style scoped>
.payment-layout { display: grid; grid-template-columns: 1fr; gap: 1.5rem; }
@media (min-width: 1024px) { .payment-layout { grid-template-columns: 2fr 1fr; } }
.main-content { display: flex; flex-direction: column; gap: 1.5rem; }
.summary-panel { position: sticky; top: 1.5rem; align-self: start; }
.step-card, .summary-card { @apply bg-white dark:bg-slate-800 p-6 rounded-xl shadow; }
.step-title { @apply text-lg font-bold text-slate-800 dark:text-slate-100 mb-4; }
.form-input { @apply w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm; @apply dark:bg-slate-700 dark:border-slate-600; }
.cirugia-list { @apply mt-4 border-t border-slate-200 dark:border-slate-700; }
.table-header { @apply grid grid-cols-[auto,1fr,2fr,1fr,1fr] items-center gap-4 px-2 py-2 text-xs font-semibold text-slate-500 uppercase; }
.cirugia-item { @apply grid grid-cols-[auto,1fr,2fr,1fr,1fr] items-center gap-4 px-2 py-3 border-t border-slate-100 dark:border-slate-700; }
.checkbox { @apply h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500; }
.total-amount { @apply text-4xl font-bold text-slate-800 dark:text-slate-100; }
.selected-count { @apply text-sm text-green-600 font-semibold mb-6; }
.form-group { @apply flex flex-col gap-2 mb-4; }
label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-white text-slate-700 border border-slate-300 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600; }
.adjusted { @apply bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400; }
</style>