<!-- src/views/AdminView.vue (VERSIÓN FINAL DEFINITIVA CON MODAL DE EXPORTACIÓN) -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <FilterBar 
      @update-filters="applyFilters" 
      @export-pdf="exportFilteredToPDF"
      @export-traceability="handleExportTraceability"
      :is-exporting="isExporting"
    />

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
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Paciente</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Médico</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Instrumentador</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Fecha Cirugía</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Estado</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            <tr v-if="reportes.length === 0"><td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron reportes.</td></tr>
            <tr v-for="reporte in reportes" :key="reporte.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ reporte.paciente }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.medico }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.instrumentador_completado || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ formatDate(reporte.fecha_cirugia) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', {
                  'bg-green-100 text-green-800': reporte.estado === 'Enviado',
                  'bg-yellow-100 text-yellow-800': reporte.estado === 'Pendiente',
                  'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200': reporte.estado === 'Expirado',
                }]">{{ reporte.estado || 'Pendiente' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                <button @click="openGenerateLinkModal(reporte)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Compartir</button>
                <a href="#" @click.prevent="openDrawer(reporte)" class="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200">Detalles</a>
                <button @click="expireSingleLink(reporte)" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">Expirar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationControls v-if="totalReportes > 0" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>

      <div class="sm:hidden space-y-4">
        <p v-if="reportes.length === 0" class="text-center text-gray-500 py-10">No se encontraron reportes.</p>
        <ReportCard v-for="reporte in reportes" :key="reporte.id" :reporte="reporte" :is-generating="generatingLinkId === reporte.id" @share="openGenerateLinkModal" @details="openDrawer" @expire="expireSingleLink"/>
        <PaginationControls v-if="totalReportes > 0" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>
    </div>
    
    <NewSurgeryModal :show="isNewSurgeryModalVisible" @close="closeNewSurgeryModal" @surgery-created="handleSurgeryCreated"/>
    <ReportDrawer :show="isDrawerVisible" :reporte="selectedReporte" @close="closeDrawer" @updated="fetchReportes" />
    <GenerateLinkModal :show="isGenerateLinkModalVisible" :reporte="selectedReporte" :is-generating="generatingLinkId === selectedReporte?.id" @close="closeGenerateLinkModal" @generate="handleGenerateLink" />
    <ExportModal :show="isExportModalVisible" @close="isExportModalVisible = false" @generate="generateFullReport" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw } from 'vue';
import { supabase } from '../services/supabase.js';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from 'vue-toastification';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { generateTraceabilityReport } from '../services/reportGeneratorService.js';

import FilterBar from '../components/FilterBar.vue';
import PaginationControls from '../components/PaginationControls.vue';
import NewSurgeryModal from '../components/NewSurgeryModal.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import ReportCard from '../components/ReportCard.vue';
import GenerateLinkModal from '../components/GenerateLinkModal.vue';
import ExportModal from '../components/ExportModal.vue';

const headerConfig = inject('header-config');
const openNewSurgeryModal = () => { isNewSurgeryModalVisible.value = true; };
onMounted(() => {
  headerConfig.value = {
    title: 'Panel de Cirugías',
    buttons: [{ text: 'Nueva Cirugía', action: openNewSurgeryModal, class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2', icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' })])}) }]
  };
});
onUnmounted(() => { headerConfig.value = { title: '', buttons: [] }; });

const toast = useToast();
const activeFilters = ref({});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalReportes = ref(0);
const reportes = ref([]);
const loading = ref(true);
const error = ref(null);
const isExporting = ref(false);
const isExportModalVisible = ref(false);
const generatingLinkId = ref(null);
const isNewSurgeryModalVisible = ref(false);
const isDrawerVisible = ref(false);
const selectedReporte = ref(null);
const isGenerateLinkModalVisible = ref(false);

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const fetchReportes = async () => {
  loading.value = true;
  error.value = null;
  try {
    let query = supabase.from('reportes').select(`*, instrumentadores (nombre_completo, dni)`, { count: 'exact' });
    if (activeFilters.value.statusFilter && activeFilters.value.statusFilter !== 'todos') { query = query.eq('estado', activeFilters.value.statusFilter); }
    if (activeFilters.value.paciente?.trim()) { query = query.ilike('paciente', `%${activeFilters.value.paciente.trim()}%`); }
    if (activeFilters.value.medico?.trim()) { query = query.ilike('medico', `%${activeFilters.value.medico.trim()}%`); }
    if (activeFilters.value.startDate) { query = query.gte('fecha_cirugia', activeFilters.value.startDate); }
    if (activeFilters.value.endDate) {
      const endDate = new Date(activeFilters.value.endDate);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('fecha_cirugia', endDate.toISOString());
    }
    const from = (currentPage.value - 1) * itemsPerPage.value;
    const to = from + itemsPerPage.value - 1;
    query = query.range(from, to).order('created_at', { ascending: false });
    const { data, error: fetchError, count } = await query;
    if (fetchError) throw fetchError;
    const reportesParchados = await Promise.all(data.map(async (reporte) => {
      if (reporte.instrumentador_completado && !reporte.instrumentador_dni) {
        const { data: instrumentadorEncontrado } = await supabase.from('instrumentadores').select('dni').eq('nombre_completo', reporte.instrumentador_completado.trim()).single();
        if (instrumentadorEncontrado) { 
          return { ...reporte, instrumentador_dni: instrumentadorEncontrado.dni }; 
        }
      }
      return reporte;
    }));
    reportes.value = reportesParchados;
    totalReportes.value = count;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los reportes: " + err.message);
  } finally {
    loading.value = false;
  }
};
onMounted(fetchReportes);

