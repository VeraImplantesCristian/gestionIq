<!-- src/components/ExportModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-md" ref="modalContent">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-4">Generar Reporte de Trazabilidad</h3>
        <p class="text-sm text-gray-600 dark:text-slate-300 mb-6">
          Selecciona el rango de fechas para generar el reporte. Se aplicarán los filtros de paciente, médico y estado que ya tengas seleccionados.
        </p>

        <div class="space-y-4">
          <div>
            <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Desde</label>
            <input type="date" v-model="startDate" id="startDate" class="mt-1 w-full input-form">
          </div>
          <div>
            <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Hasta</label>
            <input type="date" v-model="endDate" id="endDate" class="mt-1 w-full input-form">
          </div>
        </div>

        <div class="mt-6 flex justify-end space-x-4">
          <button @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <button @click="handleGenerate" class="btn-primary">Generar Reporte</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { useToast } from 'vue-toastification';

defineProps({
  show: Boolean,
});
const emit = defineEmits(['close', 'generate']);

const toast = useToast();
const modalContent = ref(null);
const startDate = ref('');
const endDate = ref('');

onClickOutside(modalContent, () => emit('close'));

const handleGenerate = () => {
  if (!startDate.value || !endDate.value) {
    toast.error("Debes seleccionar una fecha de inicio y de fin.");
    return;
  }
  emit('generate', { startDate: startDate.value, endDate: endDate.value });
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.input-form { @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white; }
.btn-primary { @apply bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700; }
.btn-secondary { @apply bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500; }
</style>