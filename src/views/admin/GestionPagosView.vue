<!-- src/views/admin/GestionPagosView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Registrar Pago a Instrumentador</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Seleccioná el profesional, revisá las cirugías pendientes y cargá el comprobante para finalizar la operación.
      </p>
    </header>

    <div class="payment-layout">
      <!-- Columna Principal (Izquierda) -->
      <div class="main-content">
        <!-- Paso 1: Selección de Instrumentador -->
        <div class="step-card">
          <h2 class="step-title">1. Seleccionar Instrumentador</h2>
          <div v-if="selectedInstrumentador" class="selected-item">
            <span>{{ selectedInstrumentador.nombre_completo }} (DNI: {{ selectedInstrumentador.dni }})</span>
            <button @click="resetView" class="btn-secondary btn-sm">Cambiar</button>
          </div>
          <div v-else>
            <select v-model="selectedInstrumentadorDNI" @change="handleInstrumentadorSelected" class="form-input">
              <option disabled value="">-- Elegí un instrumentador --</option>
              <option v-for="inst in instrumentadores" :key="inst.dni" :value="inst.dni">
                {{ inst.nombre_completo }}
              </option>
            </select>
          </div>
        </div>

        <!-- Paso 2: Cirugías Pendientes -->
        <div v-if="selectedInstrumentador" class="step-card">
          <div class="flex justify-between items-center">
            <h2 class="step-title">Cirugías Pendientes</h2>
            <span class="badge-pending">{{ pendingCirugias.length }} Pendientes</span>
          </div>
          <div v-if="isLoadingCirugias" class="text-center p-8">Cargando cirugías...</div>
          <div v-else-if="pendingCirugias.length === 0" class="text-center p-8 text-slate-500">Este instrumentador no tiene cirugías pendientes de pago.</div>
          <div v-else class="cirugia-list">
            <div class="table-header">
              <input type="checkbox" @change="toggleSelectAll" :checked="areAllSelected" class="checkbox" />
              <span>FECHA</span>
              <span>PACIENTE / PROCEDIMIENTO</span>
              <span class="text-right">MONTO SUGERIDO</span>
              <span class="text-right">MONTO FINAL</span>
            </div>
            <div v-for="cirugia in pendingCirugias" :key="cirugia.id" class="cirugia-item">
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
          <h2 class="step-title">Total a Pagar</h2>
          <p class="total-amount">{{ formatCurrency(totalAPagar) }}</p>
          <p class="selected-count">{{ selectedCirugiaIds.length }} cirugías seleccionadas</p>
          
          <div class="form-group">
            <label for="fecha_pago">Fecha de Pago</label>
            <input type="date" id="fecha_pago" v-model="paymentDetails.fecha_pago" class="form-input" />
          </div>
          
          <div class="form-group">
            <label>Comprobante de Transferencia</label>
            <FileUpload
              ref="fileUploaderRef"
              area="comprobantes-pago"
              :owner-id="selectedInstrumentadorDNI || 'temp'"
              :accepted-file-types="'image/*,application/pdf'"
            />
          </div>

          <div class="form-group">
            <label for="notas">Notas (Opcional)</label>
            <textarea id="notas" v-model="paymentDetails.notas" rows="2" class="form-input" placeholder="Ej: Transferencia #4492..."></textarea>
          </div>

          <div class="mt-6 space-y-2">
            <button @click="registrarPago" :disabled="!isFormValid || isSaving" class="btn-primary w-full">
              {{ isSaving ? 'Registrando...' : 'Registrar Pago' }}
            </button>
            <button @click="resetView" class="btn-secondary w-full">Cancelar</button>
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

const toast = useToast();
const route = useRoute();
const router = useRouter();
const instrumentadores = ref([]);
const selectedInstrumentadorDNI = ref('');
const selectedInstrumentador = ref(null);
const pendingCirugias = ref([]);
const selectedCirugiaIds = ref([]);
const isLoadingCirugias = ref(false);
const isSaving = ref(false);
const fileUploaderRef = ref(null);

const paymentDetails = reactive({
  fecha_pago: new Date().toISOString().split('T')[0],
  notas: '',
});

