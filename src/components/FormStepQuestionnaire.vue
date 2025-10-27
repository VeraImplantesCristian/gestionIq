<!-- src/components/FormStepQuestionnaire.vue -->
<template>
  <div class="space-y-8">
    <!-- Título de la Sección -->
    <div>
      <h2 class="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Cuestionario de Calidad</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Responda las siguientes preguntas sobre el servicio.</p>
    </div>

    <!-- Controles Segmentados (Sí/No) -->
    <div class="space-y-6">
      <!-- Pregunta 1: Set Completo -->
      <div>
        <label class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">1. ¿Recibió el set de Instrumental/Implantes completo?</label>
        <div class="mt-3 inline-flex gap-2">
          <button 
            type="button"
            @click="updateFormData({ set_completo: true })"
            :class="['segmented-button', { 'active': formData.set_completo === true }]"
            :aria-pressed="formData.set_completo === true"
          >
            Sí
          </button>
          <button 
            type="button"
            @click="updateFormData({ set_completo: false })"
            :class="['segmented-button', { 'active': formData.set_completo === false }]"
            :aria-pressed="formData.set_completo === false"
          >
            No
          </button>
        </div>
        <p v-if="errors.set_completo" class="text-sm text-red-500 mt-1">{{ errors.set_completo }}</p>
      </div>

      <!-- Pregunta 2: Informó Faltante (condicional) -->
      <Transition name="fade-slide">
        <div v-if="formData.set_completo === false">
          <label class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">2. Si fue negativa, ¿se le informó a tiempo sobre la falta?</label>
          <div class="mt-3 inline-flex gap-2">
            <button 
              type="button"
              @click="updateFormData({ informe_faltante: true })"
              :class="['segmented-button', { 'active': formData.informe_faltante === true }]"
              :aria-pressed="formData.informe_faltante === true"
            >
              Sí
            </button>
            <button 
              type="button"
              @click="updateFormData({ informe_faltante: false })"
              :class="['segmented-button', { 'active': formData.informe_faltante === false }]"
              :aria-pressed="formData.informe_faltante === false"
            >
              No
            </button>
          </div>
          <p v-if="errors.informe_faltante" class="text-sm text-red-500 mt-1">{{ errors.informe_faltante }}</p>
        </div>
      </Transition>
    </div>

    <!-- Chips de Rating (1-5) -->
    <div class="space-y-6 pt-6 border-t border-slate-200/70 dark:border-slate-700/60">
      <h3 class="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Evaluación del Servicio</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 -mt-5">Califique de 1 (Malo) a 5 (Excelente).</p>
      
      <div v-for="rating in ratings" :key="rating.key" class="space-y-3">
        <label class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">{{ rating.label }}</label>
        <div class="flex items-center gap-2">
          <button 
            v-for="value in 5" 
            :key="value"
            type="button"
            @click="updateFormData({ [rating.key]: value })"
            class="rating-chip"
            :class="[
              formData[rating.key] === value ? `ring-2 ring-blue-500 ${ratingColors[value-1].active}` : ratingColors[value-1].inactive
            ]"
          >
            {{ value }}
          </button>
        </div>
        <p v-if="errors[rating.key]" class="text-sm text-red-500">{{ errors[rating.key] }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['update:form-data']);

const updateFormData = (payload) => {
  emit('update:form-data', payload);
};

const ratings = [
  { key: 'rating_puntualidad', label: 'Puntualidad de entrega' },
  { key: 'rating_condiciones', label: 'Condiciones del instrumental' },
  { key: 'rating_asesoramiento', label: 'Asesoramiento del técnico' },
  { key: 'rating_evaluacion_general', label: 'Evaluación general' },
];

const ratingColors = [
  { inactive: 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300', active: 'bg-red-500 text-white' },
  { inactive: 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300', active: 'bg-amber-500 text-white' },
  { inactive: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300', active: 'bg-yellow-500 text-white' },
  { inactive: 'bg-lime-100 dark:bg-lime-900/20 text-lime-800 dark:text-lime-300', active: 'bg-lime-500 text-white' },
  { inactive: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300', active: 'bg-emerald-500 text-white' },
];
</script>

<style scoped>
.segmented-button {
  @apply rounded-full px-5 py-2 text-sm font-semibold ring-1 ring-inset transition-colors;
  @apply ring-slate-300 dark:ring-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800;
}
.segmented-button.active {
  @apply bg-blue-600 text-white ring-blue-600;
}
.rating-chip {
  @apply h-11 w-11 grid place-content-center rounded-full font-bold text-lg transition-all duration-150 transform hover:scale-110;
}
</style>