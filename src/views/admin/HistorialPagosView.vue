<template>
  <!-- Contenedor principal de la vista -->
  <div class="historial-pagos-view">
    <h1>Historial de Órdenes de Pago</h1>
    <p class="subtitle">Aquí puedes auditar todas las órdenes de pago que han sido procesadas.</p>

    <!-- Muestra un mensaje de carga mientras se obtienen los datos -->
    <div v-if="isLoading" class="loading-state">
      <p>Cargando historial...</p>
    </div>

    <!-- Muestra un mensaje de error si la carga falla -->
    <div v-else-if="error" class="error-state">
      <p>Error al cargar el historial: {{ error }}</p>
    </div>

    <!-- Muestra un mensaje si no hay órdenes de pago registradas en total -->
    <div v-else-if="historial.length === 0" class="empty-state">
      <p>Aún no se han registrado órdenes de pago.</p>
    </div>

    <!-- Si hay datos, muestra los filtros y la tabla -->
    <div v-else>
      <!-- Contenedor para los nuevos campos de filtro -->
      <div class="filters-container">
        <input type="text" v-model="dniFilter" placeholder="Filtrar por DNI..." class="filter-input"/>
        <div class="date-filter-group">
          <label for="start-date">Desde:</label>
          <input id="start-date" type="date" v-model="startDateFilter" class="filter-input"/>
        </div>
        <div class="date-filter-group">
          <label for="end-date">Hasta:</label>
          <input id="end-date" type="date" v-model="endDateFilter" class="filter-input"/>
        </div>
      </div>

      <!-- Muestra un mensaje si los filtros no arrojan resultados -->
      <div v-if="filteredHistorial.length === 0" class="empty-state">
        <p>No se encontraron órdenes de pago que coincidan con los filtros aplicados.</p>
      </div>

      <!-- Muestra la tabla con el historial filtrado -->
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID Orden</th>
              <th>Fecha de Emisión</th>
              <th>Monto Total</th>
              <th>N° Instrumentadores</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <!-- La tabla ahora itera sobre la lista filtrada 'filteredHistorial' -->
            <tr v-for="orden in filteredHistorial" :key="orden.id">
              <td>#{{ orden.id }}</td>
              <td>{{ new Date(orden.fecha_emision).toLocaleDateString('es-AR', { timeZone: 'UTC' }) }}</td>
              <td>{{ orden.monto_total_general.toLocaleString('es-ar', { style: 'currency', currency: 'ARS' }) }}</td>
              <td>{{ orden.instrumentadores_count }}</td>
              <td>
                <button @click="verDetalle(orden)">Ver Detalle</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- El componente del modal no cambia -->
    <OrdenDePagoDetalleModal
      :is-visible="isModalVisible"
      :orden-id="selectedOrdenId"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
// --- INICIO DE LA CORRECCIÓN ---
// 1. Se corrige la importación de Supabase para que sea un import NOMBRADO
//    y use una ruta RELATIVA, consistente con el resto de tu proyecto.
import { supabase } from '../../services/supabase';
// 2. Se corrige la importación del Modal para que use una ruta RELATIVA,
//    lo que garantiza que Vite lo encontrará sin problemas.
import OrdenDePagoDetalleModal from '../../components/admin/OrdenDePagoDetalleModal.vue';
// --- FIN DE LA CORRECCIÓN ---

// --- ESTADO REACTIVO ---
const historial = ref([]);
const isLoading = ref(true);
const error = ref(null);
const isModalVisible = ref(false);
const selectedOrdenId = ref(null);
const dniFilter = ref('');
const startDateFilter = ref('');
const endDateFilter = ref('');

// --- LÓGICA COMPUTADA (FILTRADO) ---
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
    items = items.filter(orden => new Date(orden.fecha_emision) >= startDate);
  }

  if (endDateFilter.value) {
    const endDate = new Date(endDateFilter.value);
    items = items.filter(orden => new Date(orden.fecha_emision) <= endDate);
  }

  return items;
});

// --- LÓGICA DE MÉTODOS ---
async function fetchHistorial() {
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_historial_ordenes_pago');
    if (rpcError) throw rpcError;
    historial.value = data;
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

// --- CICLO DE VIDA ---
onMounted(() => {
  fetchHistorial();
});
</script>

<style scoped>
.historial-pagos-view {
  padding: 2rem;
}
.subtitle {
  color: #666;
  margin-bottom: 2rem;
}
.filters-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}
.filter-input {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 0.9rem;
}
.date-filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th, td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #eee;
}
th {
  background-color: #f9f9f9;
}
button {
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  background-color: #fff;
}
button:hover {
  background-color: #f0f0f0;
}
.loading-state, .error-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: #888;
  background-color: #fafafa;
  border-radius: 8px;
}
</style>