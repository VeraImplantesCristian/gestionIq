<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Auditoría de Pagos</h1>
    <p class="text-slate-600 dark:text-slate-400 mt-1 mb-8">Auditá el historial de pagos y utilizá las herramientas para corregir errores.</p>

    <!-- --- INICIO DE LA MODIFICACIÓN --- -->
    <!-- Sistema de Pestañas -->
    <div class="mb-6 border-b border-gray-200 dark:border-slate-700">
      <nav class="-mb-px flex space-x-6" aria-label="Tabs">
        <button
          @click="activeTab = 'historial'"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'historial'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          ]"
        >
          Historial de Órdenes
        </button>
        <button
          @click="activeTab = 'herramientas'"
          :class="[
            'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
            activeTab === 'herramientas'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-slate-400 dark:hover:text-slate-200'
          ]"
        >
          Herramientas de Corrección
        </button>
      </nav>
    </div>

    <!-- Contenido de la Pestaña "Historial" -->
    <div v-if="activeTab === 'historial'">
    <!-- --- FIN DE LA MODIFICACIÓN --- -->
      <div v-if="isLoading" class="text-center p-10">
        <p>Cargando historial...</p>
      </div>

      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
        <p>Error al cargar el historial: {{ error }}</p>
      </div>

      <div v-else-if="historial.length === 0" class="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow">
        <p class="text-slate-500">Aún no se han registrado órdenes de pago.</p>
      </div>

      <div v-else>
        <div class="bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" v-model="dniFilter" placeholder="Filtrar por DNI..." class="form-input"/>
            <input id="start-date" type="date" v-model="startDateFilter" class="form-input"/>
            <input id="end-date" type="date" v-model="endDateFilter" class="form-input"/>
          </div>
        </div>

        <div v-if="filteredHistorial.length === 0" class="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow">
          <p class="text-slate-500">No se encontraron órdenes de pago que coincidan con los filtros aplicados.</p>
        </div>

        <div v-else class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
              <thead class="bg-gray-50 dark:bg-slate-700">
                <tr>
                  <th class="table-header">ID Orden</th>
                  <th class="table-header">Fecha de Emisión</th>
                  <th class="table-header">Monto Total</th>
                  <th class="table-header">Instrumentador(es)</th>
                  <th class="table-header text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
                <tr v-for="orden in filteredHistorial" :key="orden.id">
                  <td class="table-cell font-medium">#{{ orden.id }}</td>
                  <td class="table-cell">{{ formatDate(orden.fecha_emision) }}</td>
                  <td class="table-cell">{{ formatCurrency(orden.monto_total_general) }}</td>
                  <td class="table-cell text-xs max-w-xs truncate">{{ orden.instrumentadores_nombres }}</td>
                  <td class="table-cell text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button @click="verDetalle(orden)" class="btn-secondary">Ver Detalle</button>
                      <a v-if="orden.comprobante_object_key" 
                         :href="getComprobanteUrl(orden.comprobante_object_key)" 
                         target="_blank" 
                         rel="noopener noreferrer"
                         class="btn-icon"
                         title="Descargar Comprobante">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </a>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    <!-- --- INICIO DE LA MODIFICACIÓN --- -->
    </div>

    <!-- Contenido de la Pestaña "Herramientas" -->
    <div v-if="activeTab === 'herramientas'">
      <DividirOrdenDePago />
    </div>
    <!-- --- FIN DE LA MODIFICACIÓN --- -->

    <OrdenDePagoDetalleModal
      :is-visible="isModalVisible"
      :orden-id="selectedOrdenId"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
// --- INICIO DE LA MODIFICACIÓN ---
import { ref, onMounted, computed, watch } from 'vue';
// --- FIN DE LA MODIFICACIÓN ---
import { supabase } from '../../services/supabase';
import OrdenDePagoDetalleModal from '../../components/admin/OrdenDePagoDetalleModal.vue';
// --- INICIO DE LA MODIFICACIÓN ---
// Se importa el nuevo componente de corrección.
import DividirOrdenDePago from '../../components/admin/DividirOrdenDePago.vue';
// --- FIN DE LA MODIFICACIÓN ---

// --- INICIO DE LA MODIFICACIÓN ---
// Se añade el estado para la pestaña activa.
const activeTab = ref('historial');
// --- FIN DE LA MODIFICACIÓN ---

const historial = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const selectedOrdenId = ref(null);
const dniFilter = ref('');
const startDateFilter = ref('');
const endDateFilter = ref('');

const filteredHistorial = computed(() => {
  let items = historial.value;

  if (dniFilter.value.trim()) {
    const searchTerm = dniFilter.value.trim();
    items = items.filter(orden =>
      orden.instrumentadores_dnis?.some(dni => dni.includes(searchTerm))
    );
  }

  if (startDateFilter.value) {
    const startDate = new Date(startDateFilter.value);
    startDate.setUTCHours(0, 0, 0, 0);
    items = items.filter(orden => new Date(orden.fecha_emision) >= startDate);
  }

  if (endDateFilter.value) {
    const endDate = new Date(endDateFilter.value);
    endDate.setUTCHours(23, 59, 59, 999);
    items = items.filter(orden => new Date(orden.fecha_emision) <= endDate);
  }

  return items;
});

async function fetchHistorial() {
  try {
    isLoading.value = true;
    const { data, error: rpcError } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (rpcError) throw rpcError;
    historial.value = data || [];
  } catch (err) {
    console.error('Error al obtener el historial de pagos:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function verDetalle(orden) {
  selectedOrdenId.value = orden.id;
  isModalVisible.value = true;
}

function closeModal() {
  isModalVisible.value = false;
  selectedOrdenId.value = null;
}

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
const getComprobanteUrl = (objectKey) => {
  if (!objectKey) return '#';
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

onMounted(() => {
  fetchHistorial();
});

// --- INICIO DE LA MODIFICACIÓN ---
// Se añade un 'watch' para recargar el historial si el usuario vuelve a la pestaña.
// Esto es útil para ver los cambios después de usar una herramienta de corrección.
watch(activeTab, (newTab) => {
  if (newTab === 'historial') {
    fetchHistorial();
  }
});
// --- FIN DE LA MODIFICACIÓN ---
</script>

<style scoped>
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200; }
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400; }
.table-cell { @apply px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300; }
.btn-secondary { @apply bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-1.5 px-3 rounded-lg text-sm; @apply hover:bg-slate-50 dark:hover:bg-slate-600; }
.btn-icon { @apply p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-700 dark:hover:text-slate-200; }
</style>