<!-- src/components/InstrumentadoresRanking.vue -->
<template>
  <div class="pt-4"> 
    <div v-if="loading" class="space-y-4">
      <SkeletonLoader v-for="n in 5" :key="n" />
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
      <!-- --- INICIO DE LA MODIFICACIÓN --- -->
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700">
          <!-- Se rediseñan las columnas para el nuevo panel de diagnóstico -->
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Pos.</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Instrumentador</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Puntaje IQ (Promedio 90d)</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Factores de Rendimiento</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          <tr v-if="ranking.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No hay datos de actividad en los últimos 90 días para generar el ranking.</td>
          </tr>
          <!-- Se itera sobre los datos de la nueva RPC -->
          <tr v-for="iq in ranking" :key="iq.dni">
            <td class="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
              <span class="font-bold text-lg" :class="getPosicionColor(iq.posicion)">
                {{ iq.posicion === 1 ? '🥇' : iq.posicion === 2 ? '🥈' : iq.posicion === 3 ? '🥉' : iq.posicion }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
              <span class="block font-semibold">{{ iq.nombre_completo }}</span>
              <span class="block text-xs text-gray-500">{{ iq.dni }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-2xl font-bold text-center" :class="getIvoColor(iq.puntaje_iq_promedio)">
              {{ iq.puntaje_iq_promedio }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
              <div class="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span class="font-semibold">Cirugías (90d):</span><span>{{ iq.total_cirugias_periodo }}</span>
                <span class="font-semibold">Detalle (Obs.):</span><span>{{ iq.caracteres_promedio_obs }} chars.</span>
                <span class="font-semibold">Puntualidad:</span><span>{{ iq.puntualidad_promedio }} / 5</span>
                <span class="font-semibold">Condiciones:</span><span>{{ iq.condiciones_promedio }} / 5</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <!-- --- FIN DE LA MODIFICACIÓN --- -->
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const toast = useToast();
const ranking = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchRanking = async () => {
  loading.value = true;
  error.value = null;
  try {
    // --- INICIO DE LA MODIFICACIÓN ---
    // Se llama a la nueva función RPC 'get_ranking_ivo_detallado'
    const { data, error: fetchError } = await supabase.rpc('get_ranking_ivo_detallado');
    // --- FIN DE LA MODIFICACIÓN ---
    if (fetchError) throw fetchError;
    ranking.value = data || []; // Se asegura que sea un array si data es null
  } catch (err) {
    error.value = err.message;
    toast.error('Error al cargar el ranking: ' + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchRanking);

const getPosicionColor = (pos) => {
  if (pos === 1) return 'text-yellow-400';
  if (pos === 2) return 'text-gray-400';
  if (pos === 3) return 'text-orange-400';
  return '';
};

// --- INICIO DE LA MODIFICACIÓN ---
// Se crea una nueva función para colorear el puntaje IVO/IQ
const getIvoColor = (score) => {
  if (score >= 8.0) return 'text-green-500 dark:text-green-400';
  if (score >= 5.0) return 'text-blue-500 dark:text-blue-400';
  if (score >= 3.0) return 'text-yellow-500 dark:text-yellow-400';
  return 'text-red-500 dark:text-red-400';
};
// Se elimina la función getNivelClasses ya que no se utiliza más.
// --- FIN DE LA MODIFICACIÓN ---
</script>