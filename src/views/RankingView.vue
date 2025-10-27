<!-- src/views/RankingView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
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
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Pos.</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Instrumentador</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Puntaje Compuesto</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Nivel</th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Detalle (Prom. Manual / Digital)</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          <tr v-if="ranking.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No hay datos suficientes para generar el ranking.</td>
          </tr>
          <tr v-for="iq in ranking" :key="iq.dni">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">
              <span class="font-bold text-lg" :class="getPosicionColor(iq.posicion)">
                {{ iq.posicion === 1 ? '🥇' : iq.posicion === 2 ? '🥈' : iq.posicion === 3 ? '🥉' : iq.posicion }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ iq.nombre_completo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400">{{ iq.puntaje_compuesto }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="getNivelClasses(iq.nivel)">
                {{ iq.nivel }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-slate-400">
              {{ iq.promedio_valoracion_manual }} / {{ iq.promedio_puntaje_iq / 2 }} (de 5)
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import SkeletonLoader from '../components/SkeletonLoader.vue';

const headerConfig = inject('header-config');
onMounted(() => {
  headerConfig.value = {
    title: 'Ranking Mensual IQ',
    buttons: []
  };
});
onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const toast = useToast();
const ranking = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchRanking = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase.rpc('get_ranking_mensual');
    if (fetchError) throw fetchError;
    ranking.value = data;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar el ranking: " + err.message);
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

const getNivelClasses = (nivel) => {
  switch (nivel) {
    case 'Excelente': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'Cumple': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'En observación': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'Incumplidor': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return 'bg-gray-100 text-gray-800';
  }
};
</script>