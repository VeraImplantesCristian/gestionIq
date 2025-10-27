<!-- src/views/InstrumentadoresView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="mb-4">
      <input 
        v-model="searchTerm"
        type="text"
        placeholder="Buscar por nombre o DNI..."
        class="block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
      />
    </div>

    <div v-if="loading" class="space-y-4">
      <SkeletonLoader v-for="n in 5" :key="n" />
    </div>

    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error:</strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-else class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th scope="col" @click="sortBy('nombre_completo')" class="table-header" :class="{ 'active-sort': sortKey === 'nombre_completo' }">
              Nombre Completo <span v-if="sortKey === 'nombre_completo'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th scope="col" class="table-header-static">
              Teléfono
            </th>
            <th scope="col" @click="sortBy('fichas_enviadas')" class="table-header" :class="{ 'active-sort': sortKey === 'fichas_enviadas' }">
              Fichas Enviadas <span v-if="sortKey === 'fichas_enviadas'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th scope="col" @click="sortBy('promedio_valoracion_manual')" class="table-header" :class="{ 'active-sort': sortKey === 'promedio_valoracion_manual' }">
              Prom. Manual (1-10) <span v-if="sortKey === 'promedio_valoracion_manual'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th scope="col" @click="sortBy('promedio_puntaje_iq')" class="table-header" :class="{ 'active-sort': sortKey === 'promedio_puntaje_iq' }">
              Prom. Digital (1-5) <span v-if="sortKey === 'promedio_puntaje_iq'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th scope="col" class="table-header-static">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          <tr v-if="processedInstrumentadores.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">No se encontraron instrumentadores.</td>
          </tr>
          <tr v-for="iq in processedInstrumentadores" :key="iq.dni">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ iq.nombre_completo }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ iq.telefono || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300 text-center">{{ iq.fichas_enviadas }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-center" :class="getPromedioColor(iq.promedio_valoracion_manual, 10)">
              {{ iq.promedio_valoracion_manual }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-center" :class="getPromedioColor(iq.promedio_puntaje_iq, 5)">
              {{ iq.promedio_puntaje_iq }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
              <button @click="openWeeklyScoreModal(iq)" class="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300">Valorar</button>
              <button @click="openEditModal(iq)" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Editar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <EditInstrumentadorModal
    :show="isEditModalOpen"
    :instrumentador="selectedInstrumentador"
    @close="isEditModalOpen = false"
    @updated="handleUpdate"
  />

  <RecordWeeklyScoreModal
    :show="isWeeklyScoreModalOpen"
    :instrumentador="selectedInstrumentador"
    @close="isWeeklyScoreModalOpen = false"
    @created="handleUpdate"
  />

  <NewInstrumentadorModal
    :show="isNewModalOpen"
    @close="isNewModalOpen = false"
    @created="handleUpdate"
  />

  <ImportInstrumentadoresModal
    :show="isImportModalOpen"
    @close="isImportModalOpen = false"
    @imported="handleUpdate"
  />
</template>

<script setup>
import { ref, onMounted, onUnmounted, inject, h, markRaw, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import EditInstrumentadorModal from '../components/EditInstrumentadorModal.vue';
import RecordWeeklyScoreModal from '../components/RecordWeeklyScoreModal.vue';
import NewInstrumentadorModal from '../components/NewInstrumentadorModal.vue';
import ImportInstrumentadoresModal from '../components/ImportInstrumentadoresModal.vue';

const headerConfig = inject('header-config');
const isNewModalOpen = ref(false);
const isImportModalOpen = ref(false);

const openNewModal = () => { isNewModalOpen.value = true; };
const openImportModal = () => { isImportModalOpen.value = true; };

onMounted(() => {
  headerConfig.value = {
    title: 'Gestión de Instrumentadores',
    buttons: [
      {
        text: 'Importar XLS',
        action: openImportModal,
        class: 'bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-emerald-700 flex items-center space-x-2',
        icon: markRaw({
          render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4' })
          ])
        })
      },
      {
        text: 'Nuevo Instrumentador',
        action: openNewModal,
        class: 'bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 flex items-center space-x-2',
        icon: markRaw({
          render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [
            h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 6v6m0 0v6m0-6h6m-6 0H6' })
          ])
        })
      }
    ]
  };
});
onUnmounted(() => {
  headerConfig.value = { title: '', buttons: [] };
});

const toast = useToast();
const instrumentadores = ref([]);
const loading = ref(true);
const error = ref(null);

const isEditModalOpen = ref(false);
const isWeeklyScoreModalOpen = ref(false);
const selectedInstrumentador = ref(null);

const searchTerm = ref('');
const sortKey = ref('promedio_valoracion_manual');
const sortDirection = ref('desc');

const processedInstrumentadores = computed(() => {
  let filtered = [...instrumentadores.value];
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase();
    filtered = filtered.filter(iq => 
      iq.nombre_completo.toLowerCase().includes(term) ||
      (iq.dni && iq.dni.toLowerCase().includes(term))
    );
  }
  if (sortKey.value) {
    filtered.sort((a, b) => {
      const valA = a[sortKey.value];
      const valB = b[sortKey.value];
      let comparison = 0;
      if (valA > valB) comparison = 1;
      else if (valA < valB) comparison = -1;
      return sortDirection.value === 'asc' ? comparison : -comparison;
    });
  }
  return filtered;
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortDirection.value = 'desc';
  }
};

const fetchInstrumentadores = async () => {
  loading.value = true;
  error.value = null;
  try {
    const { data, error: fetchError } = await supabase.rpc('get_instrumentadores_con_stats');
    if (fetchError) throw fetchError;
    instrumentadores.value = data;
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar los instrumentadores: " + err.message);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInstrumentadores);

const getPromedioColor = (promedio, escala) => {
  const p = (promedio / escala) * 100;
  if (p >= 90) return 'text-green-500 dark:text-green-400';
  if (p >= 80) return 'text-yellow-500 dark:text-yellow-400';
  if (p >= 65) return 'text-orange-500 dark:text-orange-400';
  if (p > 0) return 'text-red-500 dark:text-red-400';
  return 'text-gray-500 dark:text-gray-400';
};

const openEditModal = (instrumentador) => {
  selectedInstrumentador.value = instrumentador;
  isEditModalOpen.value = true;
};

const openWeeklyScoreModal = (instrumentador) => {
  selectedInstrumentador.value = instrumentador;
  isWeeklyScoreModalOpen.value = true;
};

const handleUpdate = () => {
  fetchInstrumentadores();
};
</script>

<!-- === NUEVOS ESTILOS === -->
<style scoped>
.table-header {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400 cursor-pointer transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-slate-600;
}
.table-header-static {
  @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400;
}
.active-sort {
  @apply bg-gray-100 dark:bg-slate-600;
}
</style>