<!-- src/components/AutocompleteSearch.vue -->
<template>
  <div class="relative" ref="searchContainer">
    <input
      type="text"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="showResults = true"
      :placeholder="placeholder"
      class="form-input"
    />
    <ul v-if="showResults && results.length > 0" class="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg max-h-60 overflow-auto">
      <li 
        v-for="result in results" 
        :key="result.id" 
        @click="selectResult(result)" 
        class="px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-500 hover:text-white cursor-pointer"
      >
        <slot :result="result"></slot>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

defineProps({
  modelValue: String,
  results: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Buscar...' }
});

const emit = defineEmits(['update:modelValue', 'select']);

const searchContainer = ref(null);
const showResults = ref(false);

onClickOutside(searchContainer, () => {
  showResults.value = false;
});

const selectResult = (result) => {
  emit('select', result);
  showResults.value = false;
};
</script>

<style scoped>
.form-input { @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white; }
</style>