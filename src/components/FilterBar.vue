<!-- src/components/FilterBar.vue (COMPLETO Y CON ESTADO DE CARGA) -->
<template>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      
      <div class="space-y-2">
        <label for="paciente" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Paciente</label>
        <input type="text" v-model="filters.paciente" id="paciente" placeholder="Nombre del paciente..." class="w-full input-form">
      </div>
      <div class="space-y-2">
        <label for="medico" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Médico</label>
        <input type="text" v-model="filters.medico" id="medico" placeholder="Nombre del médico..." class="w-full input-form">
      </div>

      <div class="space-y-2">
        <label for="status" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Estado</label>
        <select v-model="filters.statusFilter" id="status" class="w-full input-form">
          <option value="todos">Todos</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Enviado">Enviado</option>
          <option value="Expirado">Expirado</option>
        </select>
      </div>

      <div class="space-y-2">
        <label for="startDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Desde</label>
        <input type="date" v-model="filters.startDate" id="startDate" class="w-full input-form">
      </div>
      <div class="space-y-2">
        <label for="endDate" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Hasta</label>
        <input type="date" v-model="filters.endDate" id="endDate" class="w-full input-form">
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center space-x-2">
        <button @click="setToday" class="btn-secondary text-sm">Hoy</button>
        <button @click="setThisWeek" class="btn-secondary text-sm">Esta Semana</button>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button @click="handleClear" class="btn-secondary">Limpiar</button>
        <button @click="handleApply" class="btn-primary">Aplicar Filtros</button>
        
        <!-- CAMBIO: Los botones ahora están deshabilitados y muestran un texto diferente durante la exportación -->
        <button @click="$emit('export-pdf')" class="btn-export-simple" :disabled="isExporting">
          {{ isExporting ? 'Exportando...' : 'Exportar Lista' }}
        </button>
        <button @click="$emit('export-traceability')" class="btn-traceability" :disabled="isExporting">
          {{ isExporting ? 'Exportando...' : 'Exportar Trazabilidad' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, format } from 'date-fns';

// CAMBIO: Se añade la prop 'isExporting' para recibir el estado desde el padre.
defineProps({
  isExporting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update-filters', 'export-pdf', 'export-traceability']);

const filters = reactive({
  paciente: '',
  medico: '',
  statusFilter: 'todos',
  startDate: '',
  endDate: '',
});

const handleApply = () => {
  emit('update-filters', { ...filters });
};

const handleClear = () => {
  filters.paciente = '';
  filters.medico = '';
  filters.statusFilter = 'todos';
  filters.startDate = '';
  filters.endDate = '';
  handleApply();
};

const formatDateForInput = (date) => format(date, 'yyyy-MM-dd');

const setToday = () => {
  const now = new Date();
  filters.startDate = formatDateForInput(startOfDay(now));
  filters.endDate = formatDateForInput(endOfDay(now));
  handleApply();
};

const setThisWeek = () => {
  const now = new Date();
  filters.startDate = formatDateForInput(startOfWeek(now, { weekStartsOn: 1 }));
  filters.endDate = formatDateForInput(endOfWeek(now, { weekStartsOn: 1 }));
  handleApply();
};
</script>

<style scoped>
.input-form {
  @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white;
}
.btn-primary {
  @apply bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-secondary {
  @apply bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
.btn-export-simple {
  @apply bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait;
}
.btn-traceability {
  @apply bg-teal-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-teal-700 disabled:opacity-50 disabled:cursor-wait;
}
</style>