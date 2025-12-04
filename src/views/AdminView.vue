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
      <div class="hidden sm:block">
        <ReportTable
          :reportes="reportes"
          :selected-reportes="selectedReportes"
          @toggle-selection="toggleSelection"
          @toggle-select-all="toggleSelectAll"
          @open-drawer="openDrawer"
          @open-link-modal="openGenerateLinkModal"
          @export-summary="exportarResumenPacientePDF"
        />
        <PaginationControls v-if="totalReportes > itemsPerPage" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>
      
      <div class="sm:hidden space-y-4">
        <p v-if="reportes.length === 0" class="text-center text-gray-500 py-10">No se encontraron reportes.</p>
        <ReportCard v-for="reporte in reportes" :key="reporte.id" :reporte="reporte" @share="openGenerateLinkModal(reporte)" @details="openDrawer"/>
        <PaginationControls v-if="totalReportes > itemsPerPage" :current-page="currentPage" :total-items="totalReportes" :items-per-page="itemsPerPage" @page-changed="goToPage" />
      </div>
    </div>
    
    <Transition name="slide-up">
      <div v-if="selectedReportes.size > 0" class="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 shadow-lg border-t dark:border-slate-700 p-4 flex justify-center items-center z-10">
        <div class="flex items-center gap-4">
          <span class="font-semibold text-gray-700 dark:text-slate-200">{{ selectedReportes.size }} reporte(s) seleccionado(s)</span>
          <button @click="exportarSeleccionPDF" class="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center gap-2" :disabled="isExporting">
            <DocumentTextIcon class="h-5 w-5" />
            {{ isExporting ? 'Exportando...' : 'Exportar Selección' }}
          </button>
          <button @click="selectedReportes.clear()" class="text-sm text-gray-500 hover:underline">Limpiar selección</button>
        </div>
      </div>
    </Transition>
    
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
import { ref, onMounted, onUnmounted, inject, h, markRaw, computed } from 'vue';
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
import { DocumentTextIcon } from '@heroicons/vue/24/outline';
import ReportTable from '../components/ReportTable.vue';

// --- LÓGICA DE ESTADO Y MÉTODOS (LA MAYORÍA SIN CAMBIOS) ---
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
const selectedReportes = ref(new Set());

const isReportSelected = (reporteId) => selectedReportes.value.has(reporteId);

const toggleSelection = (reporteId) => {
  if (isReportSelected(reporteId)) {
    selectedReportes.value.delete(reporteId);
  } else {
    selectedReportes.value.add(reporteId);
  }
};

const areAllOnPageSelected = computed(() => {
  const pageIds = reportes.value.map(r => r.id);
  return pageIds.length > 0 && pageIds.every(id => selectedReportes.value.has(id));
});

const toggleSelectAll = () => {
  const pageIds = reportes.value.map(r => r.id);
  if (areAllOnPageSelected.value) {
    pageIds.forEach(id => selectedReportes.value.delete(id));
  } else {
    pageIds.forEach(id => selectedReportes.value.add(id));
  }
};

const fetchReportes = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      p_paciente: activeFilters.value.paciente,
      p_medico: activeFilters.value.medico,
      p_instrumentador: activeFilters.value.instrumentador,
      p_estado: activeFilters.value.estado,
      p_start_date: activeFilters.value.startDate || null,
      p_end_date: activeFilters.value.endDate || null,
      p_date_filter_field: activeFilters.value.dateFilterField,
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const getAllFilteredReportes = async () => {
  const params = {
      p_paciente: activeFilters.value.paciente,
      p_medico: activeFilters.value.medico,
      p_instrumentador: activeFilters.value.instrumentador,
      p_estado: activeFilters.value.estado,
      p_start_date: activeFilters.value.startDate || null,
      p_end_date: activeFilters.value.endDate || null,
      p_date_filter_field: activeFilters.value.dateFilterField,
      p_rating_puntualidad_max: activeFilters.value.rating_puntualidad_max,
      p_rating_condiciones_max: activeFilters.value.rating_condiciones_max,
      p_rating_asesoramiento_max: activeFilters.value.rating_asesoramiento_max,
      p_rating_evaluacion_general_max: activeFilters.value.rating_evaluacion_general_max,
  };
  const { data, error } = await supabase.rpc('search_reportes_avanzado', params);
  if (error) throw error;
  return data;
};

const exportarListaPDF = async () => { /* ... (sin cambios) ... */ };
const exportarTrazabilidadPDF = async () => { /* ... (sin cambios) ... */ };
const exportarResumenPacientePDF = (reporte) => { /* ... (sin cambios) ... */ };

// ========= INICIO DE LA MEJORA: AÑADIR INSTRUMENTADOR AL PDF =========
const exportarSeleccionPDF = async () => {
  if (selectedReportes.value.size === 0) {
    toast.info("No hay reportes seleccionados para exportar.");
    return;
  }
  isExporting.value = true;
  toast.info(`Exportando ${selectedReportes.value.size} resúmenes...`);

  try {
    const idsToFetch = Array.from(selectedReportes.value);
    // 1. Pedimos el campo 'instrumentador_completado' en la consulta.
    const { data: reportesSeleccionados, error } = await supabase
      .from('reportes')
      .select('paciente, tipo_cirugia, observaciones, instrumentador_completado')
      .in('id', idsToFetch);

    if (error) throw error;

    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    let y = 20;

    doc.setFontSize(16);
    doc.text("Resumen de Cirugías Seleccionadas", pageWidth / 2, y, { align: 'center' });
    y += 15;

    reportesSeleccionados.forEach((reporte, index) => {
      const observaciones = reporte.observaciones || 'Sin observaciones.';
      doc.setFontSize(9);
      const obsLines = doc.splitTextToSize(observaciones, contentWidth);
      // Se ajusta la altura del bloque para el nuevo campo.
      const blockHeight = 25 + (obsLines.length * 4) + 10;

      if (y + blockHeight > pageHeight - margin) {
        doc.addPage();
        y = 20;
      }

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(reporte.paciente || 'Paciente no especificado', margin, y);
      y += 6;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100);
      doc.text(reporte.tipo_cirugia || 'N/A', margin, y);
      y += 5; // Espacio reducido

      // 2. Añadimos el nombre del instrumentador al PDF.
      doc.setFont('helvetica', 'italic');
      doc.text(reporte.instrumentador_completado || 'Instrumentador no asignado', margin, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0);
      y += 8;

      doc.setFontSize(9);
      doc.text(obsLines, margin, y);
      y += obsLines.length * 4 + 10;

      if (index < reportesSeleccionados.length - 1) {
        doc.setDrawColor(220);
        doc.line(margin, y, pageWidth - margin, y);
        y += 10;
      }
    });

    doc.save(`Resumen_Seleccion_${new Date().toISOString().slice(0,10)}.pdf`);
    toast.success("Exportación completada.");
    selectedReportes.value.clear();

  } catch (err) {
    console.error("Error al exportar selección:", err);
    toast.error("No se pudo generar el PDF: " + err.message);
  } finally {
    isExporting.value = false;
  }
};
// ========= FIN DE LA MEJORA =========

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
const handleLinkGenerated = ({ reporteId, short_code }) => {};
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