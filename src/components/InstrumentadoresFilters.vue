<!-- src/components/InstrumentadoresFilters.vue -->
<template>
  <div class="p-4 bg-gray-50 dark:bg-slate-900/50 rounded-lg mb-6 border dark:border-slate-700">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
      <!-- Filtro de Búsqueda por Texto -->
      <div class="col-span-1 md:col-span-2">
        <label for="search" class="filter-label">Buscar</label>
        <input id="search" type="text" :value="modelValue.searchTerm" @input="update('searchTerm', $event.target.value)" placeholder="Nombre o DNI..." class="filter-input w-full">
      </div>

      <!-- --- INICIO DE LA MODIFICACIÓN --- -->
      <!-- 1. Se añade el botón de exportación. -->
      <!--    - :disabled="exportDisabled" lo deshabilita si se lo indicamos desde el padre. -->
      <!--    - @click="$emit('export')" emite el evento para que el padre actúe. -->
      <div class="col-span-1 md:col-span-2 lg:col-span-2 flex justify-end">
        <button 
          @click="$emit('export')" 
          :disabled="exportDisabled"
          class="export-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
          Exportar a Excel
        </button>
      </div>
      <!-- --- FIN DE LA MODIFICACIÓN --- -->

      <!-- Filtro de Ordenamiento -->
      <div>
        <label for="sort-by" class="filter-label">Ordenar por</label>
        <select id="sort-by" :value="modelValue.sortBy" @change="update('sortBy', $event.target.value)" class="filter-input w-full">
          <option value="nombre_completo">Nombre</option>
          <option value="ivo_score">Mejor IVO</option>
          <option value="fichas_enviadas">Más Fichas</option>
        </select>
      </div>

      <!-- Filtro de Dirección de Ordenamiento -->
      <div>
        <label class="filter-label">Dirección</label>
        <div class="flex items-center space-x-2 bg-white dark:bg-slate-700 p-1 rounded-md border dark:border-slate-600">
          <button @click="update('sortDir', 'desc')" :class="['sort-button', { 'active': modelValue.sortDir === 'desc' }]">▼ Desc</button>
          <button @click="update('sortDir', 'asc')" :class="['sort-button', { 'active': modelValue.sortDir === 'asc' }]">▲ Asc</button>
        </div>
      </div>

      <!-- Filtro por Rango de IVO -->
      <div class="col-span-1 md:col-span-2">
        <label for="min-ivo" class="filter-label">IVO Mínimo</label>
        <input id="min-ivo" type="number" :value="modelValue.minIvo" @input="update('minIvo', $event.target.value)" placeholder="Ej: 5.0" class="filter-input w-full">
      </div>
      <div class="col-span-1 md:col-span-2">
        <label for="max-ivo" class="filter-label">IVO Máximo</label>
        <input id="max-ivo" type="number" :value="modelValue.maxIvo" @input="update('maxIvo', $event.target.value)" placeholder="Ej: 20.0" class="filter-input w-full">
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  // --- INICIO DE LA MODIFICACIÓN ---
  // 2. Se añade una prop para poder deshabilitar el botón desde el padre.
  exportDisabled: {
    type: Boolean,
    default: false,
  }
  // --- FIN DE LA MODIFICACIÓN ---
});

// --- INICIO DE LA MODIFICACIÓN ---
// 3. Se declara el nuevo evento 'export'.
const emit = defineEmits(['update:modelValue', 'export']);
// --- FIN DE LA MODIFICACIÓN ---

function update(key, value) {
  const newFilters = { ...props.modelValue };
  newFilters[key] = value;
  emit('update:modelValue', newFilters);
}
</script>

<style scoped>
.filter-label { @apply block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1; }
.filter-input { @apply block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white; }
.sort-button { @apply w-full text-center px-3 py-1.5 text-sm rounded-md transition-colors duration-200; }
.sort-button.active { @apply bg-blue-600 text-white shadow; }
/* --- INICIO DE LA MODIFICACIÓN --- */
/* 4. Estilos para el nuevo botón de exportación. */
.export-button {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
/* --- FIN DE LA MODIFICACIÓN --- */
</style>