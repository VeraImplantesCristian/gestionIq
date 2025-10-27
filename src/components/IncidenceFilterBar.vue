<!-- src/components/IncidenceFilterBar.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-md mb-6">
    <!-- 
      Ajustamos la grilla para que tenga hasta 5 columnas en pantallas grandes,
      dando espacio al nuevo filtro.
    -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      <!-- === NUEVO: Filtro por Instrumentador === -->
      <div>
        <label for="iq-filter" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Instrumentador</label>
        <select 
          id="iq-filter" 
          v-model="filters.instrumentadorDni"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          <option value="">Todos</option>
          <!-- Iteramos sobre la lista de instrumentadores recibida como prop -->
          <option v-for="iq in instrumentadores" :key="iq.dni" :value="iq.dni">
            {{ iq.nombre_completo }}
          </option>
        </select>
      </div>

      <!-- Filtro por Tipo -->
      <div>
        <label for="type-filter" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Tipo</label>
        <select 
          id="type-filter" 
          v-model="filters.type"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          <option value="">Todos</option>
          <option>Caja Sucia</option>
          <option>Faltante de Instrumental</option>
          <option>Instrumental Dañado</option>
          <option>Otro</option>
        </select>
      </div>

      <!-- Filtro por Estado -->
      <div>
        <label for="status-filter" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Estado</label>
        <select 
          id="status-filter" 
          v-model="filters.status"
          class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
          <option value="">Todos</option>
          <option value="Abierta">Abierta</option>
          <option value="Resuelta">Resuelta</option>
        </select>
      </div>

      <!-- Filtro por Fecha Desde -->
      <div>
        <label for="start-date" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Desde</label>
        <input 
          type="date" 
          id="start-date" 
          v-model="filters.startDate"
          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
      </div>

      <!-- Filtro por Fecha Hasta -->
      <div>
        <label for="end-date" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Hasta</label>
        <input 
          type="date" 
          id="end-date" 
          v-model="filters.endDate"
          class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-white"
        >
      </div>

    </div>
    
    <div class="mt-4 flex justify-end space-x-3">
      <button 
        @click="apply" 
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Aplicar Filtros
      </button>
      <button 
        @click="clear" 
        class="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-slate-600 text-sm font-medium rounded-md text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        Limpiar
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- NUEVO PROP ---
// El componente ahora acepta una lista de instrumentadores.
defineProps({
  instrumentadores: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['update-filters']);

const initialFilters = {
  instrumentadorDni: '', // Nuevo campo en el estado de filtros
  type: '',
  status: '',
  startDate: '',
  endDate: ''
};
const filters = ref({ ...initialFilters });

const apply = () => {
  emit('update-filters', { ...filters.value });
};

const clear = () => {
  filters.value = { ...initialFilters };
  emit('update-filters', { ...filters.value });
};
</script>