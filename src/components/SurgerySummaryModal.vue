<!-- src/components/SurgerySummaryModal.vue -->
<template>
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0 scale-95"
    enter-to-class="opacity-100 scale-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100 scale-100"
    leave-to-class="opacity-0 scale-95"
  >
    <div v-if="show" @click.self="close" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      
      <!-- Panel del Modal -->
      <div v-if="reporte" class="bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg w-full max-w-2xl border border-slate-700 relative">
        <!-- Botón de Cierre -->
        <button @click="close" class="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-700">
          <XMarkIcon class="h-6 w-6 text-slate-400" />
        </button>

        <div class="text-center mb-8">
          <h2 class="text-2xl font-bold text-slate-100">Resumen de Cirugía</h2>
          <p class="text-slate-400 mt-2">Detalles de la ficha que registraste.</p>
        </div>

        <div class="space-y-6 text-sm">
          <!-- Resumen de la Cirugía -->
          <div>
            <h3 class="section-title">Datos de la Cirugía</h3>
            <div class="summary-box">
              <SummaryRow label="Paciente" :value="reporte.paciente" />
              <SummaryRow label="Médico" :value="reporte.medico" />
              <SummaryRow label="Fecha de Envío" :value="formatDateTime(reporte.fecha_envio)" />
            </div>
          </div>

          <!-- Resumen de Evaluación -->
          <div>
            <h3 class="section-title">Tu Evaluación</h3>
            <div class="summary-box">
              <RatingRow label="Puntualidad" :rating="reporte.rating_puntualidad" />
              <RatingRow label="Condiciones" :rating="reporte.rating_condiciones" />
              <RatingRow label="Asesoramiento" :rating="reporte.rating_asesoramiento" />
              <RatingRow label="General" :rating="reporte.rating_evaluacion_general" />
            </div>
          </div>

          <!-- Resumen de Consumo -->
          <div>
            <h3 class="section-title">Consumo y Observaciones</h3>
            <div class="summary-box space-y-4">
              <div>
                <label class="font-semibold text-slate-300">Consumo Reportado</label>
                <p class="text-slate-200 whitespace-pre-wrap mt-1">{{ reporte.consumo_realizado || 'No especificado.' }}</p>
              </div>
              <div>
                <label class="font-semibold text-slate-300">Observaciones</label>
                <p class="text-slate-200 whitespace-pre-wrap mt-1">{{ reporte.observaciones || 'Sin observaciones.' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { defineComponent, h } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';

// 1. Definimos las props que el modal necesita para funcionar.
const props = defineProps({
  show: { type: Boolean, default: false },
  reporte: { type: Object, default: null }
});

// 2. Definimos el evento 'close' que el modal emitirá.
const emit = defineEmits(['close']);

// 3. Función para emitir el evento de cierre.
const close = () => {
  emit('close');
};

// --- COMPONENTES Y HELPERS REUTILIZADOS DE SubmittedSummary.vue ---

const SummaryRow = defineComponent({
  props: ['label', 'value'],
  setup(props) {
    return () => h('div', { class: 'flex justify-between items-center' }, [
      h('span', { class: 'font-semibold text-slate-300' }, props.label),
      h('span', { class: 'text-white' }, props.value || 'N/A')
    ]);
  }
});

const RatingRow = defineComponent({
  props: ['label', 'rating'],
  setup(props) {
    const stars = props.rating ? Array.from({ length: 5 }, (_, i) => h('span', { class: i < props.rating ? 'text-yellow-400' : 'text-slate-600' }, '★')) : h('span', {}, 'N/A');
    return () => h('div', { class: 'flex justify-between items-center' }, [
      h('span', { class: 'font-semibold text-slate-300' }, props.label),
      h('div', { class: 'flex text-lg' }, stars)
    ]);
  }
});

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + ' hs';
};
</script>

<style scoped>
.section-title {
  @apply text-xs font-bold text-slate-400 uppercase tracking-wider mb-2;
}
.summary-box {
  @apply p-4 bg-slate-700/50 rounded-lg border border-slate-700 space-y-2;
}
</style>