const buildQueryForExport = async (filters) => {
  try {
    let query = supabase.from('reportes').select(`*, instrumentadores (nombre_completo, dni)`);
    if (filters.statusFilter && filters.statusFilter !== 'todos') { query = query.eq('estado', filters.statusFilter); }
    if (filters.paciente?.trim()) { query = query.ilike('paciente', `%${filters.paciente.trim()}%`); }
    if (filters.medico?.trim()) { query = query.ilike('medico', `%${filters.medico.trim()}%`); }
    if (filters.startDate) { query = query.gte('fecha_cirugia', filters.startDate); }
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('fecha_cirugia', endDate.toISOString());
    }
    query = query.order('created_at', { ascending: false });
    const { data, error: fetchError } = await query;
    if (fetchError) throw fetchError;
    return data;
  } catch (err) {
    toast.error("Error al obtener los datos para exportar: " + err.message);
    return null;
  }
};

const applyFilters = (newFilters) => { activeFilters.value = newFilters; currentPage.value = 1; fetchReportes(); };
const goToPage = (page) => { currentPage.value = page; fetchReportes(); };

const exportFilteredToPDF = async () => {
  isExporting.value = true;
  try {
    const allReportes = await buildQueryForExport(activeFilters.value);
    if (!allReportes || allReportes.length === 0) return toast.info("No hay datos para exportar.");
    
    const doc = new jsPDF();
    doc.text("Listado de Cirugías", 14, 15);
    autoTable(doc, {
      head: [["Paciente", "Médico", "Instrumentador", "Fecha Cirugía", "Estado"]],
      body: allReportes.map(r => [r.paciente || 'N/A', r.medico || 'N/A', r.instrumentador_completado || 'N/A', formatDate(r.fecha_cirugia), r.estado || 'N/A']),
      startY: 20,
    });
    doc.save(`Reporte_Cirugias_${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("Exportación completada.");
  } finally {
    isExporting.value = false;
  }
};

const handleExportTraceability = () => {
  isExportModalVisible.value = true;
};

const generateFullReport = async ({ startDate, endDate }) => {
  isExportModalVisible.value = false;
  isExporting.value = true;
  try {
    const exportFilters = {
      ...activeFilters.value,
      startDate,
      endDate
    };

    const allReportes = await buildQueryForExport(exportFilters);
    if (!allReportes || allReportes.length === 0) {
      return toast.info("No se encontraron reportes en el rango de fechas seleccionado.");
    }
    
    generateTraceabilityReport(allReportes, exportFilters);
    toast.success("Reporte de trazabilidad generado con éxito.");
  } catch (err) {
    console.error("Error al generar el reporte:", err);
    toast.error("Hubo un error al generar el reporte.");
  } finally {
    isExporting.value = false;
  }
};

const expireSingleLink = async (reporte) => {
  if (!reporte || !window.confirm(`¿Seguro que quieres expirar el link para "${reporte.paciente}"?`)) return;
  try {
    const { error } = await supabase.from('reportes').update({ estado: 'Expirado', token: null }).eq('id', reporte.id);
    if (error) throw error;
    toast.success(`El link para "${reporte.paciente}" ha sido expirado.`);
    fetchReportes();
  } catch (err) {
    toast.error(`Error al expirar el link: ${err.message}`);
  }
};

const closeNewSurgeryModal = () => { isNewSurgeryModalVisible.value = false; };
const openDrawer = (reporte) => { selectedReporte.value = reporte; isDrawerVisible.value = true; };
const closeDrawer = () => { isDrawerVisible.value = false; };
const handleSurgeryCreated = () => { toast.success("¡Cirugía creada con éxito!"); fetchReportes(); };
const openGenerateLinkModal = (reporte) => { selectedReporte.value = reporte; isGenerateLinkModalVisible.value = true; };
const closeGenerateLinkModal = () => { isGenerateLinkModalVisible.value = false; };
const handleGenerateLink = async (regenerate = false) => {
  if (!selectedReporte.value) return;
  if (regenerate && !window.confirm('Esto invalidará el link anterior. ¿Seguro?')) return;
  generatingLinkId.value = selectedReporte.value.id;
  try {
    const nuevoToken = uuidv4();
    const { data, error: updateError } = await supabase.from('reportes').update({ token: nuevoToken }).eq('id', selectedReporte.value.id).select().single();
    if (updateError) throw updateError;
    const index = reportes.value.findIndex(r => r.id === data.id);
    if (index !== -1) reportes.value[index] = data;
    selectedReporte.value = data;
    toast.success("¡Link regenerado con éxito!");
  } catch (error) {
    toast.error(`Error al generar el link: ${error.message}`);
  } finally {
    generatingLinkId.value = null;
  }
};
</script>