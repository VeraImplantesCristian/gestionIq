<template>
  <div class="space-y-10">
    <h2 class="text-2xl font-bold text-gray-800">Paso 1: Cuestionario y Evaluación</h2>
    <div class="space-y-8">
      <RadioPillSelector label="1. ¿Recibió el set de Instrumental/Implantes completo?" v-model="model.set_completo" :error="errors.set_completo" />
      <RadioPillSelector v-if="model.set_completo === false" label="2. Si fue negativa, ¿se le informó a tiempo sobre la falta?" v-model="model.informe_faltante" :error="errors.informe_faltante" />
    </div>
    <div class="space-y-6">
      <h3 class="text-xl font-semibold text-gray-700">Evaluación (1 Malo - 5 Excelente)</h3>
      <RatingSelector v-for="rating in ratings" :key="rating.key" :label="rating.label" v-model="model[rating.key]" :error="errors[rating.key]" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import RadioPillSelector from './RadioPillSelector.vue';
import RatingSelector from './RatingSelector.vue';

const props = defineProps({ modelValue: Object, errors: Object });
const emit = defineEmits(['update:modelValue']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const ratings = [
  { key: 'rating_puntualidad', label: 'Puntualidad de entrega' },
  { key: 'rating_condiciones', label: 'Condiciones del instrumental' },
  { key: 'rating_asesoramiento', label: 'Asesoramiento del técnico' },
  { key: 'rating_evaluacion_general', label: 'Evaluación general' },
];
</script>