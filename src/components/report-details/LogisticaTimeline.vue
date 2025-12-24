<!-- src/components/report-details/LogisticaTimeline.vue -->
<template>
  <div class="logistica-timeline-container">
    <!-- Estado de Carga -->
    <div v-if="isLoading" class="loading-state">Cargando controles de logística...</div>
    <!-- Estado de Error -->
    <div v-else-if="errorMsg" class="error-state">{{ errorMsg }}</div>
    
    <!-- Línea de Tiempo de Controles -->
    <ul v-else-if="logisticaControls.length > 0" class="timeline">
      <li v-for="control in logisticaControls" :key="control.id" class="timeline-item">
        <div class="timeline-dot" :class="getStatusColor(control.estado)"></div>
        <div class="timeline-content">
          <!-- Título y Fecha del Control -->
          <div class="timeline-header">
            <p class="timeline-title">Control de Devolución - Estado: <span class="font-bold">{{ control.estado.toUpperCase() }}</span></p>
            <time class="timeline-time">{{ formatDateTime(control.created_at) }}</time>
          </div>
          
          <!-- Observaciones -->
          <p v-if="control.observaciones" class="timeline-description">
            {{ control.observaciones }}
          </p>

          <!-- Visor de Evidencias -->
          <EvidenceViewer 
            v-if="control.photos && control.photos.length > 0"
            :files="control.photos" 
            class="mt-4"
          />
        </div>
      </li>
    </ul>

    <!-- Mensaje si no se encuentran controles -->
    <div v-else class="empty-state">
      <p>No se han registrado controles de logística para este reporte.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import EvidenceViewer from '../shared/EvidenceViewer.vue';

const props = defineProps({
  reportId: { type: [String, Number], required: true },
});

const isLoading = ref(true);
const errorMsg = ref(null);
const logisticaControls = ref([]);
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-AR', {
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'America/Argentina/Buenos_Aires'
  }) + ' hs';
};

const getStatusColor = (status) => {
  if (status === 'ok') return 'bg-green-500';
  if (status === 'revision') return 'bg-yellow-500';
  if (status === 'problemas') return 'bg-red-500';
  return 'bg-gray-400';
};

const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  console.log(`--- [LogisticaTimeline] Iniciando fetchData para reporte ID: ${props.reportId} ---`);

  try {
    const { data, error } = await supabase
      .from('logistica_controles_con_evidencias')
      .select('*')
      .eq('cirugia_id', props.reportId)
      .order('created_at', { ascending: false });

    // Log 1: Muestra los datos crudos tal como llegan de la VISTA de Supabase.
    console.log('--- [LogisticaTimeline] Datos crudos de la VIEW ---');
    console.log(JSON.parse(JSON.stringify(data)));

    if (error) throw error;

    const processedData = (data || []).map(control => {
      let processedPhotos = [];
      if (control.photos && Array.isArray(control.photos) && control.photos.length > 0) {
        // Log 2: Muestra el array de fotos de cada control antes de ser procesado.
        console.log(`--- [LogisticaTimeline] Procesando fotos para control ID: ${control.id} ---`);
        console.log(JSON.parse(JSON.stringify(control.photos)));

        processedPhotos = control.photos.map(photo => ({
          ...photo,
          url: `${R2_PUBLIC_URL}/${photo.object_key}`,
          caption: photo.file_name
        }));
      }
      return { ...control, photos: processedPhotos };
    });

    // Log 3: Muestra los datos finales, ya procesados y listos para ser renderizados en el template.
    console.log('--- [LogisticaTimeline] Datos finales procesados para la UI ---');
    console.log(JSON.parse(JSON.stringify(processedData)));

    logisticaControls.value = processedData;

  } catch (error) {
    console.error("Error cargando datos de logística:", error);
    errorMsg.value = "No se pudo cargar la información de logística.";
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);
</script>

<style scoped>
.loading-state, .error-state, .empty-state { text-align: center; padding: 2rem; color: #64748b; }
.error-state { color: #dc2626; }
.empty-state { font-size: 0.875rem; border: 1px dashed #e2e8f0; border-radius: 8px; }
.timeline { list-style: none; padding: 0; position: relative; }
.timeline::before { content: ''; position: absolute; top: 5px; left: 5px; bottom: 5px; width: 2px; background-color: #e2e8f0; }
.timeline-item { position: relative; padding-left: 2rem; margin-bottom: 2rem; }
.timeline-dot { position: absolute; left: 0; top: 5px; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; }
.timeline-header { display: flex; justify-content: space-between; align-items: baseline; }
.timeline-title { font-weight: 600; color: #334155; }
.timeline-description { font-size: 0.875rem; color: #64748b; margin-top: 0.5rem; white-space: pre-wrap; }
.timeline-time { font-size: 0.75rem; color: #94a3b8; }
.bg-green-500 { background-color: #22c55e; }
.bg-yellow-500 { background-color: #f59e0b; }
.bg-red-500 { background-color: #ef4444; }
.bg-gray-400 { background-color: #9ca3af; }
</style>