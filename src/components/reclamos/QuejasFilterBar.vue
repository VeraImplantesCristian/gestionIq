<!-- src/components/reclamos/QuejasFilterBar.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6">
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      
      <!-- Filtro por Médico -->
      <div class="space-y-1">
        <label for="medico" class="form-label">Médico</label>
        <input type="text" v-model="filters.medico" id="medico" placeholder="Buscar por nombre..." class="form-input">
      </div>
      
      <!-- Filtro por Estado -->
      <div class="space-y-1">
        <label for="estado" class="form-label">Estado</label>
        <select v-model="filters.estado" id="estado" class="form-input">
          <option value="Todos">Todos</option>
          <option value="Abierta">Abierta</option>
          <option value="En Proceso">En Proceso</option>
          <option value="Resuelta">Resuelta</option>
          <option value="Cerrada">Cerrada</option>
        </select>
      </div>

      <!-- Filtro por Severidad -->
      <div class="space-y-1">
        <label for="severidad" class="form-label">Severidad</label>
        <select v-model="filters.severidad" id="severidad" class="form-input">
          <option value="Todas">Todas</option>
          <option value="Baja">Baja</option>
          <option value="Media">Media</option>
          <option value="Alta">Alta</option>
          <option value="Crítica">Crítica</option>
        </select>
      </div>

      <!-- Botones de Acción -->
      <div class="flex items-end space-x-2">
        <button @click="handleApply" class="btn-primary w-full">Aplicar</button>
        <button @click="handleClear" class="btn-secondary w-full">Limpiar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, onMounted } from 'vue';

const emit = defineEmits(['update-filters']);

const filters = reactive({
  medico: '',
  estado: 'Todos',
  severidad: 'Todas',
});

const handleApply = () => {
  emit('update-filters', { ...filters });
};

const handleClear = () => {
  filters.medico = '';
  filters.estado = 'Todos';
  filters.severidad = 'Todas';
  handleApply();
};

onMounted(handleApply);
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
.form-input { @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
</style>