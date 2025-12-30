<!-- src/views/instrumentadores/InstrumentadorUpload.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="max-w-7xl mx-auto">
      
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Galería de Archivos</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Busca y visualiza todos los comprobantes subidos al sistema.</p>
      </header>

      <div class="flex flex-col sm:flex-row gap-4 mb-8">
        <div class="relative flex-grow">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            v-model="searchTerm"
            type="search" 
            placeholder="Buscar por nombre de paciente..." 
            class="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
          />
        </div>
        <div class="flex-shrink-0 inline-flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 gap-1">
          <button @click="activeTab = 'recientes'" :class="['tab-btn', { 'tab-btn--active': activeTab === 'recientes' }]">Recientes</button>
          <button @click="activeTab = 'todos'" :class="['tab-btn', { 'tab-btn--active': activeTab === 'todos' }]">Todos</button>
        </div>
      </div>

      <div v-if="isLoading" class="text-center py-16">
        <p class="text-slate-500">Cargando archivos...</p>
      </div>

      <div v-else-if="filteredFiles.length === 0" class="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow">
        <p class="font-semibold text-slate-700 dark:text-slate-200">No se encontraron archivos</p>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Intenta con otro término de búsqueda o revisa los filtros.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        <!-- --- INICIO DE LA MODIFICACIÓN --- -->
        <!-- Se reemplaza el div de placeholder por el componente ArchivoCard. -->
        <!-- Esto asegura que se renderice la tarjeta visual y no el texto plano. -->
        <ArchivoCard 
          v-for="archivo in filteredFiles" 
          :key="archivo.object_key"
          :archivo="archivo"
        />
        <!-- --- FIN DE LA MODIFICACIÓN --- -->
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';
// --- INICIO DE LA MODIFICACIÓN ---
// 1. Se asegura la importación del componente ArchivoCard.
//    La ruta debe ser correcta según la estructura de tu proyecto.
import ArchivoCard from '../../components/ArchivoCard.vue';
// --- FIN DE LA MODIFICACIÓN ---

const allFiles = ref([]);
const isLoading = ref(true);
const error = ref(null);
const searchTerm = ref('');
const activeTab = ref('recientes');

const toast = useToast();

const fetchFiles = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_galeria_archivos');
    if (rpcError) throw rpcError;
    allFiles.value = data || [];
  } catch (err) {
    console.error("Error al cargar la galería de archivos:", err);
    error.value = "No se pudieron cargar los archivos.";
    toast.error(error.value);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchFiles);

const filteredFiles = computed(() => {
  let files = allFiles.value;

  if (activeTab.value === 'recientes') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    files = files.filter(file => new Date(file.fecha_creacion) > thirtyDaysAgo);
  }

  if (searchTerm.value.trim()) {
    const lowerCaseSearch = searchTerm.value.toLowerCase();
    files = files.filter(file => 
      file.pacientes.some(paciente => 
        paciente.toLowerCase().includes(lowerCaseSearch)
      )
    );
  }

  return files;
});
</script>

<style scoped>
.tab-btn {
  @apply px-4 py-2 rounded-md text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700/60;
}
.tab-btn--active {
  @apply bg-white text-slate-900 shadow-sm dark:bg-slate-600 dark:text-white;
}
</style>