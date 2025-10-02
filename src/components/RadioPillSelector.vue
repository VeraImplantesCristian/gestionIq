<!-- src/components/RadioPillSelector.vue -->
<template>
  <div>
    <label class="block text-lg font-medium text-slate-800 dark:text-slate-200 mb-3">{{ label }}</label>
    <div class="flex space-x-4">
      <button 
        type="button"
        @click="selectOption(true)"
        :class="[
          'py-2 px-6 rounded-full text-lg font-semibold transition-all duration-200',
          modelValue === true 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        ]"
      >
        Sí
      </button>
      <button 
        type="button"
        @click="selectOption(false)"
        :class="[
          'py-2 px-6 rounded-full text-lg font-semibold transition-all duration-200',
          modelValue === false 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
        ]"
      >
        No
      </button>
    </div>
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  modelValue: Boolean,
  error: String,
});

const emit = defineEmits(['update:modelValue']);

const selectOption = (value) => {
  emit('update:modelValue', value);
};
</script>