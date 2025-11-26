<!-- src/views/PedidosEspecialesView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 5" :key="n" class="h-16 bg-white dark:bg-slate-800 rounded-md shadow animate-pulse"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{{ error }}</div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-slate-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th class="table-header">Fecha</th>
            <th class="table-header">Médico</th>
            <th class="table-header">Descripción</th>
            <th class="table-header">Autorización</th>
            <th class="table-header">Costo</th>
            <th class="table-header">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800">
          <tr v-if="pedidos.length === 0"><td colspan="6" class="table-cell text-center">No se han registrado pedidos especiales.</td></tr>
          <tr v-for="pedido in pedidos" :key="pedido.id">
            <td class="table-cell text-sm">{{ formatDate(pedido.created_at) }}</td>
            <td class="table-cell font-medium">{{ pedido.nombre_medico }}</td>
            <td class="table-cell max-w-sm truncate" :title="pedido.descripcion_pedido">{{ pedido.descripcion_pedido }}</td>
            <td class="table-cell text-sm">{{ pedido.estado_autorizacion }}</td>
            <td class="table-cell text-sm">{{ formatCurrency(pedido.costo_estimado) }}</td>
            <td class="table-cell">
              <button @click="openModal(pedido)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Ver/Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PedidoEspecialModal
      :show="isModalVisible"
      :pedido="selectedPedido"
      :is-saving="isSaving"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import PedidoEspecialModal from '../components/reclamos/PedidoEspecialModal.vue';

const pedidos = ref([]);
const loading = ref(true);
const error = ref(null);
const toast = useToast();
const isModalVisible = ref(false);
const selectedPedido = ref(null);
const isSaving = ref(false);

const headerConfig = inject('header-config');
const openModal = (pedido = null) => {
  selectedPedido.value = pedido;
  isModalVisible.value = true;
};
const closeModal = () => {
  isModalVisible.value = false;
  selectedPedido.value = null;
};

onMounted(() => {
  headerConfig.value = {
    title: 'Pedidos Especiales',
    buttons: [
      {
        text: 'Nuevo Pedido',
        action: () => openModal(),
        class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2',
        icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },[h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' })])})
      }
    ]
  };
  fetchPedidos();
});

onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const fetchPedidos = async () => {
  loading.value = true;
  try {
    const { data, error: fetchError } = await supabase.rpc('get_pedidos_especiales');
    if (fetchError) throw fetchError;
    pedidos.value = data;
  } catch (err) {
    error.value = "Error al cargar los pedidos especiales.";
    toast.error(err.message);
  } finally {
    loading.value = false;
  }
};

const handleSave = async (pedidoData) => {
  isSaving.value = true;
  try {
    // .upsert es ideal: crea si no tiene ID, actualiza si lo tiene.
    const { error: saveError } = await supabase.from('pedidos_especiales').upsert(pedidoData);
    if (saveError) throw saveError;
    toast.success(`Pedido ${pedidoData.id ? 'actualizado' : 'creado'} con éxito.`);
    closeModal();
    fetchPedidos();
  } catch (err) {
    toast.error("Error al guardar el pedido: " + err.message);
  } finally {
    isSaving.value = false;
  }
};

const formatDate = (date) => new Date(date).toLocaleDateString('es-ES');
const formatCurrency = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value);
};
</script>

<style scoped>
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400; }
.table-cell { @apply px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300; }
</style>