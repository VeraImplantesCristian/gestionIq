<template>
  <!-- El modal solo se renderiza en el DOM si isVisible es true -->
  <div v-if="isVisible" class="modal-overlay" @click.self="closeModal">
    <!-- Contenido del modal -->
    <div class="modal-content">
      <div class="modal-header">
        <h2>Detalle de la Orden #{{ ordenId }}</h2>
        <button @click="closeModal" class="close-button">&times;</button>
      </div>
      <div class="modal-body">
        <div v-if="isLoading" class="state-indicator">
          <p>Cargando detalle de la orden...</p>
        </div>
        <div v-else-if="error" class="state-indicator error">
          <p>Error al cargar el detalle: {{ error }}</p>
        </div>
        <div v-else-if="detalle" class="order-details">
          <div class="summary-section">
            <p><strong>Fecha de Emisión:</strong> {{ new Date(detalle.fecha_emision).toLocaleDateString('es-AR', { timeZone: 'UTC' }) }}</p>
            <p><strong>Monto Total General:</strong> {{ detalle.monto_total_general.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) }}</p>
            <p><strong>Comprobante:</strong> <a :href="getComprobanteUrl(detalle.comprobante_object_key)" target="_blank" rel="noopener noreferrer">Ver Comprobante</a></p>
          </div>
          <div v-for="pago in detalle.pagos" :key="pago.instrumentador_dni" class="instrumentador-section">
            <h3>Instrumentador: {{ pago.instrumentador_nombre }} ({{ pago.instrumentador_dni }})</h3>
            <p><strong>Monto Total:</strong> {{ pago.monto_total_instrumentador.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) }}</p>
            <table>
              <thead>
                <tr>
                  <th>Fecha Cirugía</th>
                  <th>Paciente</th>
                  <th>Monto Pagado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="reporte in pago.reportes" :key="reporte.id">
                  <td>{{ new Date(reporte.fecha_cirugia).toLocaleDateString('es-AR', { timeZone: 'UTC' }) }}</td>
                  <td>{{ reporte.paciente }}</td>
                  <td>{{ reporte.monto_a_pagar.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' }) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="descargarPDF" :disabled="isLoading || !detalle">Descargar PDF</button>
        <button @click="closeModal">Cerrar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
// --- INICIO DE LA CORRECCIÓN ---
// Se usan rutas relativas para asegurar que Vite encuentre los archivos.
import { supabase } from '../../services/supabase';
import { useOrdenDePagoPDF } from '../../composables/useOrdenDePagoPDF';
// --- FIN DE LA CORRECCIÓN ---

const props = defineProps({
  ordenId: { type: Number, default: null },
  isVisible: { type: Boolean, default: false }
});
const emit = defineEmits(['close']);

const detalle = ref(null);
const isLoading = ref(false);
const error = ref(null);
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
const { generatePDF } = useOrdenDePagoPDF();

async function fetchDetalleOrden(id) {
  if (!id) return;
  isLoading.value = true;
  error.value = null;
  detalle.value = null;
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_orden_pago', { p_orden_id: id });
    if (rpcError) throw rpcError;
    detalle.value = data;
  } catch (err) {
    console.error('Error al obtener detalle de la orden:', err);
    error.value = err.message;
  } finally {
    isLoading.value = false;
  }
}

function getComprobanteUrl(objectKey) {
  return `${R2_PUBLIC_URL}/${objectKey}`;
}

function closeModal() {
  emit('close');
}

function descargarPDF() {
  if (detalle.value) {
    generatePDF(detalle.value);
  }
}

watch(() => props.isVisible, (newValue) => {
  if (newValue && props.ordenId) {
    fetchDetalleOrden(props.ordenId);
  } else {
    detalle.value = null;
    error.value = null;
    isLoading.value = false;
  }
});
</script>

<style scoped>
/* Estilos para el fondo oscuro y el centrado del modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Estilos para la caja de contenido del modal */
.modal-content {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  overflow-y: auto; /* Permite scroll si el contenido es muy largo */
  padding: 1rem 0;
}

.state-indicator {
  text-align: center;
  padding: 2rem;
  color: #888;
}
.state-indicator.error {
  color: #d9534f;
}

.summary-section {
  margin-bottom: 1.5rem;
  background-color: #f9f9f9;
  padding: 1rem;
  border-radius: 5px;
}

.instrumentador-section {
  margin-bottom: 1.5rem;
  border-top: 1px solid #ddd;
  padding-top: 1rem;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}
th, td {
  padding: 0.5rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
th {
  font-weight: 600;
}

.modal-footer {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

button {
  cursor: pointer;
  padding: 0.6rem 1.2rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>