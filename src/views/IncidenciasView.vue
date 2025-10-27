<!-- src/views/IncidenciasView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">Gestión de Incidencias</h1>
      <div class="flex items-center space-x-3">
        <button 
          @click="exportPDF" 
          :disabled="isExporting"
          class="bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 font-bold py-2 px-4 rounded-lg shadow hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-wait"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          <span>{{ isExporting ? 'Generando...' : 'Exportar a PDF' }}</span>
        </button>
        <button @click="isModalOpen = true" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
          <span>Nueva Incidencia</span>
        </button>
      </div>
    </div>

    <IncidenceFilterBar 
      @update-filters="applyFilters" 
      :instrumentadores="instrumentadoresList"
    />

    <div v-if="loading" class="space-y-4">
      <SkeletonLoader v-for="n in 5" :key="n" />
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Fecha</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Reportado Por</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Tipo</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Estado</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          <tr v-if="incidencias.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron incidencias con los filtros actuales.</td>
          </tr>
          <tr v-for="incidencia in incidencias" :key="incidencia.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ new Date(incidencia.created_at).toLocaleDateString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ incidencia.reportado_por || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ incidencia.tipo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', {
                'bg-yellow-100 text-yellow-800': incidencia.estado === 'Abierta',
                'bg-green-100 text-green-800': incidencia.estado === 'Resuelta',
              }]">{{ incidencia.estado }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="openDrawer(incidencia)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Ver Detalles</button>
            </td>
          </tr>
        </tbody>
      </table>
      <PaginationControls 
        v-if="totalIncidencias > 0"
        :current-page="currentPage"
        :total-items="totalIncidencias"
        :items-per-page="itemsPerPage"
        @page-changed="goToPage"
      />
    </div>
  </div>

  <NewIncidenceModal 
    :show="isModalOpen" 
    :reportes="recentReportes"
    :instrumentadores="instrumentadoresList"
    @close="isModalOpen = false"
    @incidence-created="handleIncidenceCreated"
    @instrumentador-created="handleInstrumentadorCreated"
  />

  <!-- 
    === MODIFICADO ===
    Añadimos el listener para el evento '@updated'.
    Cuando el Drawer emita 'updated', llamaremos a la función fetchData.
  -->
  <IncidenceDrawer
    :show="isDrawerOpen"
    :incidencia="selectedIncidencia"
    @close="isDrawerOpen = false"
    @updated="fetchData"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import NewIncidenceModal from '../components/NewIncidenceModal.vue';
import IncidenceFilterBar from '../components/IncidenceFilterBar.vue';
import PaginationControls from '../components/PaginationControls.vue';
import IncidenceDrawer from '../components/IncidenceDrawer.vue';
import { generateIncidencesPDF } from '../services/pdfGenerator.js';

const toast = useToast();

const incidencias = ref([]);
const loading = ref(true);
const error = ref(null);
const isModalOpen = ref(false);
const recentReportes = ref([]);
const activeFilters = ref({});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalIncidencias = ref(0);
const instrumentadoresList = ref([]);
const isDrawerOpen = ref(false);
const selectedIncidencia = ref(null);
const isExporting = ref(false);

const fetchData = async () => {
  loading.value = true;
  error.value = null;
  try {
    if (recentReportes.value.length === 0 || instrumentadoresList.value.length === 0) {
      const [reportesRes, iqRes] = await Promise.all([
        supabase.from('reportes').select('id, paciente, medico, fecha_cirugia, instrumentador_dni').order('created_at', { ascending: false }).limit(50),
        supabase.from('instrumentadores').select('*')
      ]);
      if (reportesRes.error) throw reportesRes.error;
      if (iqRes.error) throw iqRes.error;
      recentReportes.value = reportesRes.data;
      instrumentadoresList.value = iqRes.data;
    }

    let query = supabase
      .from('incidencias')
      .select(`*, reportes (paciente, medico), instrumentadores (nombre_completo)`, { count: 'exact' });

    if (activeFilters.value.instrumentadorDni) query = query.eq('instrumentador_dni', activeFilters.value.instrumentadorDni);
    if (activeFilters.value.type) query = query.eq('tipo', activeFilters.value.type);
    if (activeFilters.value.status) query = query.eq('estado', activeFilters.value.status);
    if (activeFilters.value.startDate) query = query.gte('created_at', activeFilters.value.startDate);
    if (activeFilters.value.endDate) query = query.lte('created_at', `${activeFilters.value.endDate}T23:59:59`);

    const from = (currentPage.value - 1) * itemsPerPage.value;
    const to = from + itemsPerPage.value - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error: incidenciasError, count } = await query;
    if (incidenciasError) throw incidenciasError;

    incidencias.value = data;
    totalIncidencias.value = count;

  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los datos: " + err.message);
  } finally {
    loading.value = false;
  }
};

const exportPDF = async () => {
  isExporting.value = true;
  try {
    let query = supabase
      .from('incidencias')
      .select(`*, reportes (paciente, medico), instrumentadores (nombre_completo)`);

    if (activeFilters.value.instrumentadorDni) query = query.eq('instrumentador_dni', activeFilters.value.instrumentadorDni);
    if (activeFilters.value.type) query = query.eq('tipo', activeFilters.value.type);
    if (activeFilters.value.status) query = query.eq('estado', activeFilters.value.status);
    if (activeFilters.value.startDate) query = query.gte('created_at', activeFilters.value.startDate);
    if (activeFilters.value.endDate) query = query.lte('created_at', `${activeFilters.value.endDate}T23:59:59`);
    
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) throw error;

    if (data.length === 0) {
      toast.info("No hay incidencias para exportar con los filtros actuales.");
      return;
    }

    generateIncidencesPDF(data);

  } catch (err) {
    toast.error("Error al generar el PDF: " + err.message);
  } finally {
    isExporting.value = false;
  }
};

const fetchInstrumentadores = async () => {
  const { data, error } = await supabase.from('instrumentadores').select('*');
  if (error) {
    toast.error('Error al recargar la lista de instrumentadores: ' + error.message);
  } else {
    instrumentadoresList.value = data;
  }
};

const applyFilters = (newFilters) => {
  activeFilters.value = newFilters;
  currentPage.value = 1;
  fetchData();
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchData();
};

const handleIncidenceCreated = () => {
  fetchData();
};

const handleInstrumentadorCreated = () => {
  fetchInstrumentadores();
};

const openDrawer = (incidencia) => {
  selectedIncidencia.value = incidencia;
  isDrawerOpen.value = true;
};

onMounted(fetchData);
</script>