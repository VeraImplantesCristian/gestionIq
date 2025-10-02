<!-- src/views/InstrumentadoresView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <div class="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      
      <div class="flex flex-wrap gap-4 justify-between items-center mb-6">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-slate-100">Gestión de Instrumentadores</h1>
        <router-link to="/admin" class="bg-white text-gray-700 font-bold py-2 px-4 rounded-lg shadow hover:bg-gray-100 flex items-center space-x-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          <span>Volver al Panel</span>
        </router-link>
      </div>

      <!-- Barra de Búsqueda -->
      <div class="mb-4">
        <input 
          type="text" 
          v-model="searchTerm" 
          placeholder="Buscar por DNI o Nombre..." 
          class="w-full max-w-sm p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
        />
      </div>

      <div v-if="loading" class="text-center py-10">
        <svg class="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
        <p class="mt-2 text-gray-600 dark:text-slate-400">Cargando instrumentadores...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <!-- VISTA DE TABLA PARA DESKTOP -->
      <div v-else-if="filteredInstrumentadores.length > 0" class="hidden sm:block bg-white shadow-md rounded-lg overflow-hidden dark:bg-slate-800">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
          <thead class="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th scope="col" @click="sortBy('dni')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600">DNI</th>
              <th scope="col" @click="sortBy('nombre_completo')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600">Nombre Completo</th>
              <th scope="col" @click="sortBy('cirugias_realizadas')" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-600">Cirugías Realizadas</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
            <tr v-for="instrumentador in paginatedInstrumentadores" :key="instrumentador.dni">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ instrumentador.dni }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ instrumentador.nombre_completo }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">
                <span class="px-3 py-1 inline-flex text-base leading-5 font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{{ instrumentador.cirugias_realizadas }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button @click="openEditModal(instrumentador)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- VISTA DE TARJETAS PARA MÓVIL -->
      <div v-else-if="filteredInstrumentadores.length > 0" class="sm:hidden space-y-3">
        <div v-for="instrumentador in paginatedInstrumentadores" :key="instrumentador.dni" class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow">
          <div class="flex justify-between items-start">
            <div>
              <p class="font-bold text-lg text-gray-900 dark:text-slate-100">{{ instrumentador.nombre_completo }}</p>
              <p class="text-sm text-gray-500 dark:text-slate-400">DNI: {{ instrumentador.dni }}</p>
            </div>
            <button @click="openEditModal(instrumentador)" class="text-indigo-600 p-1 -mt-1 -mr-1"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
          </div>
          <div class="mt-4 flex justify-between items-center">
            <p class="text-sm text-gray-600 dark:text-slate-300">Cirugías Realizadas:</p>
            <span class="px-3 py-1 inline-flex text-base leading-5 font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{{ instrumentador.cirugias_realizadas }}</span>
          </div>
        </div>
      </div>
      
      <!-- ESTADO VACÍO MEJORADO -->
      <div v-else class="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-slate-100">No se encontraron resultados</h3>
        <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">No hay instrumentadores que coincidan con tu búsqueda. Intenta con otro término.</p>
      </div>

      <!-- PAGINACIÓN -->
      <div v-if="filteredInstrumentadores.length > itemsPerPage" class="mt-6">
        <!-- (Aquí iría un componente de paginación si lo tuvieras) -->
      </div>
      
      <!-- MODAL DE EDICIÓN -->
      <EditInstrumentadorModal 
        :show="isEditModalVisible" 
        :instrumentador="selectedInstrumentador" 
        @close="closeEditModal"
        @instrumentador-updated="handleUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import EditInstrumentadorModal from '../components/EditInstrumentadorModal.vue';

const instrumentadores = ref([]);
const loading = ref(true);
const error = ref(null);
const toast = useToast();
const searchTerm = ref('');
const sortKey = ref('cirugias_realizadas');
const sortOrder = ref('desc');

const isEditModalVisible = ref(false);
const selectedInstrumentador = ref(null);

// Lógica de Paginación (simple, para futura expansión)
const currentPage = ref(1);
const itemsPerPage = ref(15);

const fetchInstrumentadores = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase.from('instrumentadores_stats').select('*');
    if (fetchError) throw fetchError;
    instrumentadores.value = data;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los datos: " + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInstrumentadores);

// Lógica de filtrado y ordenamiento
const filteredInstrumentadores = computed(() => {
  let result = [...instrumentadores.value];
  if (searchTerm.value) {
    const lowerSearch = searchTerm.value.toLowerCase();
    result = result.filter(i => 
      i.nombre_completo.toLowerCase().includes(lowerSearch) || 
      i.dni.includes(lowerSearch)
    );
  }
  
  result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });

  return result;
});

const paginatedInstrumentadores = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return filteredInstrumentadores.value.slice(start, end);
});

function sortBy(key) {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'desc';
  }
}

// Lógica del Modal
function openEditModal(instrumentador) {
  selectedInstrumentador.value = instrumentador;
  isEditModalVisible.value = true;
}

function closeEditModal() {
  isEditModalVisible.value = false;
}

function handleUpdate() {
  // Cuando el modal nos avisa que se actualizó, volvemos a buscar los datos frescos.
  fetchInstrumentadores();
}
</script>