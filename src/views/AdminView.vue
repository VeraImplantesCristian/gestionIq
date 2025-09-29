<!-- src/views/AdminView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">Panel de Administración</h1>
        <div class="flex items-center space-x-4">
          <!-- **NUEVO:** Botón para ir a Estadísticas -->
          <router-link to="/estadisticas" class="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg shadow hover:bg-gray-100 flex items-center space-x-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
             <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            <span>Estadísticas</span>
          </router-link>
          
          <button @click="openNewSurgeryModal" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            <span>Nueva Cirugía</span>
          </button>
          
          <button @click="handleLogout" class="p-2 text-gray-500 rounded-full hover:bg-gray-200 dark:text-slate-400 dark:hover:bg-slate-700" title="Cerrar Sesión">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </div>
      </div>

      <FilterBar @update-filters="applyFilters" />

      <div v-if="loading" class="space-y-4">
        <SkeletonLoader v-for="n in 5" :key="`skel-${n}`" />
      </div>
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>
      <div v-else>
        <div class="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden dark:bg-slate-800">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
             <thead class="bg-gray-50 dark:bg-slate-700">
              <tr>
                <th scope="col" class="p-4"><input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected" class="h-4 w-4 text-blue-600 rounded border-gray-300 dark:bg-slate-600 dark:border-slate-500"></th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Paciente</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Médico</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Instrumentador</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Estado</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
              <tr v-if="reportes.length === 0"><td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron reportes con los filtros actuales.</td></tr>
              <tr v-for="reporte in reportes" :key="reporte.id">
                <td class="p-4"><input type="checkbox" v-model="selectedReportIds" :value="reporte.id" class="h-4 w-4 text-blue-600 rounded border-gray-300 dark:bg-slate-600 dark:border-slate-500"></td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ reporte.paciente }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.medico }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.instrumentador_completado || 'N/A' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', {
                    'bg-green-100 text-green-800': reporte.estado === 'Enviado',
                    'bg-yellow-100 text-yellow-800': reporte.estado === 'Pendiente',
                    'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200': reporte.estado === 'Expirado',
                  }]">{{ reporte.estado || 'Pendiente' }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button v-if="!reporte.token" @click="generarLink(reporte)" :disabled="generatingLinkId === reporte.id" class="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-wait dark:text-indigo-400 dark:hover:text-indigo-300">{{ generatingLinkId === reporte.id ? 'Generando...' : 'Generar Link' }}</button>
                  <button v-else @click="copiarLink(reporte)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Copiar Link</button>
                  <a href="#" @click.prevent="openDrawer(reporte)" class="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200">Ver Detalles</a>
                </td>
              </tr>
            </tbody>
          </table>
          <PaginationControls v-if="totalReportes > 0" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
        </div>
        <div class="sm:hidden space-y-4">
          <p v-if="reportes.length === 0" class="text-center text-gray-500 py-10">No se encontraron reportes.</p>
          <ReportCard v-for="reporte in reportes" :key="reporte.id" :reporte="reporte" :is-generating="generatingLinkId === reporte.id" :selected="selectedReportIds.includes(reporte.id)" @generate="generarLink" @copy="copiarLink" @details="openDrawer" @toggle-select="toggleSelection"/>
          <PaginationControls v-if="totalReportes > 0" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
        </div>
      </div>
    </div>
    
    <Transition name="slide-up">
      <div v-if="selectedReportIds.length > 0" class="fixed bottom-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-20">
        <div class="max-w-7xl mx-auto p-4 flex justify-between items-center">
          <span class="font-semibold">{{ selectedReportIds.length }} seleccionado(s)</span>
          <div class="space-x-4">
            <button @click="expireSelectedLinks" class="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium">Expirar Links</button>
            <button @click="exportToCSV" class="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-md text-sm font-medium">Exportar a CSV</button>
          </div>
        </div>
      </div>
    </Transition>
    
    <NewSurgeryModal :show="isNewSurgeryModalVisible" @close="closeNewSurgeryModal" @surgery-created="handleSurgeryCreated"/>
    <ReportDrawer :show="isDrawerVisible" :reporte="selectedReporte" @close="closeDrawer"/>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../services/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'vue-toastification';

import FilterBar from '../components/FilterBar.vue';
import PaginationControls from '../components/PaginationControls.vue';
import NewSurgeryModal from '../components/NewSurgeryModal.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import ReportCard from '../components/ReportCard.vue';

const router = useRouter();
const toast = useToast();
const activeFilters = ref({});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalReportes = ref(0);
const selectedReportIds = ref([]);
const reportes = ref([]);
const loading = ref(true);
const error = ref(null);
const generatingLinkId = ref(null);
const isNewSurgeryModalVisible = ref(false);
const isDrawerVisible = ref(false);
const selectedReporte = ref(null);

