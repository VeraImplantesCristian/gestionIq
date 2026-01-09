<!-- src/components/admin/corrections/CorrectionWorkspace.vue -->
<template>
  <div class="correction-workspace p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
    
    <!-- Fase de Búsqueda: se muestra si no hay ninguna orden seleccionada -->
    <div v-if="!selectedOrder" class="search-phase">
      <header class="mb-8 text-center">
        <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Herramientas de Corrección</h2>
        <p class="text-slate-600 dark:text-slate-400 mt-1">
          Comenzá buscando la orden de pago que necesitás modificar.
        </p>
      </header>
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
        <label for="searchOrder" class="form-label">Buscar Orden de Pago</label>
        <input 
          id="searchOrder"
          type="text" 
          v-model="searchTerm"
          placeholder="Buscar por ID de orden, DNI o nombre de instrumentador..."
          class="form-input"
        />
        <div v-if="isLoading" class="text-sm text-slate-500 mt-2">Cargando historial de órdenes...</div>
        <div v-else-if="searchTerm && filteredOrders.length > 0" class="mt-2 border border-slate-200 dark:border-slate-700 rounded-md max-h-60 overflow-y-auto">
          <ul>
            <li v-for="order in filteredOrders" :key="order.id" @click="selectOrder(order)" class="search-result-item">
              <span class="font-bold">#{{ order.id }}</span>
              <span class="text-sm">{{ order.instrumentadores_nombres }}</span>
              <span class="text-xs text-slate-500">{{ formatDate(order.fecha_emision) }}</span>
            </li>
          </ul>
        </div>
         <p v-else-if="searchTerm" class="text-sm text-slate-500 mt-2">No se encontraron órdenes que coincidan con la búsqueda.</p>
      </div>
    </div>

    <!-- Fase de Trabajo: se muestra cuando se ha seleccionado una orden -->
    <div v-else class="workspace-phase">
      <!-- Cabecera con los detalles de la orden y botón para cambiar -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6 mb-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">Orden de Pago Seleccionada</p>
            <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">#{{ selectedOrder.id }}</h2>
            <p class="text-slate-600 dark:text-slate-300">{{ selectedOrder.instrumentadores_nombres }} - {{ formatCurrency(selectedOrder.monto_total_general) }}</p>
          </div>
          <button @click="resetWorkspace" class="btn-secondary text-sm">Buscar otra Orden</button>
        </div>
      </div>

      <!-- Contenedor para las herramientas modulares -->
      <div class="tools-grid space-y-6">
        <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 border-b pb-2 dark:border-slate-700">Herramientas Disponibles</h3>
        
        <!-- --- INICIO DE LA MODIFICACIÓN --- -->
        <!-- 
          Añadimos la nueva herramienta para modificar montos y notas.
          Es crucial añadir un :key="selectedOrder.id" para forzar al componente
          a reiniciarse y recargar sus datos si el usuario selecciona una nueva orden
          sin volver al buscador.
        -->
        <ToolModificarMontosNotas
          :key="selectedOrder.id"
          :order-id="selectedOrder.id"
          @action-completed="handleActionCompleted"
        />
        <!-- --- FIN DE LA MODIFICACIÓN --- -->

        <ToolCambiarComprobante 
          :order-id="selectedOrder.id"
          @action-completed="handleActionCompleted"
        />
        
        <ToolAnularPago 
          :order-id="selectedOrder.id" 
          @action-completed="handleActionCompleted" 
        />

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../../services/supabase';
import { useToast } from 'vue-toastification';

// --- INICIO DE LA MODIFICACIÓN ---
// Importamos todos los componentes de herramienta.
import ToolCambiarComprobante from './ToolCambiarComprobante.vue';
import ToolAnularPago from './ToolAnularPago.vue';
import ToolModificarMontosNotas from './ToolModificarMontosNotas.vue';
// --- FIN DE LA MODIFICACIÓN ---

const toast = useToast();

const isLoading = ref(true);
const allOrders = ref([]);
const searchTerm = ref('');
const selectedOrder = ref(null);

const filteredOrders = computed(() => {
  if (!searchTerm.value || allOrders.value.length === 0) {
    return [];
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return allOrders.value.filter(order => 
    String(order.id).includes(lowerCaseSearch) ||
    (order.instrumentadores_nombres && order.instrumentadores_nombres.toLowerCase().includes(lowerCaseSearch)) ||
    (order.instrumentadores_dnis && order.instrumentadores_dnis.some(dni => dni.includes(lowerCaseSearch)))
  ).slice(0, 10);
});

const fetchOrders = async () => {
  isLoading.value = true;
  try {
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

const resetWorkspace = () => {
  selectedOrder.value = null;
};

const handleActionCompleted = () => {
  toast.success("La operación se completó. Refrescando datos...");
  // Refrescamos la lista de órdenes para que el resumen muestre los datos actualizados.
  fetchOrders();
  // Volvemos al buscador para iniciar un nuevo flujo de corrección.
  resetWorkspace();
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-1 px-3 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500; }
.search-result-item { @apply flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700; }
</style>