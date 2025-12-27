<!-- src/views/InstrumentadoresView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <InstrumentadoresFilters 
      v-model="filters" 
      :export-disabled="loading || processedInstrumentadores.length === 0"
      @export="handleExport"
    />

    <!-- Estado de Carga -->
    <div v-if="loading" class="space-y-4">
      <SkeletonLoader v-for="n in 5" :key="`skel-${n}`" />
    </div>

    <!-- Estado de Error -->
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <!-- Contenido Principal: Tabla y Paginación -->
    <div v-else class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead class="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" class="table-header">Nombre Completo</th>
              <th scope="col" class="table-header text-center">Teléfono</th>
              <th scope="col" class="table-header text-center">Fichas Enviadas</th>
              <th scope="col" class="table-header text-center">IVO (90d)</th>
              <th scope="col" class="table-header text-center">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            <tr v-if="paginatedInstrumentadores.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron instrumentadores que coincidan con los filtros.</td>
            </tr>
            <tr v-for="iq in paginatedInstrumentadores" :key="iq.dni">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ capitalizeName(iq.nombre_completo) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-center">{{ iq.telefono || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-center">{{ iq.fichas_enviadas }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-center" :class="getIvoColor(iq.ivo_score)">
                {{ iq.ivo_score.toFixed(2) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 text-center">
                <div class="inline-flex items-center rounded-md shadow-sm bg-slate-100 dark:bg-slate-700/50 p-0.5">
                  <button @click="openStatsModal(iq)" title="Ver estadísticas operativas" class="action-button">
                    <ChartBarIcon class="h-5 w-5" />
                  </button>
                  <button @click="copyPermanentLink(iq)" title="Copiar enlace de acceso permanente" class="action-button">
                    <KeyIcon class="h-5 w-5" />
                  </button>
                </div>
                <button @click="openEditModal(iq)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <PaginationControls 
        v-if="totalItems > itemsPerPage" 
        :current-page="currentPage" 
        :total-items="totalItems" 
        :items-per-page="itemsPerPage" 
        @page-changed="goToPage" 
      />
    </div>
  </div>

  <!-- Modales -->
  <EditInstrumentadorModal :show="isEditModalOpen" :instrumentador="selectedInstrumentador" @close="isEditModalOpen = false" @updated="handleUpdate"/>
  <EstadisticasInstrumentadorModal :show="isStatsModalOpen" :instrumentador="selectedInstrumentador" @close="isStatsModalOpen = false" />
  <NewInstrumentadorModal :show="isNewModalOpen" @close="isNewModalOpen = false" @created="handleUpdate"/>
  <ImportInstrumentadoresModal :show="isImportModalOpen" @close="isImportModalOpen = false" @imported="handleUpdate"/>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw, computed, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import SkeletonLoader from '../components/SkeletonLoader.vue';
import EditInstrumentadorModal from '../components/EditInstrumentadorModal.vue';
import EstadisticasInstrumentadorModal from '../components/EstadisticasInstrumentadorModal.vue';
import NewInstrumentadorModal from '../components/NewInstrumentadorModal.vue';
import ImportInstrumentadoresModal from '../components/ImportInstrumentadoresModal.vue';
import PaginationControls from '../components/PaginationControls.vue';
import InstrumentadoresFilters from '../components/InstrumentadoresFilters.vue';
import { KeyIcon, ChartBarIcon } from '@heroicons/vue/24/outline';

const headerConfig = inject('header-config');
const isNewModalOpen = ref(false);
const isImportModalOpen = ref(false);
const openNewModal = () => { isNewModalOpen.value = true; };
const openImportModal = () => { isImportModalOpen.value = true; };

onMounted(() => {
  headerConfig.value = {
    title: 'Gestión de Instrumentadores',
    buttons: [
      { text: 'Importar XLS', action: openImportModal, class: 'bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-emerald-700 flex items-center space-x-2', icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' }) ]) }) },
      { text: 'Nuevo Instrumentador', action: openNewModal, class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2', icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' }) ]) }) }
    ]
  };
  fetchInstrumentadores();
});
onUnmounted(() => { headerConfig.value = { title: '', buttons: [] }; });

const toast = useToast();
const instrumentadores = ref([]);
const loading = ref(true);
const error = ref(null);
const isEditModalOpen = ref(false);
const isStatsModalOpen = ref(false);
const selectedInstrumentador = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);

const filters = ref({
  searchTerm: '',
  sortBy: 'nombre_completo',
  sortDir: 'asc',
  minIvo: '',
  maxIvo: '',
});

const capitalizeName = (name) => {
  if (!name) return '';
  return name.replace(/\b\w/g, char => char.toUpperCase());
};

