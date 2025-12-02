<!-- src/views/ActivitySummaryView.vue -->
<template>
  <div class="min-h-screen w-full bg-slate-900 flex flex-col items-center p-4 sm:p-8">
    <!-- ESTADO DE CARGA -->
    <div v-if="loading" class="text-center text-slate-400 pt-20">
      <svg class="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
      <p class="mt-4 text-lg">Buscando tu historial de actividad...</p>
    </div>

    <!-- ESTADO DE ERROR -->
    <div v-else-if="error" class="text-center text-red-400 max-w-md pt-20">
      <h2 class="text-2xl font-bold">Enlace Inválido o Expirado</h2>
      <p class="mt-2">El enlace para acceder a tu resumen de actividad no es válido o ya ha expirado. Por favor, completa una nueva ficha para generar un nuevo enlace.</p>
    </div>

    <!-- VISTA DE DATOS (ÉXITO) -->
    <div v-else-if="activityData" class="w-full max-w-3xl">
      <!-- Cabecera -->
      <header class="text-center">
        <h1 class="text-3xl font-bold text-white">Tu Historial de Actividad</h1>
        <p class="text-slate-300 mt-2 text-lg">
          Hola, <span class="font-semibold">{{ activityData.instrumentador.nombre_completo }}</span>
        </p>
        <p class="text-slate-400 mt-1 text-sm">
          Gracias por formar parte de un equipo que busca hacer las cosas bien.
        </p>
      </header>

      <!-- Tarjeta de Resumen Única -->
      <section class="mt-8">
        <div class="stat-card">
          <CalendarDaysIcon class="h-8 w-8 text-blue-400" />
          <div class="flex-grow">
            <span class="text-3xl font-bold text-white">{{ activityData.stats.cirugias_mes }}</span>
            <p class="text-sm text-slate-400">Cirugías completadas este mes</p>
          </div>
        </div>
      </section>

      <!-- Lista de Cirugías Realizadas -->
      <section class="mt-8">
        <h2 class="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">
          Actividad Reciente
        </h2>
        <ul v-if="activityData.cirugias.length > 0" class="space-y-3">
          <li v-for="(cirugia, index) in activityData.cirugias" :key="cirugia.id" class="surgery-card">
            <div class="flex items-center gap-4">
              <div class="text-center shrink-0 w-12">
                <p class="text-xl font-bold text-white">{{ formatDate(cirugia.fecha_cirugia).day }}</p>
                <p class="text-xs font-semibold text-slate-400 uppercase">{{ formatDate(cirugia.fecha_cirugia).month }}</p>
              </div>
              <div class="flex-grow">
                <p class="font-semibold text-white">{{ cirugia.paciente }}</p>
                <p class="text-sm text-slate-400">{{ cirugia.medico }} - {{ cirugia.lugar_cirugia }}</p>
              </div>
              <div class="text-right shrink-0">
                <!-- El botón ahora llama a la función 'openSummaryModal' -->
                <button @click="openSummaryModal(cirugia)" class="action-button">
                  <EyeIcon class="h-5 w-5" />
                  <span>Ver Resumen</span>
                </button>
                <p v-if="index === 0" class="text-xs font-semibold text-green-400 mt-1 text-center">Último Envío</p>
              </div>
            </div>
          </li>
        </ul>
        <div v-else class="text-center py-10 px-4 bg-slate-800 rounded-lg border border-dashed border-slate-700">
          <p class="text-slate-400">Aún no has completado ninguna ficha este mes.</p>
        </div>
      </section>
    </div>

    <!-- El nuevo modal de resumen se añade aquí -->
    <SurgerySummaryModal 
      :show="isModalVisible" 
      :reporte="selectedSurgery"
      @close="closeSummaryModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';
import { CalendarDaysIcon, EyeIcon } from '@heroicons/vue/24/outline';
// 1. Importamos el nuevo componente modal.
import SurgerySummaryModal from '../components/SurgerySummaryModal.vue';

const props = defineProps({
  token: {
    type: String,
    required: true,
  },
});

const loading = ref(true);
const error = ref(null);
const activityData = ref(null);

// 2. Añadimos el estado para controlar el modal.
const isModalVisible = ref(false);
const selectedSurgery = ref(null);

// 3. Funciones para abrir y cerrar el modal.
const openSummaryModal = (cirugia) => {
  selectedSurgery.value = cirugia;
  isModalVisible.value = true;
};
const closeSummaryModal = () => {
  isModalVisible.value = false;
  selectedSurgery.value = null; // Limpiamos la selección al cerrar.
};

onMounted(async () => {
  try {
    const { data, error: rpcError } = await supabase.rpc('get_instrumentador_activity', {
      p_token: props.token,
    });

    if (rpcError) throw rpcError;
    if (!data) throw new Error('Token inválido o expirado.');

    activityData.value = data;

  } catch (err) {
    console.error('Error al obtener la actividad:', err.message);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return { day: '--', month: '---' };
  const date = new Date(dateString);
  return {
    day: date.toLocaleDateString('es-ES', { day: '2-digit' }),
    month: date.toLocaleDateString('es-ES', { month: 'short' }).replace('.', ''),
  };
};
</script>

<style scoped>
.stat-card {
  @apply bg-slate-800 p-6 rounded-lg border border-slate-700 flex items-center gap-6;
}
.surgery-card {
  @apply bg-slate-800 p-4 rounded-lg border border-slate-700 transition-all hover:border-slate-600;
}
.action-button {
  @apply flex items-center gap-2 h-9 px-3 rounded-md text-sm font-semibold;
  @apply bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white;
}
</style>