<!-- src/views/AdminView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <FilterBar 
      @update-filters="applyFilters" 
      @export-lista="exportarListaPDF"
      @export-trazabilidad="exportarTrazabilidadPDF"
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
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Estado</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            <tr v-if="reportes.length === 0"><td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron reportes con los filtros actuales.</td></tr>
            <tr v-for="reporte in reportes" :key="reporte.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ reporte.paciente }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.medico }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.instrumentador_completado || 'N/A' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getEstadoClass(reporte.estado)]">{{ reporte.estado || 'Pendiente' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                <button @click="openGenerateLinkModal(reporte)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">Compartir</button>
                <a href="#" @click.prevent="openDrawer(reporte)" class="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200">Ver Detalles</a>
              </td>
            </tr>
          </tbody>
        </table>
        <PaginationControls v-if="totalReportes > itemsPerPage" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>
      <div class="sm:hidden space-y-4">
        <p v-if="reportes.length === 0" class="text-center text-gray-500 py-10">No se encontraron reportes.</p>
        <ReportCard v-for="reporte in reportes" :key="reporte.id" :reporte="reporte" @share="openGenerateLinkModal(reporte)" @details="openDrawer"/>
        <PaginationControls v-if="totalReportes > itemsPerPage" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>
    </div>
    
    <NewSurgeryModal :show="isNewSurgeryModalVisible" @close="closeNewSurgeryModal" @surgery-created="handleSurgeryCreated"/>
    <ReportDrawer 
      :show="isDrawerVisible" 
      :reporte="selectedReporte" 
      @close="closeDrawer"
      @updated="fetchReportes"
    />
    <GenerateLinkModal 
      :show="isGenerateLinkModalVisible"
      :reporte="selectedReporteForLink"
      @close="closeGenerateLinkModal"
      @link-generated="handleLinkGenerated"
      @link-expired="handleLinkExpired"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import FilterBar from '../components/FilterBar.vue';
import PaginationControls from '../components/PaginationControls.vue';
import NewSurgeryModal from '../components/NewSurgeryModal.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import ReportCard from '../components/ReportCard.vue';
import GenerateLinkModal from '../components/GenerateLinkModal.vue';

const headerConfig = inject('header-config');
const openNewSurgeryModal = () => { isNewSurgeryModalVisible.value = true; };

onMounted(() => {
  headerConfig.value = {
    title: 'Panel de Cirugías',
    buttons: [
      {
        text: 'Nueva Cirugía',
        action: openNewSurgeryModal,
        class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2',
        icon: markRaw({ render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' }) ]) })
      }
    ]
  };
  fetchReportes();
});

onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const toast = useToast();
const activeFilters = ref({});
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalReportes = ref(0);
const reportes = ref([]);
const loading = ref(true);
const error = ref(null);
const isNewSurgeryModalVisible = ref(false);
const isDrawerVisible = ref(false);
const selectedReporte = ref(null);
const isGenerateLinkModalVisible = ref(false);
const selectedReporteForLink = ref(null);
const isExporting = ref(false);

const fetchReportes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      p_paciente: activeFilters.value.paciente,
      p_medico: activeFilters.value.medico,
      p_instrumentador: activeFilters.value.instrumentador,
      p_estado: activeFilters.value.estado,
      
      // ========= INICIO DE LA CORRECCIÓN =========
      // Si el valor de la fecha es una cadena vacía (falsy), enviamos 'null'.
      // De lo contrario, enviamos el valor de la fecha.
      // Esto evita que se envíe "" a la base de datos.
      p_start_date: activeFilters.value.startDate || null,
      p_end_date: activeFilters.value.endDate || null,
      // ========= FIN DE LA CORRECCIÓN =========

      p_rating_puntualidad_max: activeFilters.value.rating_puntualidad_max,
      p_rating_condiciones_max: activeFilters.value.rating_condiciones_max,
      p_rating_asesoramiento_max: activeFilters.value.rating_asesoramiento_max,
      p_rating_evaluacion_general_max: activeFilters.value.rating_evaluacion_general_max,
      p_page: currentPage.value,
      p_items_per_page: itemsPerPage.value
    };

    const { data, error: rpcError } = await supabase.rpc('search_reportes_avanzado', params);

    if (rpcError) throw rpcError;

    if (data && data.length > 0) {
      reportes.value = data;
      totalReportes.value = data[0].total_count;
    } else {
      reportes.value = [];
      totalReportes.value = 0;
    }
    
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los reportes: " + err.message);
  } finally {
    loading.value = false;
  }
};

const applyFilters = (newFilters) => {
  activeFilters.value = newFilters;
  currentPage.value = 1;
  fetchReportes();
};

const goToPage = (page) => {
  currentPage.value = page;
  fetchReportes();
};

const getEstadoClass = (estado) => ({
  'bg-green-100 text-green-800': estado === 'Enviado',
  'bg-yellow-100 text-yellow-800': estado === 'Pendiente',
  'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200': estado === 'Expirado',
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getAllFilteredReportes = async () => {
  const params = {
      p_paciente: activeFilters.value.paciente,
      p_medico: activeFilters.value.medico,
      p_instrumentador: activeFilters.value.instrumentador,
      p_estado: activeFilters.value.estado,
      p_start_date: activeFilters.value.startDate || null,
      p_end_date: activeFilters.value.endDate || null,
      p_rating_puntualidad_max: activeFilters.value.rating_puntualidad_max,
      p_rating_condiciones_max: activeFilters.value.rating_condiciones_max,
      p_rating_asesoramiento_max: activeFilters.value.rating_asesoramiento_max,
      p_rating_evaluacion_general_max: activeFilters.value.rating_evaluacion_general_max,
  };
  const { data, error } = await supabase.rpc('search_reportes_avanzado', params);
  if (error) throw error;
  return data;
};

const exportarListaPDF = async () => {
  isExporting.value = true;
  try {
    const reportesParaExportar = await getAllFilteredReportes();
    if (reportesParaExportar.length === 0) {
      toast.info("No hay reportes para exportar con los filtros actuales.");
      return;
    }
    const doc = new jsPDF();
    doc.text("Lista de Cirugías", 14, 16);
    const tableColumn = ["ID", "Paciente", "Médico", "Fecha Cirugía", "Estado"];
    const tableRows = reportesParaExportar.map(reporte => [
      reporte.id,
      reporte.paciente,
      reporte.medico,
      formatDate(reporte.fecha_cirugia),
      reporte.estado,
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`lista_cirugias_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("Lista exportada a PDF.");
  } catch (err) {
    toast.error("Error al exportar la lista: " + err.message);
  } finally {
    isExporting.value = false;
  }
};

const exportarTrazabilidadPDF = async () => {
  isExporting.value = true;
  try {
    const reportesParaExportar = await getAllFilteredReportes();
    if (reportesParaExportar.length === 0) {
      toast.info("No hay reportes para exportar con los filtros actuales.");
      return;
    }
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.text("Reporte de Trazabilidad de Fichas", 14, 16);
    const tableColumn = ["Paciente", "Médico", "Fecha Cirugía", "Estado", "Fecha Envío", "Instrumentador", "Puntaje IQ"];
    const tableRows = reportesParaExportar.map(reporte => [
      reporte.paciente,
      reporte.medico,
      formatDate(reporte.fecha_cirugia),
      reporte.estado,
      reporte.fecha_envio ? formatDate(reporte.fecha_envio) : 'N/A',
      reporte.instrumentador_completado || 'N/A',
      reporte.puntaje_iq || 'N/A',
    ]);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save(`trazabilidad_fichas_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("Reporte de trazabilidad exportado.");
  } catch (err) {
    toast.error("Error al exportar trazabilidad: " + err.message);
  } finally {
    isExporting.value = false;
  }
};

const closeNewSurgeryModal = () => { isNewSurgeryModalVisible.value = false; };
const openDrawer = (reporte) => {
  selectedReporte.value = reporte;
  isDrawerVisible.value = true;
};
const closeDrawer = () => {
  isDrawerVisible.value = false;
};
const handleSurgeryCreated = () => {
  toast.success("¡Cirugía creada con éxito!");
  fetchReportes();
};

const openGenerateLinkModal = (reporte) => {
  selectedReporteForLink.value = reporte;
  isGenerateLinkModalVisible.value = true;
};
const closeGenerateLinkModal = () => {
  isGenerateLinkModalVisible.value = false;
  selectedReporteForLink.value = null;
};
const handleLinkGenerated = ({ reporteId, short_code }) => {
  // Lógica mantenida por si es necesaria en el futuro.
};
const handleLinkExpired = ({ reporteId }) => {
  const reporteIndex = reportes.value.findIndex(r => r.id === reporteId);
  if (reporteIndex !== -1) {
    reportes.value[reporteIndex].estado = 'Expirado';
  }
};
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: transform 0.3s ease; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateY(100%); }
</style>