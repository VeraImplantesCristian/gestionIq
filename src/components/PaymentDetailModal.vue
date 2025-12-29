<!-- src/components/PaymentDetailModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" @click.self="close">
      <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
        <div class="p-5 border-b dark:border-slate-700">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">Detalle del Pago</h3>
        </div>
        <div v-if="reporte" class="p-6 space-y-3">
          <div class="detail-row">
            <span class="detail-label">Paciente:</span>
            <span class="detail-value">{{ reporte.paciente }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha Cirugía:</span>
            <span class="detail-value">{{ formatDate(reporte.fecha_cirugia) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Tipo:</span>
            <span class="detail-value">{{ reporte.tipo_cirugia || 'No especificado' }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Monto:</span>
            <span class="detail-value font-bold">{{ formatCurrency(reporte.monto_a_pagar) }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado:</span>
            <span class="font-semibold text-green-600 dark:text-green-400">Pagado (Transferido)</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Incluido en:</span>
            <span class="detail-value">Orden de Pago #{{ reporte.orden_de_pago_id }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Fecha de Pago:</span>
            <span class="detail-value">{{ formatDate(reporte.fecha_pago) }}</span>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
          <a v-if="reporte.comprobante_object_key" :href="getComprobanteUrl(reporte.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="action-link">
            Ver Comprobante General ↗
          </a>
          <button @click="close" class="px-4 py-2 text-sm font-medium rounded-md">Cerrar</button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  reporte: Object,
});
const emit = defineEmits(['close']);

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const close = () => emit('close');

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const formatCurrency = (value) => {
  if (typeof value !== 'number') return 'N/A';
  return value.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
};

const getComprobanteUrl = (objectKey) => {
  return `${R2_PUBLIC_URL}/${objectKey}`;
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.detail-row { @apply flex justify-between items-center text-sm; }
.detail-label { @apply text-gray-500 dark:text-slate-400; }
.detail-value { @apply font-medium text-gray-800 dark:text-slate-100; }
.action-link { @apply px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline; }
</style>