<!-- src/views/StatsView.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <!-- Encabezado de la página -->
      <div class="flex justify-between items-center mb-8">
        <div class="flex items-center space-x-3">
          <svg class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 8v8m-4-5v5m-4-2v2M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">Estadísticas de Reportes</h1>
        </div>
        <router-link to="/admin" class="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg shadow hover:bg-gray-100 flex items-center space-x-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Volver al Panel</span>
        </router-link>
      </div>

      <!-- Contenedor de Estadísticas -->
      <div v-if="loading" class="flex items-center justify-center h-64">
        <svg class="animate-spin h-12 w-12 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-else-if="error" class="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-md" role="alert">
        <p class="font-bold">Error al Cargar</p>
        <p>{{ error }}</p>
      </div>
      <div v-else class="space-y-8">
        <!-- Tarjetas de Estadísticas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatCard title="Total Fichas" :value="totalFichas" :icon="DocumentChartBarIcon" icon-bg-color="bg-blue-500" />
          <StatCard title="Prom. Puntualidad" :value="avgPuntualidad" :icon="ClockIcon" icon-bg-color="bg-yellow-500" />
          <StatCard title="Prom. Condiciones" :value="avgCondiciones" :icon="SparklesIcon" icon-bg-color="bg-lime-500" />
          <StatCard title="Prom. Asesoramiento" :value="avgAsesoramiento" :icon="UserGroupIcon" icon-bg-color="bg-purple-500" />
          <StatCard title="Prom. General" :value="avgGeneral" :icon="StarIcon" icon-bg-color="bg-emerald-500" />
        </div>
        
        <!-- **NUEVO:** Sección de Gráficos de Distribución -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RatingChart title="Distribución de Puntualidad" :reports="statsData" field="rating_puntualidad" />
          <RatingChart title="Distribución de Condiciones" :reports="statsData" field="rating_condiciones" />
          <RatingChart title="Distribución de Asesoramiento" :reports="statsData" field="rating_asesoramiento" />
          <RatingChart title="Distribución de Evaluación General" :reports="statsData" field="rating_evaluacion_general" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import StatCard from '../components/StatCard.vue';
import RatingChart from '../components/RatingChart.vue'; // Importamos el nuevo componente
import { DocumentChartBarIcon, ClockIcon, SparklesIcon, UserGroupIcon, StarIcon } from '@heroicons/vue/24/outline';

const loading = ref(true);
const error = ref(null);
const statsData = ref([]);

// --- PROPIEDADES COMPUTADAS PARA CÁLCULOS ---
const totalFichas = computed(() => statsData.value.length);

const calculateAverage = (field) => {
  if (statsData.value.length === 0) return 'N/A';
  const sum = statsData.value.reduce((acc, report) => acc + (report[field] || 0), 0);
  const average = sum / statsData.value.length;
  return average.toFixed(2);
};

const avgPuntualidad = computed(() => calculateAverage('rating_puntualidad'));
const avgCondiciones = computed(() => calculateAverage('rating_condiciones'));
const avgAsesoramiento = computed(() => calculateAverage('rating_asesoramiento'));
const avgGeneral = computed(() => calculateAverage('rating_evaluacion_general'));

// --- LÓGICA DE CARGA DE DATOS ---
const fetchStats = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase
      .from('reportes_stats')
      .select('*');
    if (fetchError) throw fetchError;
    statsData.value = data;
  } catch (err) {
    console.error("Error al cargar estadísticas:", err);
    error.value = 'No se pudieron cargar los datos de estadísticas. Por favor, intente de nuevo.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStats);
</script>