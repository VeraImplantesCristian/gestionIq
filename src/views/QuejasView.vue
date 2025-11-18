<!-- src/views/QuejasView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    
    <!-- Sección de Estadísticas -->
    <section class="mb-6">
      <div v-if="statsLoading" class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="h-28 bg-white dark:bg-slate-800 rounded-md shadow animate-pulse"></div>
        <div class="h-28 bg-white dark:bg-slate-800 rounded-md shadow animate-pulse"></div>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Reclamos Abiertos" 
          :value="stats.reclamos_abiertos ?? 0"
          :icon="ExclamationCircleIcon"
          icon-bg-class="bg-blue-100 dark:bg-blue-900/40"
          icon-class="text-blue-600 dark:text-blue-300"
        />
        <StatCard 
          title="Reclamos Críticos Activos" 
          :value="stats.reclamos_criticos ?? 0"
          :icon="ShieldExclamationIcon"
          icon-bg-class="bg-red-100 dark:bg-red-900/40"
          icon-class="text-red-600 dark:text-red-300"
        />
      </div>
    </section>

    <!-- Barra de Filtros -->
    <QuejasFilterBar @update-filters="applyFilters" />
    
    <div v-if="loading" class="space-y-4">
      <div v-for="n in 5" :key="n" class="h-16 bg-white dark:bg-slate-800 rounded-md shadow animate-pulse"></div>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-slate-800">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Fecha</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Médico</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Tipo</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Severidad</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Estado</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          <tr v-if="quejas.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron reclamos con los filtros actuales.</td>
          </tr>
          <tr v-for="queja in quejas" :key="queja.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ formatDate(queja.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ queja.nombre_medico }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ queja.tipo_reclamo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"><span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getSeveridadClass(queja.severidad)]">{{ queja.severidad }}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm"><span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getEstadoClass(queja.estado)]">{{ queja.estado }}</span></td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium"><button @click="openDetailsModal(queja)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Ver Detalles</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <GestionReclamoModal
      :show="isModalVisible"
      :queja="selectedQueja"
      :is-saving="isSaving"
      @close="closeDetailsModal"
      @save="handleSaveChanges"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { ExclamationCircleIcon, ShieldExclamationIcon } from '@heroicons/vue/24/outline';
import GestionReclamoModal from '../components/reclamos/GestionReclamoModal.vue';
import QuejasFilterBar from '../components/reclamos/QuejasFilterBar.vue';
import StatCard from '../components/StatCard.vue';

const quejas = ref([]);
const loading = ref(true);
const error = ref(null);
const toast = useToast();
const isModalVisible = ref(false);
const selectedQueja = ref(null);
const isSaving = ref(false);
const stats = ref({});
const statsLoading = ref(true);
const activeFilters = ref({});
const headerConfig = inject('header-config');
const openShareReclamoModal = inject('open-share-reclamo-modal-fn');

onMounted(() => {
  headerConfig.value = {
    title: 'Gestión de Reclamos',
    buttons: [
      {
        text: 'Compartir Link de Reclamo',
        action: openShareReclamoModal,
        class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2',
        icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' }) ]) })
      }
    ]
  };
  fetchStats();
});

onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const fetchStats = async () => {
  statsLoading.value = true;
  try {
    const { data, error } = await supabase.rpc('get_quejas_stats');
    if (error) throw error;
    stats.value = data[0];
  } catch (err) {
    toast.error("Error al cargar las estadísticas: " + err.message);
  } finally {
    statsLoading.value = false;
  }
};

const fetchQuejas = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      p_estado: activeFilters.value.estado === 'Todos' ? null : activeFilters.value.estado,
      p_severidad: activeFilters.value.severidad === 'Todas' ? null : activeFilters.value.severidad,
      p_medico: activeFilters.value.medico || null,
    };
    const { data, error: fetchError } = await supabase.rpc('get_quejas', params);
    if (fetchError) throw fetchError;
    quejas.value = data;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los reclamos: " + err.message);
  } finally {
    loading.value = false;
  }
};

const applyFilters = (newFilters) => {
  activeFilters.value = newFilters;
  fetchQuejas();
};

const openDetailsModal = (queja) => {
  selectedQueja.value = queja;
  isModalVisible.value = true;
};
const closeDetailsModal = () => {
  isModalVisible.value = false;
  selectedQueja.value = null;
};
const handleSaveChanges = async (updatedQueja) => {
  isSaving.value = true;
  try {
    const { id, estado, responsable_interno, resultado, observacion_interna } = updatedQueja;
    const updatePayload = {
      estado, responsable_interno, resultado, observacion_interna,
      fecha_resolucion: (estado === 'Resuelta' && !updatedQueja.fecha_resolucion) ? new Date().toISOString() : updatedQueja.fecha_resolucion
    };
    const { error: updateError } = await supabase.from('quejas').update(updatePayload).eq('id', id);
    if (updateError) throw updateError;
    toast.success(`Reclamo #${id} actualizado.`);
    closeDetailsModal();
    await Promise.all([fetchQuejas(), fetchStats()]);
  } catch (err) {
    toast.error(`Error al guardar: ${err.message}`);
  } finally {
    isSaving.value = false;
  }
};

const formatDate = (dateString) => new Date(dateString).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
const getSeveridadClass = (s) => ({ 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200': s === 'Baja', 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200': s === 'Media', 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200': s === 'Alta', 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200': s === 'Crítica' });
const getEstadoClass = (e) => ({ 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200': e === 'Abierta', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200': e === 'En Proceso', 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200': e === 'Resuelta', 'bg-gray-100 text-gray-800 dark:bg-slate-700 dark:text-slate-200': e === 'Cerrada' });
</script>