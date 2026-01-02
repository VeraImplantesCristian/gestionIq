<!-- src/views/admin/PagosDashboardView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Estación de Pagos Rápidos</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Filtrá, ajustá y seleccioná cirugías para generar un lote de pago en una sola operación.
      </p>
    </header>

    <div v-if="isLoading" class="text-center p-10">
      <p>Cargando todas las cirugías pendientes...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
      {{ error }}
    </div>
    
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Columna Principal: Tabla de Cirugías -->
      <div class="lg:col-span-2">
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="lg:col-span-2">
              <label class="filter-label">Buscar</label>
              <input 
                type="text" 
                v-model="filters.searchTerm"
                placeholder="Paciente o instrumentador..."
                class="form-input"
              />
            </div>
            <div>
              <label class="filter-label">Instrumentador</label>
              <select v-model="filters.selectedInstrumentador" class="form-input">
                <option value="todos">Todos</option>
                <option v-for="inst in instrumentadorOptions" :key="inst.dni" :value="inst.dni">
                  {{ inst.nombre }}
                </option>
              </select>
            </div>
            <div class="self-end">
              <button @click="clearFilters" class="btn-secondary w-full">Limpiar Filtros</button>
            </div>
            <div>
              <label class="filter-label">Desde</label>
              <input type="date" v-model="filters.startDate" class="form-input" />
            </div>
            <div>
              <label class="filter-label">Hasta</label>
              <input type="date" v-model="filters.endDate" class="form-input" />
            </div>
            <div>
              <label class="filter-label">Monto Mín.</label>
              <input type="number" v-model.number="filters.minAmount" placeholder="Ej: 5000" class="form-input" />
            </div>
            <div>
              <label class="filter-label">Monto Máx.</label>
              <input type="number" v-model.number="filters.maxAmount" placeholder="Ej: 10000" class="form-input" />
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead class="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th scope="col" class="p-4"><input type="checkbox" @change="toggleSelectAll" :checked="areAllSelected" class="checkbox-lg" /></th>
                  <th scope="col" class="table-header">Paciente / Fecha</th>
                  <th scope="col" class="table-header">Instrumentador</th>
                  <th scope="col" class="table-header text-right">Monto a Pagar</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                <tr v-if="filteredSurgeries.length === 0">
                  <td colspan="4" class="px-6 py-10 text-center text-gray-500 dark:text-slate-400">No se encontraron cirugías para los filtros aplicados.</td>
                </tr>
                <tr v-for="surgery in filteredSurgeries" :key="surgery.id" 
                    :class="{'bg-blue-50 dark:bg-blue-900/20': selectedSurgeryIds.includes(surgery.id),
                      'opacity-50 text-slate-400 line-through': justPaidSurgeryIds.has(surgery.id)}">
                  <td class="p-4">
                    <input 
                      type="checkbox" 
                      :value="surgery.id"
                      v-model="selectedSurgeryIds"
                      class="checkbox-lg"
                      :disabled="justPaidSurgeryIds.has(surgery.id)"
                    />
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900 dark:text-slate-100">{{ surgery.paciente }}</div>
                    <div class="text-sm text-gray-500">{{ formatDate(surgery.fecha_cirugia) }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">{{ surgery.instrumentador_nombre || 'No asignado' }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                    <input 
                      type="number"
                      v-model.number="surgery.monto_a_pagar"
                      class="form-input-table"
                      @focus="$event.target.select()"
                      :disabled="justPaidSurgeryIds.has(surgery.id)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div class="lg:col-span-1">
        <div class="sticky top-8">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
            <h2 class="text-xl font-bold mb-4">Resumen de Pago</h2>
            <div v-if="selectedSurgeryIds.length === 0" class="text-center py-10 text-slate-500">
              <p>Seleccioná una o más cirugías de la lista para comenzar.</p>
            </div>
            <div v-else>
              <div class="space-y-3 mb-4">
                <div v-for="inst in paymentSummary.instrumentadores" :key="inst.dni" class="text-sm">
                  <div class="flex justify-between font-medium">
                    <span>{{ inst.nombre }}</span>
                    <span>{{ formatCurrency(inst.monto_total) }}</span>
                  </div>
                  <div class="text-xs text-slate-500">{{ inst.cirugias_count }} cirugía(s)</div>
                </div>
              </div>

              <div class="border-t border-slate-200 dark:border-slate-700 pt-4 mb-6">
                <div class="flex justify-between items-center text-lg font-bold">
                  <span>TOTAL GENERAL</span>
                  <span>{{ formatCurrency(paymentSummary.monto_total_general) }}</span>
                </div>
              </div>

              <div class="space-y-4">
                <textarea v-model="paymentNotes" placeholder="Notas adicionales (opcional)..." class="form-input h-20"></textarea>
                <FileUpload 
                  v-if="showFileUploader"
                  ref="fileUploader" 
                  :owner-id="Date.now().toString()" 
                />
              </div>

              <div class="mt-6">
                <button 
                  @click="registrarPago" 
                  :disabled="isSubmitting || !fileUploader?.hasFiles"
                  class="btn-primary w-full"
                >
                  <span v-if="isSubmitting">Registrando Pago...</span>
                  <span v-else>Registrar Orden de Pago</span>
                </button>
                <p v-if="!fileUploader?.hasFiles" class="text-xs text-center mt-2 text-red-500">Se requiere un comprobante para continuar.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <PostPagoModal 
      :show="isPostPagoModalVisible" 
      :payment-data="lastPaymentData"
      @close="handleClosePostPagoModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, nextTick } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import FileUpload from '../../components/uploader/FileUpload.vue';
import PostPagoModal from '../../components/PostPagoModal.vue';

const toast = useToast();

const isLoading = ref(true);
const error = ref(null);
const allPendingSurgeries = ref([]);
const selectedSurgeryIds = ref([]);
const paymentNotes = ref('');
const fileUploader = ref(null);
const isSubmitting = ref(false);
const isPostPagoModalVisible = ref(false);
const lastPaymentData = ref(null);
const showFileUploader = ref(true);
const justPaidSurgeryIds = ref(new Set());

const filters = reactive({
  searchTerm: '',
  selectedInstrumentador: 'todos',
  startDate: '',
  endDate: '',
  minAmount: null,
  maxAmount: null,
});

const clearFilters = () => {
  filters.searchTerm = '';
  filters.selectedInstrumentador = 'todos';
  filters.startDate = '';
  filters.endDate = '';
  filters.minAmount = null;
  filters.maxAmount = null;
};

const instrumentadorOptions = computed(() => {
  if (!allPendingSurgeries.value) return [];
  const instrumentadores = allPendingSurgeries.value.reduce((acc, surgery) => {
    if (surgery.instrumentador_dni && !acc.some(i => i.dni === surgery.instrumentador_dni)) {
      acc.push({ dni: surgery.instrumentador_dni, nombre: surgery.instrumentador_nombre });
    }
    return acc;
  }, []);
  return instrumentadores.sort((a, b) => a.nombre.localeCompare(b.nombre));
});

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('get_todas_cirugias_pendientes');
    if (rpcError) throw rpcError;
    allPendingSurgeries.value = data || [];
  } catch (err) {
    error.value = "No se pudo cargar la lista de cirugías pendientes.";
    toast.error(err.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const filteredSurgeries = computed(() => {
  let surgeries = [...allPendingSurgeries.value];

  if (filters.searchTerm) {
    const lowerCaseSearch = filters.searchTerm.toLowerCase();
    surgeries = surgeries.filter(surgery => {
      const pacienteMatch = surgery.paciente ? surgery.paciente.toLowerCase().includes(lowerCaseSearch) : false;
      const instrumentadorMatch = surgery.instrumentador_nombre ? surgery.instrumentador_nombre.toLowerCase().includes(lowerCaseSearch) : false;
      return pacienteMatch || instrumentadorMatch;
    });
  }

  if (filters.selectedInstrumentador !== 'todos') {
    surgeries = surgeries.filter(surgery => surgery.instrumentador_dni === filters.selectedInstrumentador);
  }

  if (filters.startDate) {
    surgeries = surgeries.filter(surgery => new Date(surgery.fecha_cirugia) >= new Date(filters.startDate));
  }

  if (filters.endDate) {
    surgeries = surgeries.filter(surgery => new Date(surgery.fecha_cirugia) <= new Date(filters.endDate));
  }

  if (filters.minAmount !== null && filters.minAmount > 0) {
    surgeries = surgeries.filter(surgery => surgery.monto_a_pagar >= filters.minAmount);
  }

  if (filters.maxAmount !== null && filters.maxAmount > 0) {
    surgeries = surgeries.filter(surgery => surgery.monto_a_pagar <= filters.maxAmount);
  }

  return surgeries;
});

const areAllSelected = computed(() => 
  filteredSurgeries.value.length > 0 && 
  filteredSurgeries.value.every(s => selectedSurgeryIds.value.includes(s.id) || justPaidSurgeryIds.value.has(s.id))
);

const toggleSelectAll = (event) => {
  if (event.target.checked) {
    const idsToSelect = filteredSurgeries.value
      .filter(s => !justPaidSurgeryIds.value.has(s.id))
      .map(s => s.id);
    selectedSurgeryIds.value = [...new Set([...selectedSurgeryIds.value, ...idsToSelect])];
  } else {
    const idsToUnselect = filteredSurgeries.value.map(s => s.id);
    selectedSurgeryIds.value = selectedSurgeryIds.value.filter(id => !idsToUnselect.includes(id));
  }
};

const paymentSummary = computed(() => {
  const summary = {
    instrumentadores: {},
    monto_total_general: 0,
  };
  const selected = allPendingSurgeries.value.filter(s => selectedSurgeryIds.value.includes(s.id));
  selected.forEach(surgery => {
    const dni = surgery.instrumentador_dni || 'sin-asignar';
    const nombre = surgery.instrumentador_nombre || 'No Asignado';
    const token = surgery.activity_token;

    if (!summary.instrumentadores[dni]) {
      summary.instrumentadores[dni] = {
        dni: dni,
        nombre: nombre,
        monto_total: 0,
        cirugias: [],
        cirugias_count: 0,
        activity_token: token,
      };
    }
    const inst = summary.instrumentadores[dni];
    const monto = Number(surgery.monto_a_pagar) || 0;
    inst.monto_total += monto;
    inst.cirugias.push({ id: surgery.id, monto: monto });
    inst.cirugias_count++;
    summary.monto_total_general += monto;
  });
  summary.instrumentadores = Object.values(summary.instrumentadores);
  return summary;
});

const registrarPago = async () => {
  if (isSubmitting.value || !fileUploader.value?.hasFiles) return;

  isSubmitting.value = true;
  const toastId = toast.info("Subiendo comprobante...", { timeout: false });

  try {
    const uploadResult = await fileUploader.value.startUpload('comprobantes-pago');
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se corrige la extracción de la clave del objeto para que coincida con la estructura real.
    if (!uploadResult || !Array.isArray(uploadResult) || uploadResult.length === 0 || !uploadResult[0].object_key) {
      console.error('[DEBUG] Estructura de uploadResult inesperada:', uploadResult);
      throw new Error("La subida del archivo no devolvió la clave del objeto esperada.");
    }
    
    const objectKey = uploadResult[0].object_key; // Se usa object_key con guion bajo.
    // --- FIN DE LA MODIFICACIÓN ---

    toast.update(toastId, { content: "Comprobante subido. Registrando orden de pago..." });

    const ordenDePago = {
      monto_total_general: paymentSummary.value.monto_total_general,
      comprobante_object_key: objectKey,
      notas: paymentNotes.value,
      pagos: paymentSummary.value.instrumentadores
        .filter(inst => inst.dni !== 'sin-asignar')
        .map(inst => ({
          instrumentador_dni: inst.dni,
          monto_total_instrumentador: inst.monto_total,
          cirugias: inst.cirugias.map(c => ({ id: c.id, monto: c.monto }))
      }))
    };

    if (ordenDePago.pagos.length === 0) {
      throw new Error("No hay pagos válidos para registrar (verifique asignación de instrumentadores).");
    }

    const { error: rpcError } = await supabase.rpc('registrar_orden_de_pago', { p_orden: ordenDePago });
    if (rpcError) throw rpcError;

    toast.update(toastId, { content: "¡Orden de pago registrada con éxito!", options: { type: 'success', timeout: 3000 } });
    
    lastPaymentData.value = JSON.parse(JSON.stringify(paymentSummary.value));
    
    selectedSurgeryIds.value.forEach(id => justPaidSurgeryIds.value.add(id));

    selectedSurgeryIds.value = [];
    paymentNotes.value = '';
    
    showFileUploader.value = false;
    await nextTick();
    showFileUploader.value = true;
    
    isPostPagoModalVisible.value = true;
    
  } catch (err) {
    console.error("Error al registrar el pago:", err);
    toast.update(toastId, { content: `Error: ${err.message}`, options: { type: 'error', timeout: 5000 } });
  } finally {
    isSubmitting.value = false;
  }
};

const handleClosePostPagoModal = () => {
  isPostPagoModalVisible.value = false;
  justPaidSurgeryIds.value.clear();
  fetchData();
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
</script>

<style scoped>
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400; }
.checkbox-lg { @apply h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
.filter-label { @apply block text-xs font-medium text-slate-500 mb-1; }
.form-input-table {
  @apply w-28 text-right bg-slate-50 dark:bg-slate-700 border border-transparent rounded-md px-2 py-1;
  @apply focus:bg-white focus:dark:bg-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500;
}
</style>