const processedInstrumentadores = computed(() => {
  let processed = [...instrumentadores.value];
  if (filters.value.searchTerm) {
    const term = filters.value.searchTerm.toLowerCase();
    processed = processed.filter(iq => 
      iq.nombre_completo.toLowerCase().includes(term) ||
      (iq.dni && String(iq.dni).toLowerCase().includes(term))
    );
  }
  if (filters.value.minIvo) {
    processed = processed.filter(iq => iq.ivo_score >= parseFloat(filters.value.minIvo));
  }
  if (filters.value.maxIvo) {
    processed = processed.filter(iq => iq.ivo_score <= parseFloat(filters.value.maxIvo));
  }
  processed.sort((a, b) => {
    let valA = a[filters.value.sortBy];
    let valB = b[filters.value.sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();
    let comparison = 0;
    if (valA > valB) comparison = 1;
    else if (valA < valB) comparison = -1;
    return filters.value.sortDir === 'asc' ? comparison : -comparison;
  });
  return processed;
});

const paginatedInstrumentadores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return processedInstrumentadores.value.slice(start, end);
});

const totalItems = computed(() => processedInstrumentadores.value.length);

watch(filters, () => {
  currentPage.value = 1;
}, { deep: true });

const goToPage = (page) => {
  currentPage.value = page;
};

const fetchInstrumentadores = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase.rpc('get_instrumentadores_con_stats');
    if (fetchError) throw fetchError;
    instrumentadores.value = data;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los instrumentadores: " + err.message);
  } finally {
    loading.value = false;
  }
};

// --- INICIO DE LA MODIFICACIÓN ---
// Se actualiza esta función para que los colores y umbrales coincidan
// con las 4 categorías definidas (Destacado, Correcto, Inestable, Crítico).
const getIvoColor = (score) => {
  if (score >= 8.0) { // Destacado
    return 'text-green-500 dark:text-green-400';
  } else if (score >= 5.0) { // Correcto
    return 'text-blue-500 dark:text-blue-400';
  } else if (score >= 3.0) { // Inestable
    return 'text-yellow-500 dark:text-yellow-400';
  } else if (score >= 0) { // Crítico
    return 'text-red-500 dark:text-red-400';
  }
  // Por defecto, para puntajes 0 o negativos (si fuera posible)
  return 'text-gray-500 dark:text-gray-400';
};
// --- FIN DE LA MODIFICACIÓN ---

const openEditModal = (instrumentador) => {
  selectedInstrumentador.value = instrumentador;
  isEditModalOpen.value = true;
};

const openStatsModal = (instrumentador) => {
  selectedInstrumentador.value = instrumentador;
  isStatsModalOpen.value = true;
};

const handleUpdate = () => {
  fetchInstrumentadores();
  toast.success('Lista de instrumentadores actualizada.');
};

function handleExport() {
  toast.info("Generando reporte de Excel...", { timeout: 2000 });
  const dataToExport = processedInstrumentadores.value.map(iq => ({
    'Nombre Completo': capitalizeName(iq.nombre_completo),
    'DNI': iq.dni,
    'Teléfono': iq.telefono || 'N/A',
    'Fichas Enviadas (Total)': iq.fichas_enviadas,
    'IVO (90 días)': parseFloat(iq.ivo_score.toFixed(2))
  }));
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Instrumentadores');
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8' });
  const fileName = `Reporte_Instrumentadores_${new Date().toISOString().slice(0,10)}.xlsx`;
  saveAs(data, fileName);
}

const copyPermanentLink = async (instrumentador) => {
  let token = instrumentador.activity_token;
  const loadingToastId = toast.info("Procesando enlace...", { timeout: false });
  try {
    if (!token) {
      toast.update(loadingToastId, { content: "Generando nuevo enlace permanente..." });
      const { data: newToken, error: rpcError } = await supabase.rpc('generar_activity_token', { p_instrumentador_dni: instrumentador.dni });
      if (rpcError) throw rpcError;
      if (!newToken) throw new Error('La base de datos no devolvió el nuevo token.');
      token = newToken;
      const instIndex = instrumentadores.value.findIndex(i => i.dni === instrumentador.dni);
      if (instIndex !== -1) {
        instrumentadores.value[instIndex].activity_token = token;
      }
    }
    const url = `${window.location.origin}/resumen/${token}`;
    await navigator.clipboard.writeText(url);
    toast.update(loadingToastId, { content: "¡Enlace de acceso permanente copiado!", options: { type: 'success', timeout: 3000 } });
  } catch (err) {
    console.error('Error al copiar el enlace permanente:', err);
    toast.update(loadingToastId, { content: `No se pudo procesar el enlace: ${err.message}`, options: { type: 'error', timeout: 5000 } });
  }
};
</script>

<style scoped>
.table-header {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400 select-none;
}
.action-button {
  @apply p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors;
}
</style>