<!-- src/components/SubmittedSummary.vue -->
<template>
  <div class="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-2xl mx-auto border border-slate-700">
    <div class="text-center mb-8">
      <div class="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-500/10 text-green-400">
        <svg class="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
      </div>
      <h2 class="text-2xl font-bold text-slate-100">Esta ficha ya fue enviada</h2>
      <p class="text-slate-400 mt-2">Gracias por tu colaboración. Esto es un resumen de los datos que registraste.</p>
    </div>

    <div v-if="reporte" class="space-y-6 text-sm">
      <!-- Resumen de la Cirugía -->
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Datos de la Cirugía</h3>
        <div class="p-4 bg-slate-700/50 rounded-lg border border-slate-700 space-y-2">
          <SummaryRow label="Paciente" :value="reporte.paciente" />
          <SummaryRow label="Médico" :value="reporte.medico" />
          <SummaryRow label="Fecha de Envío" :value="formatDateTime(reporte.fecha_envio)" />
        </div>
      </div>

      <!-- Resumen de Evaluación -->
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tu Evaluación</h3>
        <div class="p-4 bg-slate-700/50 rounded-lg border border-slate-700">
          <RatingRow label="Puntualidad" :rating="reporte.rating_puntualidad" />
          <RatingRow label="Condiciones" :rating="reporte.rating_condiciones" />
          <RatingRow label="Asesoramiento" :rating="reporte.rating_asesoramiento" />
          <RatingRow label="General" :rating="reporte.rating_evaluacion_general" />
        </div>
      </div>

      <!-- Resumen de Consumo -->
      <div>
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Consumo y Observaciones</h3>
        <div class="p-4 bg-slate-700/50 rounded-lg border border-slate-700 space-y-4">
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
</template>

<script setup>
import { defineComponent, h } from 'vue';

// Props que el componente espera recibir.
defineProps({
  reporte: {
    type: Object,
    required: true
  }
});

// --- COMPONENTES INTERNOS REUTILIZABLES ---

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

// --- FUNCIONES HELPER ---

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + ' hs';
};
</script>