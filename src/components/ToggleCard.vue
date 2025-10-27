<!-- src/components/ToggleCard.vue -->
<template>
  <button
    type="button"
    @click="select"
    class="flex-1 p-4 border-2 rounded-xl text-left transition-all duration-200"
    :class="isSelected
      ? 'bg-blue-50 border-blue-500 shadow-sm' // Estilo cuando está seleccionado
      : 'bg-white border-slate-300 hover:border-slate-400' // Estilo por defecto
    "
  >
    <div class="flex items-center space-x-3">
      <!-- Slot para el ícono -->
      <div 
        class="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
        :class="isSelected ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600'"
      >
        <slot></slot>
      </div>
      <!-- Etiqueta -->
      <div>
        <p class="font-bold text-lg" :class="isSelected ? 'text-blue-900' : 'text-slate-800'">
          {{ label }}
        </p>
      </div>
    </div>
  </button>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  modelValue: { type: String, default: '' },
});

const emit = defineEmits(['update:modelValue']);

// Verifica si esta tarjeta es la que está actualmente seleccionada
const isSelected = computed(() => props.modelValue === props.value);

// Emite el valor de esta tarjeta al componente padre para actualizar el v-model
const select = () => {
  emit('update:modelValue', props.value);
};
</script>