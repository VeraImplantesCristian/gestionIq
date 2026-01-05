<!-- src/components/admin/DividirOrdenDePago.vue -->
<template>
  <div class="pt-6 max-w-4xl mx-auto">
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6 space-y-6">
      
      <!-- PASO 1: BÚSQUEDA Y SELECCIÓN DE LA ORDEN -->
      <div v-if="!selectedOrder">
        <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Paso 1: Seleccionar Orden a Dividir</h3>
        <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Busca la orden de pago que contiene múltiples instrumentadores.</p>
        <div class="mt-4">
          <input 
            type="text" 
            v-model="searchTerm"
            placeholder="Buscar por ID, DNI o nombre de instrumentador..."
            class="form-input"
          />
          <div v-if="isLoading" class="text-sm text-slate-500 mt-2">Cargando historial...</div>
          <div v-if="searchTerm && filteredOrders.length > 0" class="mt-2 border border-slate-200 dark:border-slate-700 rounded-md max-h-60 overflow-y-auto">
            <ul>
              <li v-for="order in filteredOrders" :key="order.id" @click="selectOrder(order)" class="search-result-item">
                <span class="font-bold">#{{ order.id }}</span>
                <span class="text-sm">{{ order.instrumentadores_nombres }}</span>
                <span class="text-xs text-slate-500">{{ formatDate(order.fecha_emision) }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- PASO 2 Y 3: SELECCIÓN DE INSTRUMENTADOR, CARGA Y CONFIRMACIÓN -->
      <div v-else class="space-y-6">
        <div>
          <h3 class="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100">Paso 2: Especificar la División</h3>
          <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mt-2">
            <div class="flex justify-between items-center">
              <div>
                <h4 class="font-bold">Orden #{{ selectedOrder.id }}</h4>
                <p class="text-sm text-slate-600 dark:text-slate-300">{{ selectedOrder.instrumentadores_nombres }}</p>
              </div>
              <button @click="resetSelection" class="btn-secondary text-sm">Cambiar Orden</button>
            </div>
          </div>
        </div>

        <div>
          <label class="form-label">Instrumentador a separar:</label>
          <div class="mt-2 space-y-2">
            <div v-for="inst in instrumentadoresEnOrden" :key="inst.dni" class="flex items-center">
              <input :id="`inst-${inst.dni}`" type="radio" :value="inst.dni" v-model="dniASeparar" class="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500">
              <label :for="`inst-${inst.dni}`" class="ml-3 block text-sm font-medium text-gray-700 dark:text-gray-300">{{ inst.nombre }}</label>
            </div>
          </div>
        </div>

        <div>
          <label class="form-label">Nuevo comprobante para el instrumentador separado:</label>
          <!-- --- INICIO DE LA MODIFICACIÓN --- -->
          <FileUpload 
            v-if="showFileUploader"
            ref="fileUploader" 
            :owner-id="`orden-dividida-${selectedOrder.id}`" 
          />
          <!-- --- FIN DE LA MODIFICACIÓN --- -->
        </div>

        <div class="pt-4">
          <button 
            @click="handleSplit"
            :disabled="!isFormValid || isSubmitting"
            class="btn-danger w-full"
          >
            <span v-if="isSubmitting">Procesando División...</span>
            <span v-else>Dividir Orden de Pago</span>
          </button>
          <p v-if="!isFormValid && !isSubmitting" class="text-xs text-center mt-2 text-red-500">
            Debes seleccionar un instrumentador y adjuntar un nuevo comprobante.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- INICIO DE LA MODIFICACIÓN ---
import { ref, computed, onMounted, nextTick } from 'vue';
// --- FIN DE LA MODIFICACIÓN ---
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import { useAuthorization } from '../../composables/useAuthorization';
import FileUpload from '../uploader/FileUpload.vue';

const toast = useToast();
const { requestAuthorization } = useAuthorization();

const isLoading = ref(true);
const allOrders = ref([]);
const searchTerm = ref('');
const selectedOrder = ref(null);
const dniASeparar = ref(null);
const fileUploader = ref(null);
const isSubmitting = ref(false);
// --- INICIO DE LA MODIFICACIÓN ---
const showFileUploader = ref(true);
// --- FIN DE LA MODIFICACIÓN ---

const isFormValid = computed(() => {
  return selectedOrder.value && dniASeparar.value && fileUploader.value?.hasFiles;
});

const filteredOrders = computed(() => {
  if (!searchTerm.value || allOrders.value.length === 0) return [];
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return allOrders.value.filter(order => 
    order.instrumentadores_count > 1 &&
    (String(order.id).includes(lowerCaseSearch) ||
    (order.instrumentadores_nombres && order.instrumentadores_nombres.toLowerCase().includes(lowerCaseSearch)) ||
    (order.instrumentadores_dnis && order.instrumentadores_dnis.some(dni => dni.includes(lowerCaseSearch))))
  ).slice(0, 10);
});

const instrumentadoresEnOrden = computed(() => {
  if (!selectedOrder.value) return [];
  const nombres = selectedOrder.value.instrumentadores_nombres.split(', ');
  const dnis = selectedOrder.value.instrumentadores_dnis;
  return nombres.map((nombre, index) => ({ nombre, dni: dnis[index] }));
});

const fetchOrders = async () => {
  try {
    isLoading.value = true;
    const { data, error } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (error) throw error;
    allOrders.value = data || [];
  } catch (err) {
    toast.error("No se pudo cargar el historial de órdenes.");
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchOrders);

const selectOrder = (order) => {
  selectedOrder.value = order;
  searchTerm.value = '';
};

// --- INICIO DE LA MODIFICACIÓN ---
// Se actualiza la función de reseteo para usar el patrón v-if/nextTick.
const resetSelection = async () => {
  selectedOrder.value = null;
  dniASeparar.value = null;
  
  showFileUploader.value = false;
  await nextTick();
  showFileUploader.value = true;
};
// --- FIN DE LA MODIFICACIÓN ---

const handleSplit = async () => {
  if (!isFormValid.value || isSubmitting.value) return;

  try {
    const authorized = await requestAuthorization();
    if (!authorized) {
      toast.warning("Operación cancelada. Se requiere autorización.");
      return;
    }

    isSubmitting.value = true;
    const toastId = toast.info("Subiendo nuevo comprobante...", { timeout: false });

    const uploadResult = await fileUploader.value.startUpload('comprobantes-pago');
    if (!uploadResult || uploadResult.length === 0 || !uploadResult[0].object_key) {
      throw new Error("La subida del archivo no devolvió la clave del objeto.");
    }
    const newObjectKey = uploadResult[0].object_key;
    
    toast.update(toastId, { content: "Comprobante subido. Procesando división en la base de datos..." });

    const { data, error: rpcError } = await supabase.rpc('anular_y_recrear_pago_individual', {
      p_orden_id_original: selectedOrder.value.id,
      p_dni_a_separar: dniASeparar.value,
      p_nuevo_object_key: newObjectKey
    });

    if (rpcError) throw rpcError;

    toast.update(toastId, { 
      content: `¡Orden #${selectedOrder.value.id} dividida con éxito! Nuevas órdenes: #${data[0].nueva_orden_separada_id} y #${data[0].nueva_orden_remanente_id}`, 
      options: { type: 'success', timeout: 10000 } 
    });
    
    resetSelection();
    fetchOrders();

  } catch (err) {
    console.error("Error al dividir la orden de pago:", err);
    toast.error(`Error: ${err.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500; }
.btn-danger { @apply bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.search-result-item { @apply flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700; }
</style>