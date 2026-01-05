<!-- src/views/admin/CorregirComprobanteView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Corregir Comprobante de Pago</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Herramienta administrativa para reemplazar el comprobante de una orden de pago existente.
      </p>
    </header>

    <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6 space-y-6">
      <!-- --- INICIO DE LA MODIFICACIÓN --- -->
      
      <!-- PASO 1: BÚSQUEDA Y SELECCIÓN DE LA ORDEN -->
      <div v-if="!selectedOrder">
        <label for="searchOrder" class="form-label">Buscar Orden de Pago</label>
        <input 
          id="searchOrder"
          type="text" 
          v-model="searchTerm"
          placeholder="Buscar por ID, DNI o nombre de instrumentador..."
          class="form-input"
        />
        <!-- Lista de resultados de búsqueda -->
        <div v-if="searchTerm && filteredOrders.length > 0" class="mt-2 border border-slate-200 dark:border-slate-700 rounded-md max-h-60 overflow-y-auto">
          <ul>
            <li v-for="order in filteredOrders" :key="order.id" @click="selectOrder(order)" class="search-result-item">
              <span class="font-bold">#{{ order.id }}</span>
              <span class="text-sm">{{ order.instrumentadores_nombres }}</span>
              <span class="text-xs text-slate-500">{{ formatDate(order.fecha_emision) }}</span>
            </li>
          </ul>
        </div>
        <p v-if="isLoading" class="text-sm text-slate-500 mt-2">Cargando historial de órdenes...</p>
      </div>

      <!-- PASO 2: CONFIRMACIÓN Y ACTUALIZACIÓN -->
      <div v-else>
        <!-- Resumen de la orden seleccionada -->
        <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-bold text-lg">Orden #{{ selectedOrder.id }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-300">{{ selectedOrder.instrumentadores_nombres }} - {{ formatCurrency(selectedOrder.monto_total_general) }}</p>
            </div>
            <button @click="resetSelection" class="btn-secondary text-sm">Cambiar Orden</button>
          </div>
        </div>

        <div>
          <label class="form-label">Nuevo Archivo de Comprobante</label>
          <FileUpload 
            ref="fileUploader" 
            :owner-id="`orden-${selectedOrder.id}`"
          />
        </div>

        <div class="pt-4">
          <button 
            @click="handleUpdate"
            :disabled="!isFormValid || isSubmitting"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting">Actualizando...</span>
            <span v-else>Actualizar Comprobante</span>
          </button>
          <p v-if="!isFormValid && !isSubmitting" class="text-xs text-center mt-2 text-red-500">
            Se requiere un archivo para actualizar.
          </p>
        </div>
      </div>
      <!-- --- FIN DE LA MODIFICACIÓN --- -->
    </div>
  </div>
</template>

<script setup>
// --- INICIO DE LA MODIFICACIÓN ---
import { ref, computed, onMounted } from 'vue';
// --- FIN DE LA MODIFICACIÓN ---
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
import FileUpload from '../../components/uploader/FileUpload.vue';

const toast = useToast();

// --- INICIO DE LA MODIFICACIÓN ---
// Se reemplaza 'ordenId' por un estado más completo para la búsqueda.
const isLoading = ref(true);
const allOrders = ref([]);
const searchTerm = ref('');
const selectedOrder = ref(null);
// --- FIN DE LA MODIFICACIÓN ---

const fileUploader = ref(null);
const isSubmitting = ref(false);

// --- INICIO DE LA MODIFICACIÓN ---
// La validación del formulario ahora depende de si hay una orden seleccionada.
const isFormValid = computed(() => {
  return selectedOrder.value && fileUploader.value?.hasFiles;
});

// Lógica para filtrar las órdenes según el término de búsqueda.
const filteredOrders = computed(() => {
  if (!searchTerm.value || allOrders.value.length === 0) {
    return [];
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return allOrders.value.filter(order => 
    String(order.id).includes(lowerCaseSearch) ||
    (order.instrumentadores_nombres && order.instrumentadores_nombres.toLowerCase().includes(lowerCaseSearch)) ||
    (order.instrumentadores_dnis && order.instrumentadores_dnis.some(dni => dni.includes(lowerCaseSearch)))
  ).slice(0, 10); // Limita a 10 resultados para no saturar la UI.
});

// Carga todas las órdenes al iniciar el componente.
onMounted(async () => {
  try {
    const { data, error } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (error) throw error;
    allOrders.value = data || [];
  } catch (err) {
    toast.error("No se pudo cargar el historial de órdenes.");
  } finally {
    isLoading.value = false;
  }
});

// Funciones para manejar la selección.
const selectOrder = (order) => {
  selectedOrder.value = order;
  searchTerm.value = ''; // Limpia la búsqueda
};

const resetSelection = () => {
  selectedOrder.value = null;
};
// --- FIN DE LA MODIFICACIÓN ---

const handleUpdate = async () => {
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;
  const toastId = toast.info("Subiendo nuevo comprobante...", { timeout: false });

  try {
    const uploadResult = await fileUploader.value.startUpload('comprobantes-pago');
    
    if (!uploadResult || uploadResult.length === 0 || !uploadResult[0].object_key) {
      throw new Error("La subida del archivo no devolvió la clave del objeto.");
    }
    const newObjectKey = uploadResult[0].object_key;
    
    toast.update(toastId, { content: "Comprobante subido. Actualizando registro..." });

    const { error: rpcError } = await supabase.rpc('actualizar_comprobante_orden_pago', {
      // --- INICIO DE LA MODIFICACIÓN ---
      // Se usa el ID de la orden seleccionada.
      p_orden_id: selectedOrder.value.id,
      // --- FIN DE LA MODIFICACIÓN ---
      p_nuevo_object_key: newObjectKey
    });

    if (rpcError) throw rpcError;

    toast.update(toastId, { 
      content: `¡Comprobante de la Orden #${selectedOrder.value.id} actualizado con éxito!`, 
      options: { type: 'success', timeout: 5000 } 
    });
    
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se resetea el estado para permitir una nueva corrección.
    resetSelection();
    // --- FIN DE LA MODIFICACIÓN ---

  } catch (err) {
    console.error("Error al actualizar el comprobante:", err);
    toast.update(toastId, { 
      content: `Error: ${err.message}`, 
      options: { type: 'error', timeout: 5000 } 
    });
  } finally {
    isSubmitting.value = false;
  }
};

// --- INICIO DE LA MODIFICACIÓN ---
// Helpers de formato para mostrar en la UI.
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
// --- FIN DE LA MODIFICACIÓN ---
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
/* --- INICIO DE LA MODIFICACIÓN --- */
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500; }
.search-result-item { @apply flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700; }
/* --- FIN DE LA MODIFICACIÓN --- */
</style>