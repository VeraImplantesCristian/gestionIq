<!-- src/components/FilterBar.vue -->
<template>
  <div class="p-4 mb-6 bg-gray-50 border-b border-gray-200 rounded-lg dark:bg-slate-800 dark:border-slate-700">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5">
      
      <div class="lg:col-span-2">
        <label for="search" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Buscar (Paciente, Médico)</label>
        <input type="text" v-model="filters.searchTerm" id="search" placeholder="Escriba para buscar..." class="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
      </div>

      <div>
        <label for="status" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Estado</label>
        <!-- **MEJORA:** Añadida la opción 'Expirado' -->
        <select v-model="filters.statusFilter" id="status" class="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
          <option value="todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Enviado">Enviado</option>
          <option value="Expirado">Expirado</option>
        </select>
      </div>

      <div>
        <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Desde</label>
        <input type="date" v-model="filters.startDate" id="startDate" class="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
      </div>

      <div>
        <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Hasta</label>
        <input type="date" v-model="filters.endDate" id="endDate" class="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
      </div>
      
      <div class="lg:col-span-3">
        <label for="instrumentador" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Instrumentador</label>
        <input type="text" v-model="filters.instrumentador" id="instrumentador" placeholder="Nombre del instrumentador..." class="w-full p-2 mt-1 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" />
      </div>

      <div class="flex items-end space-x-2 lg:col-span-2">
        <button @click="applyFilters" class="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700">
          Aplicar Filtros
        </button>
        <button @click="clearFilters" class="w-full px-4 py-2 font-bold text-gray-700 bg-gray-200 rounded-lg shadow hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['update-filters']);

const initialFilters = {
  searchTerm: '',
  statusFilter: 'todos',
  instrumentador: '',
  startDate: '',
  endDate: '',
};
const filters = ref({ ...initialFilters });

const applyFilters = () => {
  emit('update-filters', { ...filters.value });
};

const clearFilters = () => {
  filters.value = { ...initialFilters };
  emit('update-filters', { ...filters.value });
};
</script>