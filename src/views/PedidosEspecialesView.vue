<!-- src/views/PedidosEspecialesView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <!-- Filtro Principal por Médico con Autocompletado -->
    <div class="mb-6 max-w-sm">
      <label for="medico-search" class="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1">Buscar Médico</label>
      <AutocompleteSearch
        v-model="medicoSearchTerm"
        :results="filteredMedicos"
        @select="selectMedico"
        placeholder="Escriba para buscar un médico..."
      >
        <template #default="{ result }">
          <span>{{ result }}</span>
        </template>
      </AutocompleteSearch>
    </div>

    <!-- Contenido del Dashboard (se muestra solo si se ha seleccionado un médico) -->
    <div v-if="selectedMedico">
      <!-- Tarjetas de Estadísticas -->
      <section class="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Pedidos" :value="stats.cantidad_pedidos ?? 0" :icon="GiftIcon" />
        <StatCard title="Patología Habitual" :value="stats.patologia_habitual || 'N/A'" :icon="ClipboardDocumentListIcon" />
        <StatCard title="Monto Total Estimado" :value="formatCurrency(stats.monto_total_estimado)" :icon="CurrencyDollarIcon" />
        <StatCard title="Último Pedido" :value="formatDate(stats.fecha_ultimo_pedido)" :icon="CalendarIcon" />
      </section>

      <!-- Tabla de Pedidos del Médico -->
      <div v-if="loading" class="text-center py-10">
        <p class="text-slate-500">Cargando datos del médico...</p>
      </div>
      <div v-else class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-slate-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead class="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th class="table-header">Fecha</th>
              <th class="table-header">Tipo Cirugía</th>
              <th class="table-header">Descripción</th>
              <th class="table-header">Autorización</th>
              <th class="table-header">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800">
            <tr v-if="pedidos.length === 0">
              <td colspan="5" class="table-cell text-center">Este médico no tiene pedidos especiales registrados.</td>
            </tr>
            <tr v-for="pedido in pedidos" :key="pedido.id">
              <td class="table-cell text-sm">{{ formatDate(pedido.created_at) }}</td>
              <td class="table-cell">{{ pedido.tipo_cirugia || 'N/A' }}</td>
              <td class="table-cell max-w-sm truncate" :title="pedido.descripcion_pedido">{{ pedido.descripcion_pedido }}</td>
              <td class="table-cell text-sm">{{ pedido.estado_autorizacion }}</td>
              <td class="table-cell space-x-4">
                <button @click="openModal(pedido)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400">Ver/Editar</button>
                <button @click="handleDelete(pedido)" class="text-red-600 hover:text-red-900 dark:text-red-400">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Mensaje inicial -->
    <div v-else class="text-center py-16 bg-white dark:bg-slate-800 rounded-lg shadow-md">
      <p class="text-slate-500">Busque y seleccione un médico para comenzar.</p>
    </div>

    <!-- Modal para crear/editar pedidos -->
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
import { ref, onMounted, onUnmounted, inject, h, markRaw, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { GiftIcon, ClipboardDocumentListIcon, CurrencyDollarIcon, CalendarIcon } from '@heroicons/vue/24/outline';
import PedidoEspecialModal from '../components/reclamos/PedidoEspecialModal.vue';
import StatCard from '../components/StatCard.vue';
import AutocompleteSearch from '../components/AutocompleteSearch.vue';

const medicosList = ref([]);
const selectedMedico = ref('');
const pedidos = ref([]);
const stats = ref({});
const loading = ref(false);
const toast = useToast();
const isModalVisible = ref(false);
const selectedPedido = ref(null);
const isSaving = ref(false);
const headerConfig = inject('header-config');
const medicoSearchTerm = ref('');

// Filtra la lista de médicos en el frontend para el autocompletado.
const filteredMedicos = computed(() => {
  if (!medicoSearchTerm.value) return [];
  return medicosList.value.filter(medico => 
    medico.toLowerCase().includes(medicoSearchTerm.value.toLowerCase())
  );
});

// Se ejecuta al seleccionar un médico de la lista.
const selectMedico = (medicoNombre) => {
  selectedMedico.value = medicoNombre;
  medicoSearchTerm.value = medicoNombre; // Sincroniza el input
  fetchDataForMedico();
};

const openModal = (pedido = null) => {
  selectedPedido.value = pedido;
  isModalVisible.value = true;
};
const closeModal = () => {
  isModalVisible.value = false;
  selectedPedido.value = null;
};

onMounted(async () => {
  headerConfig.value = {
    title: 'Análisis de Pedidos por Médico',
    buttons: [
      {
        text: 'Nuevo Pedido',
        action: () => openModal(),
        class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2',
        icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' },[h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' })])})
      }
    ]
  };

  try {
    const { data, error } = await supabase.rpc('get_medicos_con_pedidos');
    if (error) throw error;
    medicosList.value = data.map(m => m.nombre_medico);
  } catch (err) {
    toast.error('Error al cargar la lista de médicos.');
  }
});

onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const fetchDataForMedico = async () => {
  if (!selectedMedico.value) return;
  loading.value = true;
  pedidos.value = [];
  stats.value = {};
  try {
    const { data, error } = await supabase.rpc('get_pedidos_y_stats_por_medico', { p_medico_nombre: selectedMedico.value });
    if (error) throw error;
    pedidos.value = data.pedidos;
    stats.value = data.stats;
  } catch (err) {
    toast.error('Error al cargar los datos del médico: ' + err.message);
  } finally {
    loading.value = false;
  }
};

const handleSave = async (pedidoData) => {
  isSaving.value = true;
  try {
    const { error } = await supabase.from('pedidos_especiales').upsert(pedidoData);
    if (error) throw error;
    
    toast.success(`Pedido ${pedidoData.id ? 'actualizado' : 'creado'} con éxito.`);
    closeModal();
    
    if (!medicosList.value.includes(pedidoData.nombre_medico)) {
      medicosList.value.push(pedidoData.nombre_medico);
      medicosList.value.sort();
    }
    
    if (selectedMedico.value === pedidoData.nombre_medico) {
      fetchDataForMedico();
    }
  } catch (err) {
    toast.error("Error al guardar el pedido: " + err.message);
  } finally {
    isSaving.value = false;
  }
};

const handleDelete = async (pedido) => {
  if (!window.confirm(`¿Está seguro de que quiere eliminar el pedido #${pedido.id} del médico ${pedido.nombre_medico}? Esta acción no se puede deshacer.`)) {
    return;
  }
  
  try {
    const { error } = await supabase.rpc('delete_pedido_especial', { p_pedido_id: pedido.id });
    if (error) throw error;

    toast.success(`Pedido #${pedido.id} eliminado correctamente.`);
    pedidos.value = pedidos.value.filter(p => p.id !== pedido.id);
    await fetchDataForMedico();

  } catch (err) {
    toast.error('Error al eliminar el pedido: ' + err.message);
  }
};

const formatDate = (date) => date ? new Date(date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A';
const formatCurrency = (value) => value ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value) : '$0,00';
</script>

<style scoped>
.form-input { @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm dark:bg-slate-900 dark:border-slate-600; }
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400; }
.table-cell { @apply px-6 py-4 whitespace-nowrap text-gray-700 dark:text-slate-300; }
</style>