<!-- src/components/EstadisticasInstrumentadorModal.vue -->
<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="close">
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-lg m-4 transform transition-all">
      <div class="p-5 border-b dark:border-slate-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Análisis de Rendimiento Operativo</h3>
        <p class="text-sm text-gray-500 dark:text-slate-400">{{ instrumentador?.nombre_completo }}</p>
      </div>

      <div class="p-5 max-h-[70vh] overflow-y-auto">
        <div v-if="loading" class="text-center py-12">Cargando análisis...</div>
        <div v-else-if="error" class="text-center py-12 text-red-500">Error: {{ error }}</div>
        <div v-else-if="stats" class="space-y-6">
          
          <!-- Sección Principal: IVO y Categoría -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div class="text-center">
              <p class="text-xs text-gray-500 dark:text-slate-400 uppercase">IVO (90 días)</p>
              <p class="text-6xl font-bold text-blue-600 dark:text-blue-400 tracking-tight">{{ stats.ivo_total_90d.toFixed(2) }}</p>
            </div>
            <div v-if="instrumentadorCategoria" :class="instrumentadorCategoria.colorClasses" class="p-4 rounded-lg text-center h-full flex flex-col justify-center">
              <strong class="block text-lg">{{ instrumentadorCategoria.nombre }}</strong>
              <p class="text-sm mt-1">{{ instrumentadorCategoria.descripcion }}</p>
            </div>
          </div>

          <!-- Sección de Intervenciones Clave -->
          <div v-if="stats.intervenciones_clave_count > 0" class="bg-purple-50 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 p-4 rounded-lg text-center">
            <p class="font-bold">🟣 {{ stats.intervenciones_clave_count }} Intervencion{{ stats.intervenciones_clave_count > 1 ? 'es' : '' }} Clave</p>
            <p class="text-xs mt-1">Este perfil resuelve problemas operativos complejos.</p>
            <p v-if="stats.ultima_intervencion_fecha" class="text-xs opacity-70">Última: {{ new Date(stats.ultima_intervencion_fecha).toLocaleDateString('es-AR') }}</p>
          </div>

          <!-- Sección del Gráfico -->
          <div>
            <h4 class="text-sm font-bold uppercase text-gray-600 dark:text-slate-300 mb-2">Composición del IVO Promedio / Cirugía</h4>
            <div class="bg-gray-50 dark:bg-slate-900/50 p-4 rounded-lg">
              <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
            </div>
            <p class="text-xs text-center mt-2 text-gray-500 dark:text-slate-400">Justifica cómo se compone el puntaje promedio de {{ stats.promedio_ivo_cirugia.toFixed(2) }} por cirugía.</p>
          </div>

          <!-- Sección de Estadísticas Detalladas -->
          <div class="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-700">
            <div class="stat-item">
              <p class="stat-value">{{ stats.cirugias_90d }}</p>
              <p class="stat-label">Cirugías (90d)</p>
            </div>
            <div class="stat-item">
              <p class="stat-value">{{ stats.incidencias_totales }}</p>
              <p class="stat-label">Incidencias (Histórico)</p>
            </div>
          </div>
        </div>
      </div>

      <div class="px-5 py-4 bg-gray-50 dark:bg-slate-800/50 text-right rounded-b-lg">
        <button @click="close" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { supabase } from '../services/supabase.js';
// Se importan los componentes para el gráfico
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

// Se registran los componentes de Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  show: Boolean,
  instrumentador: Object,
});
const emit = defineEmits(['close']);

const stats = ref(null);
const loading = ref(false);
const error = ref(null);

// Lógica de Categorización (sin cambios)
const instrumentadorCategoria = computed(() => {
  if (!stats.value) return null;
  const score = stats.value.ivo_total_90d;
  if (score >= 8.0) return { nombre: '🟢 Destacado', descripcion: 'Este es el comportamiento que queremos replicar.', colorClasses: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700' };
  if (score >= 5.0) return { nombre: '🔵 Correcto', descripcion: 'Funciona bien dentro del sistema.', colorClasses: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700' };
  if (score >= 3.0) return { nombre: '🟡 Inestable', descripcion: 'Hay que mirar qué pasa acá.', colorClasses: 'bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700' };
  return { nombre: '🔴 Crítico', descripcion: 'No es un perfil para escalar.', colorClasses: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700' };
});

// Propiedad computada para los datos del gráfico
const chartData = computed(() => {
  if (!stats.value) return null;
  return {
    labels: ['Tiempo', 'Información', 'Evidencia'],
    datasets: [
      {
        label: 'Aporte Promedio al IVO',
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
        data: [
          stats.value.promedio_tiempo,
          stats.value.promedio_informacion,
          stats.value.promedio_evidencia
        ],
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };
});

// Opciones de configuración para el gráfico
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          return `Aporte: ${context.raw.toFixed(2)} pts`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 0.5, // El máximo puntaje posible de un componente es 0.40
      ticks: {
        stepSize: 0.1
      }
    }
  }
});

async function fetchStats() {
  if (!props.instrumentador?.dni) return;
  loading.value = true;
  error.value = null;
  stats.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_estadisticas_instrumentador', {
      p_dni: props.instrumentador.dni
    });
    if (rpcError) throw rpcError;
    stats.value = data;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

watch(() => props.show, (newValue) => {
  if (newValue) {
    fetchStats();
  }
});

const close = () => emit('close');
</script>

<style scoped>
.stat-item { @apply text-center bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg; }
.stat-value { @apply text-2xl font-semibold text-gray-800 dark:text-slate-100; }
.stat-label { @apply text-xs text-gray-500 dark:text-slate-400 uppercase tracking-wider; }
</style>