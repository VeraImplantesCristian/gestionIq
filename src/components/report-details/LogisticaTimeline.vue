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
            <time class="timeline-time">{{ formatDateTime(control.fecha_retiro) }}</time>
          </div>
          
          <!-- Observaciones -->
          <p v-if="control.observaciones" class="timeline-description">
            {{ control.observaciones }}
          </p>

          <!-- 
            Galería de Fotos Adjuntas para este control específico.
            - Le pasamos el 'reportId' y el 'logisticaControlId' para que PhotosGallery
              sepa exactamente qué fotos buscar.
          -->
          <PhotosGallery
            v-if="control.id"
            :report-id="reportId"
            :logistica-control-id="control.id"
            :area="'logistica'"
            :show-uploader="false"
            :title="'Evidencia de este control'"
            :compact="true"
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
// Importamos el componente de galería completo.
import PhotosGallery from './PhotosGallery.vue';

const props = defineProps({
  reportId: { type: [String, Number], required: true },
});

// --- ESTADO INTERNO ---
const isLoading = ref(true);
const errorMsg = ref(null);
const logisticaControls = ref([]);

// --- MÉTODOS ---

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });
};

const getStatusColor = (status) => {
  if (status === 'ok') return 'bg-green-500';
  if (status === 'revision') return 'bg-yellow-500';
  if (status === 'problemas') return 'bg-red-500';
  return 'bg-gray-400';
};

/**
 * Función que carga solo los registros de control de logística.
 * La carga de fotos se delega al componente PhotosGallery.
 */
const fetchData = async () => {
  isLoading.value = true;
  errorMsg.value = null;
  try {
    const { data, error } = await supabase
      .from('logistica_controles')
      .select('id, fecha_retiro, estado, observaciones')
      .eq('cirugia_id', props.reportId)
      .order('fecha_retiro', { ascending: false });

    if (error) throw error;

    logisticaControls.value = data || [];

  } catch (error) {
    console.error("Error cargando datos de logística:", error);
    errorMsg.value = "No se pudo cargar la información de logística.";
  } finally {
    isLoading.value = false;
  }
};

// Llamamos a la función de carga cuando el componente se monta.
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

/* Estilo para hacer la galería más compacta dentro del timeline */
.mt-4.compact-gallery :deep(.gallery-header) {
  margin-bottom: 0.75rem;
}
.mt-4.compact-gallery :deep(.gallery-title) {
  font-size: 0.875rem;
}
.mt-4.compact-gallery :deep(.gallery-grid) {
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
}
</style>