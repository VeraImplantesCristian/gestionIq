<!-- src/views/admin/PagosDashboardView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <header class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Pendientes de Pago</h1>
      <p class="text-slate-600 dark:text-slate-400 mt-1">
        Seleccioná uno o más instrumentadores para generar una orden de pago agrupada.
      </p>
    </header>

    <div v-if="isLoading" class="text-center p-10">
      <p>Cargando resumen de pagos...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
      {{ error }}
    </div>
    
    <div v-else>
      <!-- Tarjetas de Resumen Superior -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="stat-card">
          <h3 class="stat-title">TOTAL A PAGAR</h3>
          <p class="stat-value">{{ formatCurrency(summary.total_general_pendiente) }}</p>
        </div>
        <div class="stat-card">
          <h3 class="stat-title">INSTRUMENTADORES</h3>
          <p class="stat-value">{{ summary.total_instrumentadores_pendientes }}</p>
          <p class="stat-subtitle">Pendientes de revisión</p>
        </div>
        <div class="stat-card">
          <h3 class="stat-title">CIRUGÍA MÁS ANTIGUA</h3>
          <p class="stat-value">{{ formatDate(summary.cirugia_mas_antigua_general, 'long') }}</p>
          <p v-if="summary.cirugia_mas_antigua_general" class="stat-subtitle">{{ daysSince(summary.cirugia_mas_antigua_general) }} días de retraso</p>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda -->
      <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-6">
        <div class="flex flex-wrap gap-4 items-center">
          <input 
            type="text" 
            v-model="searchTerm"
            placeholder="Buscar por nombre o DNI..."
            class="form-input flex-grow"
          />
          <div class="flex items-center gap-2">
            <label for="startDate" class="text-sm font-medium text-slate-500">Desde:</label>
            <input type="date" id="startDate" v-model="filters.startDate" class="form-input" />
          </div>
          <div class="flex items-center gap-2">
            <label for="endDate" class="text-sm font-medium text-slate-500">Hasta:</label>
            <input type="date" id="endDate" v-model="filters.endDate" class="form-input" />
          </div>
          <button @click="applyDateFilters" class="btn-primary">Aplicar Filtros</button>
          <button @click="clearFilters" class="btn-secondary">Limpiar</button>
        </div>
      </div>

      <!-- Grilla de Instrumentadores -->
      <div v-if="filteredInstrumentadores.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div v-for="inst in filteredInstrumentadores" :key="inst.dni" 
             class="instrumentador-card" 
             :class="{ 'selected': selectedInstrumentadorDNIs.includes(inst.dni) }"
             @click="toggleInstrumentadorSelection(inst.dni)">
          
          <div class="checkbox-wrapper">
            <input 
              type="checkbox" 
              :checked="selectedInstrumentadorDNIs.includes(inst.dni)"
              class="checkbox"
              @click.stop
              @change="toggleInstrumentadorSelection(inst.dni)"
            />
          </div>

          <div class="card-header">
            <span class="font-bold text-lg">{{ inst.nombre_completo }}</span>
            <span class="text-xs text-slate-500">DNI: {{ inst.dni }}</span>
          </div>
          <div class="card-body">
            <p class="text-sm text-slate-500">Total Estimado</p>
            <p class="text-3xl font-bold">{{ formatCurrency(inst.total_estimado) }}</p>
          </div>
          <div class="card-footer">
            <div class="flex justify-between text-sm">
              <span>Cirugías pendientes</span>
              <span class="font-semibold">{{ inst.cirugias_pendientes }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Rango de fechas</span>
              <span class="font-semibold">{{ formatDateRange(inst.fecha_mas_antigua, inst.fecha_mas_reciente) }}</span>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow">
        <p class="text-slate-500">No se encontraron instrumentadores con pagos pendientes para los filtros seleccionados.</p>
      </div>
    </div>

    <!-- Barra de Acción para generar la Orden de Pago -->
    <Transition name="slide-up">
      <div v-if="selectedInstrumentadorDNIs.length > 0" class="action-bar">
        <div class="action-bar-content">
          <span class="font-semibold">{{ selectedInstrumentadorDNIs.length }} instrumentador(es) seleccionado(s)</span>
          <button @click="generarOrdenDePago" class="btn-primary">
            Generar Orden de Pago ({{ selectedInstrumentadorDNIs.length }})
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const isLoading = ref(true);
const error = ref(null);
const summary = ref({});
const instrumentadores = ref([]);
const searchTerm = ref('');
const filters = reactive({ startDate: null, endDate: null });
const selectedInstrumentadorDNIs = ref([]);

const fetchData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_resumen_pagos_pendientes', {
      p_start_date: filters.startDate || null,
      p_end_date: filters.endDate || null
    });
    if (rpcError) throw rpcError;
    
    summary.value = data.summary;
    instrumentadores.value = data.instrumentadores;
  } catch (err) {
    error.value = "No se pudo cargar el resumen de pagos.";
    toast.error(err.message);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchData);

const applyDateFilters = () => fetchData();

const clearFilters = () => {
  filters.startDate = null;
  filters.endDate = null;
  searchTerm.value = '';
  fetchData();
};

const filteredInstrumentadores = computed(() => {
  if (!searchTerm.value) {
    return instrumentadores.value;
  }
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return instrumentadores.value.filter(inst => 
    inst.nombre_completo.toLowerCase().includes(lowerCaseSearch) ||
    inst.dni.includes(lowerCaseSearch)
  );
});

const toggleInstrumentadorSelection = (dni) => {
  const index = selectedInstrumentadorDNIs.value.indexOf(dni);
  if (index > -1) {
    selectedInstrumentadorDNIs.value.splice(index, 1);
  } else {
    selectedInstrumentadorDNIs.value.push(dni);
  }
};

const generarOrdenDePago = () => {
  if (selectedInstrumentadorDNIs.value.length === 0) {
    toast.warning("Debes seleccionar al menos un instrumentador.");
    return;
  }
  router.push({ 
    name: 'CrearOrdenDePago', 
    query: { dnis: selectedInstrumentadorDNIs.value.join(',') } 
  });
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString, format = 'short') => {
  if (!dateString) return 'N/A';
  const options = format === 'long' 
    ? { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }
    : { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};
const formatDateRange = (start, end) => `${formatDate(start)} - ${formatDate(end)}`;
const daysSince = (dateString) => {
  if (!dateString) return 0;
  const diffTime = Math.abs(new Date() - new Date(dateString));
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
};
</script>

<style scoped>
.stat-card { @apply bg-white dark:bg-slate-800 p-6 rounded-xl shadow; }
.stat-title { @apply text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider; }
.stat-value { @apply text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1; }
.stat-subtitle { @apply text-xs text-slate-400; }
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md; @apply dark:bg-slate-700 dark:border-slate-600; }
.instrumentador-card { @apply bg-white dark:bg-slate-800 rounded-xl shadow flex flex-col transition-transform duration-200 hover:-translate-y-1; }
.card-header { @apply p-4 border-b border-slate-100 dark:border-slate-700; }
.card-body { @apply p-4 flex-grow; }
.card-footer { @apply p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl space-y-2; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
</style>