const isAllSelected = computed(() => reportes.value.length > 0 && selectedReportIds.value.length === reportes.value.length);

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    toast.error('Error al cerrar sesión: ' + error.message);
  } else {
    router.push('/login');
  }
};

const fetchReportes = async () => {
  loading.value = true;
  error.value = null;
  try {
    let query = supabase.from('reportes').select('*', { count: 'exact' });

    if (activeFilters.value.statusFilter && activeFilters.value.statusFilter !== 'todos') {
      query = query.eq('estado', activeFilters.value.statusFilter);
    }
    if (activeFilters.value.searchTerm?.trim()) {
      const search = activeFilters.value.searchTerm.trim();
      query = query.or(`paciente.ilike.%${search}%,medico.ilike.%${search}%`);
    }
    if (activeFilters.value.instrumentador?.trim()) {
      query = query.ilike('instrumentador_completado', `%${activeFilters.value.instrumentador.trim()}%`);
    }
    if (activeFilters.value.startDate) {
      query = query.gte('fecha_cirugia', activeFilters.value.startDate);
    }
    if (activeFilters.value.endDate) {
      query = query.lte('fecha_cirugia', activeFilters.value.endDate);
    }

    const from = (currentPage.value - 1) * itemsPerPage.value;
    const to = from + itemsPerPage.value - 1;
    query = query.range(from, to).order('created_at', { ascending: false });

    const { data, error: fetchError, count } = await query;
    if (fetchError) throw fetchError;
    
    reportes.value = data;
    totalReportes.value = count;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los reportes: " + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReportes);

const applyFilters = (newFilters) => {
  activeFilters.value = newFilters;
  currentPage.value = 1;
  fetchReportes();
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchReportes();
};

const toggleSelectAll = (event) => {
  selectedReportIds.value = event.target.checked ? reportes.value.map(r => r.id) : [];
};

const toggleSelection = (reporteId) => {
  const index = selectedReportIds.value.indexOf(reporteId);
  if (index > -1) selectedReportIds.value.splice(index, 1);
  else selectedReportIds.value.push(reporteId);
};

const expireSelectedLinks = async () => {
  const count = selectedReportIds.value.length;
  if (count === 0) return;
  if (!window.confirm(`¿Estás seguro de que quieres expirar ${count} link(s) seleccionados? Esta acción cambiará su estado a 'Expirado'.`)) {
    return;
  }
  try {
    const { error } = await supabase
      .from('reportes')
      .update({ estado: 'Expirado', token: null })
      .in('id', selectedReportIds.value);
    
    if (error) throw error;
    
    toast.success(`${count} link(s) han sido expirados.`);
    selectedReportIds.value = [];
    fetchReportes();
  } catch (err) {
    toast.error(`Error al expirar los links: ${err.message}`);
  }
};

const exportToCSV = () => {
  const selected = reportes.value.filter(r => selectedReportIds.value.includes(r.id));
  if (selected.length === 0) return;
  const headers = Object.keys(selected[0]);
  const csvRows = [headers.join(',')];
  selected.forEach(row => {
    const values = headers.map(header => `"${('' + row[header]).replace(/"/g, '\\"')}"`);
    csvRows.push(values.join(','));
  });
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', `reportes_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  selectedReportIds.value = [];
  toast.success("Exportación a CSV completada.");
};

const openNewSurgeryModal = () => { isNewSurgeryModalVisible.value = true; };
const closeNewSurgeryModal = () => { isNewSurgeryModalVisible.value = false; };
const openDrawer = (reporte) => { selectedReporte.value = reporte; isDrawerVisible.value = true; };
const closeDrawer = () => { isDrawerVisible.value = false; };

const handleSurgeryCreated = (newSurgery) => {
  toast.success("¡Cirugía creada con éxito!");
  fetchReportes();
};

const generarLink = async (reporte) => {
  generatingLinkId.value = reporte.id;
  try {
    const nuevoToken = uuidv4();
    const { error: updateError } = await supabase.from('reportes').update({ token: nuevoToken }).eq('id', reporte.id);
    if (updateError) throw updateError;
    reporte.token = nuevoToken;
    const linkCompleto = `${window.location.origin}/ficha/${nuevoToken}`;
    await navigator.clipboard.writeText(linkCompleto);
    toast.success("¡Link generado y copiado!");
  } catch (error) {
    toast.error(`Error al generar el link: ${error.message}`);
  } finally {
    generatingLinkId.value = null;
  }
};

const copiarLink = async (reporte) => {
  const linkCompleto = `${window.location.origin}/ficha/${reporte.token}`;
  try {
    await navigator.clipboard.writeText(linkCompleto);
    toast.success("¡Link copiado al portapapeles!");
  } catch (err) {
    toast.error("No se pudo copiar el link.");
  }
};
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>