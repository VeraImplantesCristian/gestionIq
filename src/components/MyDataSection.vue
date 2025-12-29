<!-- src/components/MyDataSection.vue -->
<template>
  <div class="data-wrap">
    <div class="data-card">
      <div class="data-header">
        <h2 class="data-title">Mis Datos</h2>
        <p class="data-subtitle">Esta es la información que tenemos registrada para la gestión y pagos.</p>
      </div>

      <div v-if="info" class="data-list">
        <h3 class="section-header">Información Personal</h3>
        <div class="detail-grid">
          <DataItem label="Nombre Completo" :value="info.nombre_completo" />
          <DataItem label="DNI" :value="info.dni" />
          <DataItem label="CUIT" :value="info.cuit" />
          <DataItem label="Lugar de Trabajo" :value="info.lugar_de_trabajo" />
          <DataItem label="Miembro desde" :value="formatDate(info.fecha_registro)" />
        </div>

        <h3 class="section-header">Información de Pago</h3>
        <div class="detail-grid">
          <DataItem label="Medio de Pago" :value="info.medio_de_pago" />
          <DataItem label="Banco" :value="info.banco" />
          <DataItem label="Alias" :value="info.alias" />
          <DataItem label="CBU" :value="info.cbu" is-sensitive />
        </div>
      </div>
      <div v-else class="p-4 text-center text-slate-500">
        No se pudo cargar la información.
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineAsyncComponent } from 'vue';

// Componente interno para reutilizar la estructura de los campos.
const DataItem = defineAsyncComponent(() => Promise.resolve({
  props: ['label', 'value', 'isSensitive'],
  template: `
    <div class="py-2">
      <dt class="text-xs text-slate-500 dark:text-slate-400">{{ label }}</dt>
      <dd class="text-sm font-medium text-slate-800 dark:text-slate-100" :class="{ 'blur-sm hover:blur-none transition-all': isSensitive }">
        {{ value || 'No especificado' }}
      </dd>
    </div>
  `
}));

const props = defineProps({
  info: Object,
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
};
</script>

<style scoped>
.data-wrap { @apply w-full; }
.data-card { @apply bg-white dark:bg-slate-800 rounded-2xl shadow p-6; }
.data-header { @apply mb-6 pb-4 border-b border-slate-100 dark:border-slate-700; }
.data-title { @apply text-xl font-bold text-slate-800 dark:text-slate-100; }
.data-subtitle { @apply mt-1 text-sm text-slate-600 dark:text-slate-300; }
.section-header { @apply text-sm font-semibold text-blue-600 dark:text-blue-400 mt-4 mb-2; }
.detail-grid { @apply grid grid-cols-1 md:grid-cols-2 gap-x-4; }
</style>