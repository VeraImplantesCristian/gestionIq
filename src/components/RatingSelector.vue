<!-- src/components/RatingSelector.vue -->
<template>
  <div>
    <label class="block text-lg font-medium text-slate-800 dark:text-slate-200">{{ label }}</label>
    
    <div class="mt-3 flex items-center space-x-2 sm:space-x-3">
      <button
        v-for="option in ratingOptions"
        :key="option.value"
        type="button"
        @click="selectRating(option.value)"
        class="flex-1 sm:flex-initial sm:w-12 sm:h-12 h-12 rounded-full text-lg font-bold transition-all duration-200 ease-in-out transform focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="[
          modelValue === option.value
            ? `${option.selectedBg} text-white shadow-md scale-110`
            : `${option.defaultBg} ${option.defaultText} ${option.darkDefaultBg} ${option.darkDefaultText} hover:scale-105 hover:shadow-sm`,
          option.ringColor
        ]"
      >
        {{ option.value }}
      </button>
    </div>
    
    <div class="mt-2 h-6">
      <p v-if="selectedOptionLabel" class="text-sm font-semibold" :class="selectedOptionTextColor">
        {{ selectedOptionLabel }}
      </p>
    </div>

    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: { type: String, required: true },
  modelValue: { type: Number, default: null },
  error: { type: String, default: '' }
});

const emit = defineEmits(['update:modelValue']);

// **MEJORA:** Añadimos clases para el modo oscuro en la configuración
const ratingOptions = [
  { value: 1, label: 'Muy malo', selectedBg: 'bg-red-500', defaultBg: 'bg-red-100', defaultText: 'text-red-700', ringColor: 'focus:ring-red-500', darkDefaultBg: 'dark:bg-red-500/20', darkDefaultText: 'dark:text-red-400' },
  { value: 2, label: 'Malo', selectedBg: 'bg-orange-500', defaultBg: 'bg-orange-100', defaultText: 'text-orange-700', ringColor: 'focus:ring-orange-500', darkDefaultBg: 'dark:bg-orange-500/20', darkDefaultText: 'dark:text-orange-400' },
  { value: 3, label: 'Normal', selectedBg: 'bg-yellow-500', defaultBg: 'bg-yellow-100', defaultText: 'text-yellow-700', ringColor: 'focus:ring-yellow-500', darkDefaultBg: 'dark:bg-yellow-500/20', darkDefaultText: 'dark:text-yellow-400' },
  { value: 4, label: 'Bueno', selectedBg: 'bg-lime-500', defaultBg: 'bg-lime-100', defaultText: 'text-lime-700', ringColor: 'focus:ring-lime-500', darkDefaultBg: 'dark:bg-lime-500/20', darkDefaultText: 'dark:text-lime-400' },
  { value: 5, label: 'Excelente', selectedBg: 'bg-emerald-500', defaultBg: 'bg-emerald-100', defaultText: 'text-emerald-700', ringColor: 'focus:ring-emerald-500', darkDefaultBg: 'dark:bg-emerald-500/20', darkDefaultText: 'dark:text-emerald-400' },
];

const selectRating = (value) => {
  emit('update:modelValue', value);
};

const selectedOptionLabel = computed(() => {
  if (!props.modelValue) return '';
  return ratingOptions.find(opt => opt.value === props.modelValue)?.label || '';
});

const selectedOptionTextColor = computed(() => {
  if (!props.modelValue) return '';
  const option = ratingOptions.find(opt => opt.value === props.modelValue);
  return option ? `${option.selectedBg.replace('bg-', 'text-')} dark:${option.selectedBg.replace('-500', '-400').replace('bg-', 'text-')}` : '';
});
</script>