const fetchInstrumentadores = async () => {
  const { data, error } = await supabase.from('instrumentadores').select('dni, nombre_completo').order('nombre_completo');
  if (error) {
    toast.error("Error al cargar instrumentadores.");
  } else {
    instrumentadores.value = data;
    const dniFromQuery = route.query.instrumentador_dni;
    if (dniFromQuery && instrumentadores.value.some(i => i.dni === dniFromQuery)) {
      selectedInstrumentadorDNI.value = dniFromQuery;
      handleInstrumentadorSelected();
    }
  }
};

onMounted(fetchInstrumentadores);

const handleInstrumentadorSelected = async () => {
  if (!selectedInstrumentadorDNI.value) return;
  
  selectedInstrumentador.value = instrumentadores.value.find(i => i.dni === selectedInstrumentadorDNI.value);
  isLoadingCirugias.value = true;
  pendingCirugias.value = [];
  selectedCirugiaIds.value = [];

  try {
    const { data, error } = await supabase.rpc('obtener_cirugias_pendientes', {
      p_instrumentador_dni: selectedInstrumentadorDNI.value
    });
    if (error) throw error;
    pendingCirugias.value = (data || []).map(c => ({ ...c, monto_final: c.monto_sugerido }));
  } catch (err) {
    toast.error("Error al cargar cirugías pendientes: " + err.message);
  } finally {
    isLoadingCirugias.value = false;
  }
};

const totalAPagar = computed(() => {
  return pendingCirugias.value
    .filter(c => selectedCirugiaIds.value.includes(c.id))
    .reduce((sum, c) => sum + Number(c.monto_final || 0), 0);
});

const areAllSelected = computed(() => {
  return pendingCirugias.value.length > 0 && selectedCirugiaIds.value.length === pendingCirugias.value.length;
});

const isFormValid = computed(() => {
  const hasSelectedCirugias = selectedCirugiaIds.value.length > 0;
  const hasPaymentDate = !!paymentDetails.fecha_pago;
  // Verificamos que fileUploaderRef.value exista ANTES de intentar acceder a sus propiedades.
  const hasFilesAttached = !!(fileUploaderRef.value && fileUploaderRef.value.selectedFiles && fileUploaderRef.value.selectedFiles.length > 0);
  
  return hasSelectedCirugias && hasPaymentDate && hasFilesAttached;
});

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    selectedCirugiaIds.value = pendingCirugias.value.map(c => c.id);
  } else {
    selectedCirugiaIds.value = [];
  }
};

const registrarPago = async () => {
  if (!isFormValid.value) {
    toast.warning("Debes seleccionar al menos una cirugía, la fecha y adjuntar un comprobante.");
    return;
  }
  isSaving.value = true;
  try {
    const uploadedFiles = await fileUploaderRef.value.startUpload();
    if (uploadedFiles.length === 0) {
      throw new Error("La subida del comprobante falló.");
    }
    const comprobanteKey = uploadedFiles[0].object_key;

    const { error } = await supabase.rpc('registrar_lote_de_pago', {
      p_instrumentador_dni: selectedInstrumentadorDNI.value,
      p_reporte_ids: selectedCirugiaIds.value,
      p_monto_total: totalAPagar.value,
      p_fecha_pago: paymentDetails.fecha_pago,
      p_comprobante_key: comprobanteKey,
      p_notas: paymentDetails.notas
    });

    if (error) throw error;

    toast.success("¡Lote de pago registrado con éxito!");
    router.push({ name: 'PagosDashboard' });

  } catch (err) {
    toast.error("Error al registrar el pago: " + err.message);
  } finally {
    isSaving.value = false;
  }
};

const resetView = () => {
  router.replace({ query: {} });
  selectedInstrumentadorDNI.value = '';
  selectedInstrumentador.value = null;
  pendingCirugias.value = [];
  selectedCirugiaIds.value = [];
  paymentDetails.notas = '';
  paymentDetails.fecha_pago = new Date().toISOString().split('T')[0];
  fileUploaderRef.value?.clear();
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
.selected-item { @apply flex justify-between items-center bg-slate-100 dark:bg-slate-700 p-3 rounded-lg; }
.form-input { @apply w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm; @apply dark:bg-slate-700 dark:border-slate-600; }
.badge-pending { @apply bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full; @apply dark:bg-yellow-900/50 dark:text-yellow-300; }
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
.btn-sm { @apply py-1 px-3 text-sm; }
.adjusted { @apply bg-yellow-100 dark:bg-yellow-900/50 border-yellow-400; }
</style>