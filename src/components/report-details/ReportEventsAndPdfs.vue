<!-- src/components/report-details/ReportEventsAndPdfs.vue -->
<template>
  <div class="events-pdfs-container">
    <!-- Botones de Acción -->
    <div class="actions-header">
      <button @click="handleGeneratePdf" class="btn btn-primary">Generar PDF</button>
    </div>

    <!-- Estado de Carga -->
    <div v-if="isLoading" class="loading-state">Cargando historial...</div>
    <!-- Estado de Error -->
    <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>

    <!-- Layout de dos columnas -->
    <div v-else class="columns-wrapper">
      
      <!-- Columna Izquierda: Eventos (Timeline) -->
      <div class="column">
        <h3 class="column-title">Eventos del Reporte</h3>
        <ul v-if="timelineEvents.length > 0" class="timeline">
          <li v-for="(event, index) in timelineEvents" :key="index" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <p class="timeline-title">{{ event.title }}</p>
              <p class="timeline-description">{{ event.description }}</p>
              <time class="timeline-time">{{ formatDateTime(event.timestamp) }}</time>
            </div>
          </li>
        </ul>
        <div v-else class="empty-state">No hay eventos para mostrar.</div>
      </div>

      <!-- Columna Derecha: Historial de PDFs Generados -->
      <div class="column">
        <h3 class="column-title">Historial de PDFs Generados</h3>
        <table v-if="pdfHistory.length > 0" class="pdf-table">
          <thead>
            <tr>
              <th>Versión</th>
              <th>Fecha de Generación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="pdf in pdfHistory" :key="pdf.id">
              <td>Versión {{ pdf.version }}</td>
              <td>{{ formatDateTime(pdf.generated_at) }}</td>
              <td>
                <button @click="handleDownloadPdf(pdf.id)" class="action-link">Descargar</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">No se han generado PDFs para este reporte.</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';

const props = defineProps({
  reportId: { type: [String, Number], required: true },
});

// --- ESTADO INTERNO ---
const isLoading = ref(true);
const errorMsg = ref(null);
const reporteData = ref(null);
const logisticaData = ref(null);
const pdfHistory = ref([]);

// --- MÉTODOS ---

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }) + ' hs';
};

const timelineEvents = computed(() => {
  const events = [];
  if (!reporteData.value) return events;
  events.push({
    title: 'Reporte Creado',
    description: 'Se generó el registro de la cirugía en el sistema.',
    timestamp: reporteData.value.created_at,
  });
  if (reporteData.value.fecha_envio) {
    events.push({
      title: 'Ficha Enviada',
      description: `Por ${reporteData.value.instrumentador_completado || 'el instrumentador'}.`,
      timestamp: reporteData.value.fecha_envio,
    });
  }
  if (logisticaData.value) {
    events.push({
      title: 'Control de Logística',
      description: `Se registró la devolución. Estado: ${logisticaData.value.estado || 'N/A'}.`,
      timestamp: logisticaData.value.created_at,
    });
  }
  return events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
});

const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    const [reporteRes, logisticaRes, pdfRes] = await Promise.all([
      supabase.from('reportes').select('created_at, fecha_envio, instrumentador_completado').eq('id', props.reportId).single(),
      
      // Consulta corregida para evitar el error 406
      supabase.from('logistica_controles').select('created_at, estado').eq('cirugia_id', props.reportId).limit(1).single(),
      
      supabase.from('pdf_generation_log').select('id, version, generated_at').eq('reporte_id', props.reportId).order('version', { ascending: false })
    ]);

    if (reporteRes.error) throw new Error(`Error al cargar el reporte: ${reporteRes.error.message}`);
    if (pdfRes.error) throw new Error(`Error al cargar historial de PDF: ${pdfRes.error.message}`);
    // Ignoramos el error "0 rows" para logística, pero capturamos otros.
    if (logisticaRes.error && logisticaRes.error.code !== 'PGRST116') {
      throw new Error(`Error al cargar datos de logística: ${logisticaRes.error.message}`);
    }

    reporteData.value = reporteRes.data;
    logisticaData.value = logisticaRes.data;
    pdfHistory.value = pdfRes.data || [];

  } catch (error) {
    console.error("Error en fetchData:", error);
    errorMsg.value = "No se pudo cargar la información del historial.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

// --- FUNCIONES "GANCHO" (PLACEHOLDERS) ---

const handleGeneratePdf = () => {
  // TODO: Conectar con la lógica de generación de PDF del ReportDrawer.
  console.log(`Generar PDF para el reporte ID: ${props.reportId}`);
  alert('Funcionalidad "Generar PDF" a implementar.');
};

const handleDownloadPdf = (pdfId) => {
  // TODO: Implementar lógica para descargar una versión específica del PDF.
  console.log(`Descargar PDF ID: ${pdfId} del reporte ID: ${props.reportId}`);
  alert(`Funcionalidad "Descargar PDF ${pdfId}" a implementar.`);
};
</script>

<style scoped>
.events-pdfs-container { position: relative; }
.actions-header { display: flex; justify-content: flex-end; gap: 0.75rem; margin-bottom: 1.5rem; }
.btn { padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid transparent; font-weight: 500; cursor: pointer; font-size: 0.875rem; }
.btn-primary { background-color: #2563eb; color: white; }
.btn-secondary { background-color: #f1f5f9; color: #334155; border-color: #cbd5e1; }
.loading-state, .error-state { text-align: center; padding: 2rem; color: #64748b; }
.error-state { color: #dc2626; }
.columns-wrapper { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; }
.column-title { font-size: 1rem; font-weight: 600; margin-bottom: 1rem; color: #1e293b; }
.timeline { list-style: none; padding: 0; position: relative; }
.timeline::before { content: ''; position: absolute; top: 5px; left: 5px; bottom: 5px; width: 2px; background-color: #e2e8f0; }
.timeline-item { position: relative; padding-left: 2rem; margin-bottom: 1.5rem; }
.timeline-dot { position: absolute; left: 0; top: 5px; width: 12px; height: 12px; border-radius: 50%; background-color: #cbd5e1; border: 2px solid white; }
.timeline-item:first-child .timeline-dot { background-color: #2563eb; }
.timeline-title { font-weight: 500; color: #334155; }
.timeline-description { font-size: 0.875rem; color: #64748b; }
.timeline-time { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; display: block; }
.pdf-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.pdf-table th, .pdf-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid #e2e8f0; }
.pdf-table th { font-weight: 600; color: #475569; }
.pdf-table td { color: #334155; }
.action-link { color: #2563eb; font-weight: 500; background: none; border: none; cursor: pointer; }
.empty-state { font-size: 0.875rem; color: #94a3b8; padding: 1rem; border: 1px dashed #e2e8f0; border-radius: 8px; text-align: center; }
@media (max-width: 768px) { .columns-wrapper { grid-template-columns: 1fr; } }
</style>