<!-- src/components/PaginationControls.vue -->
<template>
  <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6 rounded-b-lg">
    <!-- Información de resultados en móvil -->
    <div class="flex items-center justify-between flex-1 sm:hidden">
       <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
        Anterior
      </button>
      <span class="text-sm text-gray-700">
        Pág {{ currentPage }} de {{ totalPages }}
      </span>
       <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
        Siguiente
      </button>
    </div>

    <!-- Navegación completa en escritorio -->
    <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
      <div>
        <p class="text-sm text-gray-700">
          Mostrando de
          <span class="font-medium">{{ startItem }}</span>
          a
          <span class="font-medium">{{ endItem }}</span>
          de
          <span class="font-medium">{{ totalItems }}</span>
          resultados
        </p>
      </div>
      <div>
        <nav class="relative z-0 inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
          <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50">
            <span class="sr-only">Anterior</span>
            <!-- Heroicon name: solid/chevron-left -->
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
          </button>
          
          <span class="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300">
            Página {{ currentPage }} de {{ totalPages }}
          </span>

          <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages || totalPages === 0" class="relative inline-flex items-center px-2 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50">
            <span class="sr-only">Siguiente</span>
            <!-- Heroicon name: solid/chevron-right -->
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" /></svg>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// Definimos las propiedades que el componente recibe del padre.
const props = defineProps({
  currentPage: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  itemsPerPage: { type: Number, required: true },
});

// Definimos el evento que se emitirá al padre.
const emit = defineEmits(['page-changed']);

// Calculamos el número total de páginas.
const totalPages = computed(() => Math.ceil(props.totalItems / props.itemsPerPage));

// Calculamos el número del primer ítem que se muestra en la página actual.
const startItem = computed(() => (props.currentPage - 1) * props.itemsPerPage + 1);

// Calculamos el número del último ítem.
const endItem = computed(() => Math.min(props.currentPage * props.itemsPerPage, props.totalItems));

// Función para emitir el evento de cambio de página.
const changePage = (newPage) => {
  if (newPage >= 1 && newPage <= totalPages.value) {
    emit('page-changed', newPage);
  }
};
</script>