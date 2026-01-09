<!-- src/views/InstrumentadoresView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">{{ headerTitle }}</h1>
      <div v-if="activeTab === 'lista'">
        <button @click="openImportModal" class="btn-secondary mr-2">Importar XLS</button>
        <button @click="openNewModal" class="btn-primary">Nuevo Instrumentador</button>
      </div>
    </div>

    <!-- Sistema de Pestañas -->
    <div class="border-b border-gray-200 dark:border-slate-700">
      <nav class="-mb-px flex space-x-6" aria-label="Tabs">
        <button @click="activeTab = 'lista'" :class="getTabClass('lista')">
          Lista de Instrumentadores
        </button>
        <button @click="activeTab = 'ranking'" :class="getTabClass('ranking')">
          Ranking de Rendimiento
        </button>
      </nav>
    </div>

    <!-- Contenido de la Pestaña "Lista" -->
    <div v-show="activeTab === 'lista'" class="mt-6">
      <InstrumentadoresFilters 
        v-model="filters" 
        :export-disabled="loading || processedInstrumentadores.length === 0"
        @export="handleExport"
      />
      <div v-if="loading" class="space-y-4">
        <SkeletonLoader v-for="n in 5" :key="`skel-${n}`" />
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong>Error:</strong> <span class="block sm:inline">{{ error }}</span>
      </div>
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

    <!-- Contenido de la Pestaña "Ranking de Rendimiento" -->
    <div v-show="activeTab === 'ranking'" class="mt-6">
      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <input type="date" v-model="startDate" class="form-input"/>
          <input type="date" v-model="endDate" class="form-input"/>
          <button @click="fetchRankingData" :disabled="isRankingLoading" class="btn-primary h-full">
            Aplicar Filtros
          </button>
        </div>
      </div>
      <div v-if="isRankingLoading" class="text-center p-10">
        <p>Calculando KPIs de rendimiento...</p>
      </div>
      <div v-else-if="rankingError" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
        <p>Error al calcular el ranking: {{ rankingError }}</p>
      </div>
      <div v-else-if="rankingData.length === 0" class="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow">
        <p class="text-slate-500">No hay datos de cirugías enviadas en el período seleccionado.</p>
      </div>
      <div v-else class="space-y-3">
        <div class="grid grid-cols-12 gap-4 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">
          <div class="col-span-1">Pos.</div>
          <div class="col-span-3">Instrumentador</div>
          <div class="col-span-2 text-center">Puntaje IQ</div>
          <div class="col-span-6">KPIs de Rendimiento</div>
        </div>
        <div v-for="(instrumentador, index) in rankingData" :key="instrumentador.instrumentador_dni" class="ranking-row">
          <div class="col-span-1 flex items-center font-bold text-lg text-slate-600 dark:text-slate-300">{{ index + 1 }}</div>
          <div class="col-span-3">
            <p class="font-semibold text-slate-800 dark:text-slate-100">{{ instrumentador.nombre_completo }}</p>
            <p class="text-sm text-slate-500">{{ instrumentador.instrumentador_dni }}</p>
          </div>
          <div class="col-span-2 flex items-center justify-center">
            <div class="score-badge" :class="getScoreClass(instrumentador.puntaje_iq_promedio)">
              {{ instrumentador.puntaje_iq_promedio || 'N/A' }}
            </div>
          </div>
          <div class="col-span-6 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            <div class="kpi-item"><UserGroupIcon class="kpi-icon"/><span>Cirugías:</span><strong>{{ instrumentador.total_cirugias }}</strong></div>
            <div class="kpi-item"><CameraIcon class="kpi-icon"/><span>Fotos:</span><strong>{{ instrumentador.total_fotos_subidas }}</strong></div>
            <div class="kpi-item"><ClockIcon class="kpi-icon text-blue-500"/><span>Cierre (hs):</span><strong>{{ instrumentador.tiempo_cierre_promedio_horas }} hs</strong></div>
            <div class="kpi-item"><ClipboardDocumentListIcon class="kpi-icon text-green-500"/><span>Consumo (chars):</span><strong>{{ instrumentador.consumo_promedio_chars }}</strong></div>
            <div class="kpi-item"><ChatBubbleLeftRightIcon class="kpi-icon text-orange-500"/><span>Obs. (chars):</span><strong>{{ instrumentador.observaciones_promedio_chars }}</strong></div>
            <div class="kpi-item"><ExclamationTriangleIcon class="kpi-icon text-red-500"/><span>Informe Faltante:</span><strong>{{ instrumentador.tasa_informe_faltante === null ? 'N/A' : instrumentador.tasa_informe_faltante + '%' }}</strong></div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modales -->
  <EditInstrumentadorModal :show="isEditModalOpen" :instrumentador="selectedInstrumentador" @close="isEditModalOpen = false" @updated="handleUpdate"/>
  <EstadisticasInstrumentadorModal :show="isStatsModalOpen" :instrumentador="selectedInstrumentador" @close="isStatsModalOpen = false" />
  <NewInstrumentadorModal :show="isNewModalOpen" @close="isNewModalOpen = false" @created="handleUpdate"/>
  <ImportInstrumentadoresModal :show="isImportModalOpen" @close="isImportModalOpen = false" @imported="handleUpdate"/>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToasts } from '../composables/useToasts.js';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import SkeletonLoader from '../components/SkeletonLoader.vue';
