<!-- src/components/FilterBar.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 p-4 rounded-lg shadow mb-6 space-y-4">
    
    <!-- FILA 1: Filtros Principales y Control de Fechas -->
    <div class="flex flex-wrap items-end gap-4">
      <!-- Filtros de Texto -->
      <div class="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label for="paciente" class="filter-label">Paciente</label>
          <input type="text" v-model="filters.paciente" id="paciente" placeholder="Nombre del paciente..." class="input-form">
        </div>
        <div>
          <label for="medico" class="filter-label">Médico</label>
          <input type="text" v-model="filters.medico" id="medico" placeholder="Nombre del médico..." class="input-form">
        </div>
        <div>
          <label for="instrumentador" class="filter-label">Instrumentador</label>
          <input type="text" v-model="filters.instrumentador" id="instrumentador" placeholder="Nombre..." class="input-form">
        </div>
      </div>
      
      <!-- ========= INICIO DE LA MEJORA: MENÚ DE RANGO DE FECHAS ========= -->
      <div class="grid grid-cols-2 gap-4 sm:flex sm:gap-2">
        <!-- Menú Desplegable de Rangos Predefinidos -->
        <div class="relative" ref="dateRangeMenu">
          <label class="filter-label">Fichas Recibidas</label>
          <button @click="isDateRangeMenuOpen = !isDateRangeMenuOpen" class="btn-secondary w-full flex items-center justify-between">
            <span>{{ selectedRangeLabel }}</span>
            <ChevronDownIcon class="h-5 w-5" />
          </button>
          <Transition name="fade">
            <div v-if="isDateRangeMenuOpen" class="date-range-menu">
              <button @click="setDateRange('today')" class="date-range-menu-item">Hoy</button>
              <button @click="setDateRange('week')" class="date-range-menu-item">Esta Semana</button>
              <button @click="setDateRange('month')" class="date-range-menu-item">Este Mes</button>
            </div>
          </Transition>
        </div>
        <!-- Filtros de Fecha Manual (Personalizado) -->
        <div>
          <label for="startDate" class="filter-label">Desde</label>
          <input type="date" v-model="filters.startDate" id="startDate" class="input-form">
        </div>
        <div>
          <label for="endDate" class="filter-label">Hasta</label>
          <input type="date" v-model="filters.endDate" id="endDate" class="input-form">
        </div>
      </div>
      <!-- ========= FIN DE LA MEJORA ========= -->
    </div>

    <!-- FILA 2: Filtros de Análisis y Acciones -->
    <div class="border-t border-gray-200 dark:border-slate-700 pt-4">
      <div class="flex flex-wrap items-end gap-4">
        <!-- Filtros de Calidad y Estado -->
        <div class="flex-grow grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
          <div>
            <label for="status" class="filter-label">Estado</label>
            <select v-model="filters.estado" id="status" class="input-form">
              <option value="todos">Todos</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Enviado">Enviado</option>
              <option value="Expirado">Expirado</option>
            </select>
          </div>
          <div>
            <label for="puntualidad" class="filter-label">Puntualidad ≤</label>
            <select v-model.number="filters.rating_puntualidad_max" id="puntualidad" class="input-form">
              <option :value="null">Cualquiera</option>
              <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
            </select>
          </div>
          <div>
            <label for="condiciones" class="filter-label">Condiciones ≤</label>
            <select v-model.number="filters.rating_condiciones_max" id="condiciones" class="input-form">
              <option :value="null">Cualquiera</option>
              <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
            </select>
          </div>
          <div>
            <label for="asesoramiento" class="filter-label">Asesoramiento ≤</label>
            <select v-model.number="filters.rating_asesoramiento_max" id="asesoramiento" class="input-form">
              <option :value="null">Cualquiera</option>
              <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
            </select>
          </div>
          <div>
            <label for="general" class="filter-label">General ≤</label>
            <select v-model.number="filters.rating_evaluacion_general_max" id="general" class="input-form">
              <option :value="null">Cualquiera</option>
              <option v-for="n in 4" :key="n" :value="n">{{ n }} ★</option>
            </select>
          </div>
        </div>
        
        <!-- Botones de Acción -->
        <div class="flex items-center gap-2 shrink-0">
          <button @click="handleClear" class="btn-secondary">Limpiar</button>
          <button @click="handleApply" class="btn-primary">Aplicar Filtros</button>
          
          <div class="relative" ref="exportMenu">
            <button @click="toggleExportMenu" class="btn-export" :disabled="isExporting">
              <ArrowDownTrayIcon class="h-5 w-5" />
            </button>
            <Transition name="fade">
              <div v-if="isExportMenuOpen" class="export-menu">
                <button @click="exportAndClose('export-lista')" class="export-menu-item">
                  <ClipboardDocumentListIcon class="h-5 w-5" />
                  <span>Exportar Lista</span>
                </button>
                <button @click="exportAndClose('export-trazabilidad')" class="export-menu-item">
                  <DocumentChartBarIcon class="h-5 w-5" />
                  <span>Exportar Trazabilidad</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, watch } from 'vue';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';