import EditInstrumentadorModal from '../components/EditInstrumentadorModal.vue';
import EstadisticasInstrumentadorModal from '../components/EstadisticasInstrumentadorModal.vue';
import NewInstrumentadorModal from '../components/NewInstrumentadorModal.vue';
import ImportInstrumentadoresModal from '../components/ImportInstrumentadoresModal.vue';
import PaginationControls from '../components/PaginationControls.vue';
import InstrumentadoresFilters from '../components/InstrumentadoresFilters.vue';
import { KeyIcon, ChartBarIcon, UserGroupIcon, CameraIcon, ClockIcon, ChatBubbleLeftRightIcon, ClipboardDocumentListIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline';

const { showErrorToast } = useToasts();
const activeTab = ref('lista');

// --- Lógica para la Pestaña "Lista" ---
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
const isNewModalOpen = ref(false);
const isImportModalOpen = ref(false);
const openNewModal = () => { isNewModalOpen.value = true; };
const openImportModal = () => { isImportModalOpen.value = true; };

// --- Lógica para la Pestaña "Ranking" ---
const rankingData = ref([]);
const isRankingLoading = ref(false);
const rankingError = ref(null);
const setDefaultDates = () => {
  const endDateObj = new Date();
  const startDateObj = new Date();
  startDateObj.setDate(endDateObj.getDate() - 90);
  return { start: startDateObj.toISOString().split('T')[0], end: endDateObj.toISOString().split('T')[0] };
};
const startDate = ref(setDefaultDates().start);
const endDate = ref(setDefaultDates().end);

// --- Lógica Común y Métodos ---
const headerTitle = computed(() => activeTab.value === 'lista' ? 'Gestión de Instrumentadores' : 'Ranking de Rendimiento');

onMounted(() => {
  fetchInstrumentadores();
});

watch(activeTab, (newTab) => {
  if (newTab === 'ranking' && rankingData.value.length === 0) {
    fetchRankingData();
  }
});

const fetchInstrumentadores = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase.rpc('get_instrumentadores_con_stats');
    if (fetchError) throw fetchError;
    instrumentadores.value = data;
  } catch (err) {
    error.value = err.message;
    showErrorToast(err, "Error al cargar los instrumentadores.");
  } finally {
    loading.value = false;
  }
};

const fetchRankingData = async () => {
  isRankingLoading.value = true;
  rankingError.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('get_instrumentador_ranking_kpis', {
      p_start_date: startDate.value,
      p_end_date: endDate.value
    });
    if (rpcError) throw rpcError;
    rankingData.value = data || [];
  } catch (err) {
    rankingError.value = err.message;
    showErrorToast(err, "Error al calcular el ranking.");
  } finally {
    isRankingLoading.value = false;
  }
};

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

const getIvoColor = (score) => {
  if (score >= 8.0) {
    return 'text-green-500 dark:text-green-400';
  } else if (score >= 5.0) {
    return 'text-blue-500 dark:text-blue-400';
  } else if (score >= 3.0) {
    return 'text-yellow-500 dark:text-yellow-400';
  } else if (score >= 0) {
    return 'text-red-500 dark:text-red-400';
  }
  return 'text-gray-500 dark:text-gray-400';
};

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
};

function handleExport() {
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
  const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheet.sheet;charset=UTF-8' });
  const fileName = `Reporte_Instrumentadores_${new Date().toISOString().slice(0,10)}.xlsx`;
  saveAs(data, fileName);
}

const copyPermanentLink = async (instrumentador) => {
  let token = instrumentador.activity_token;
  try {
    if (!token) {
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
    // Aquí podrías usar showSuccessToast si lo importas desde useToasts
  } catch (err) {
    console.error('Error al copiar el enlace permanente:', err);
    showErrorToast(err, 'No se pudo procesar el enlace.');
  }
};

const getTabClass = (tabName) => [
  'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
  activeTab.value === tabName
    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
];

const getScoreClass = (score) => {
  if (score >= 4.5) return 'score-high';
  if (score >= 3.5) return 'score-medium';
  if (score > 0) return 'score-low';
  return 'score-none';
};
</script>

<style scoped>
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400 select-none; }
.action-button { @apply p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors; }
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400; }
.btn-secondary { @apply bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-50 dark:hover:bg-slate-600; }
.ranking-row { @apply bg-white dark:bg-slate-800 shadow-sm rounded-lg p-4 grid grid-cols-12 gap-4 items-center; }
.score-badge { @apply text-2xl font-bold w-16 h-16 flex items-center justify-center rounded-full; }
.score-high { @apply bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300; }
.score-medium { @apply bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300; }
.score-low { @apply bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300; }
.score-none { @apply bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400; }
.kpi-item { @apply flex items-center gap-2 text-slate-600 dark:text-slate-300; }
.kpi-item strong { @apply font-semibold text-slate-800 dark:text-slate-100; }
.kpi-icon { @apply w-4 h-4 text-slate-400; }
</style>