import { onClickOutside } from '@vueuse/core';
import { 
  ArrowDownTrayIcon, 
  ClipboardDocumentListIcon, 
  DocumentChartBarIcon,
  ChevronDownIcon
} from '@heroicons/vue/24/outline';

const props = defineProps({
  isExporting: { type: Boolean, default: false }
});
const emit = defineEmits(['update-filters', 'export-lista', 'export-trazabilidad']);

const filters = reactive({
  paciente: '',
  medico: '',
  instrumentador: '',
  estado: 'todos',
  startDate: '',
  endDate: '',
  rating_puntualidad_max: null,
  rating_condiciones_max: null,
  rating_asesoramiento_max: null,
  rating_evaluacion_general_max: null,
});

const handleApply = () => {
  emit('update-filters', { ...filters });
};

const clearFilters = () => {
  Object.assign(filters, {
    paciente: '',
    medico: '',
    instrumentador: '',
    estado: 'todos',
    startDate: '',
    endDate: '',
    rating_puntualidad_max: null,
    rating_condiciones_max: null,
    rating_asesoramiento_max: null,
    rating_evaluacion_general_max: null,
  });
};

const handleClear = () => {
  clearFilters();
  selectedRangeLabel.value = 'Personalizado';
  handleApply();
};

const formatDateForInput = (date) => format(date, 'yyyy-MM-dd');

// Lógica para el nuevo menú de rangos de fecha
const selectedRangeLabel = ref('Personalizado');
const isDateRangeMenuOpen = ref(false);
const dateRangeMenu = ref(null);
onClickOutside(dateRangeMenu, () => { isDateRangeMenuOpen.value = false; });

const setDateRange = (range) => {
  clearFilters();
  filters.estado = 'Enviado';
  const now = new Date();
  
  if (range === 'today') {
    filters.startDate = formatDateForInput(startOfDay(now));
    filters.endDate = formatDateForInput(endOfDay(now));
    selectedRangeLabel.value = 'Hoy';
  } else if (range === 'week') {
    filters.startDate = formatDateForInput(startOfWeek(now, { weekStartsOn: 1 }));
    filters.endDate = formatDateForInput(endOfWeek(now, { weekStartsOn: 1 }));
    selectedRangeLabel.value = 'Esta Semana';
  } else if (range === 'month') {
    filters.startDate = formatDateForInput(startOfMonth(now));
    filters.endDate = formatDateForInput(endOfMonth(now));
    selectedRangeLabel.value = 'Este Mes';
  }
  
  isDateRangeMenuOpen.value = false;
  handleApply();
};

// Watcher para actualizar la etiqueta a "Personalizado" si se cambian las fechas manualmente
watch([() => filters.startDate, () => filters.endDate], () => {
  // Esta lógica es un poco compleja para evitar que se ponga "Personalizado"
  // cuando se selecciona un rango predefinido.
  // Una forma simple es que cualquier cambio manual lo marque como personalizado.
  if (isDateRangeMenuOpen.value === false) { // Solo si el menú no está abierto
    selectedRangeLabel.value = 'Personalizado';
  }
});

// Lógica para el menú de exportación
const isExportMenuOpen = ref(false);
const exportMenu = ref(null);
const toggleExportMenu = () => { isExportMenuOpen.value = !isExportMenuOpen.value; };
onClickOutside(exportMenu, () => { isExportMenuOpen.value = false; });

const exportAndClose = (eventName) => {
  emit(eventName);
  isExportMenuOpen.value = false;
};
</script>

<style scoped>
.filter-label { @apply block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1; }
.input-form { @apply block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white; }
.btn-primary { @apply bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 disabled:opacity-50 disabled:cursor-not-allowed; }
.btn-export { @apply bg-green-600 text-white font-bold p-2.5 rounded-lg shadow hover:bg-green-700 disabled:opacity-50 disabled:cursor-wait; }

.export-menu, .date-range-menu { @apply absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-700 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10; }
.export-menu-item, .date-range-menu-item { @apply flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-600; }

.fade-enter-active, .fade-leave-active { @apply transition ease-out duration-100; }
.fade-enter-from, .fade-leave-to { @apply transform opacity-0 scale-95; }
.fade-enter-to, .fade-leave-from { @apply transform opacity-100 scale-100; }
</style>