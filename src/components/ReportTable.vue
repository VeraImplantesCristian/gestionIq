<!-- src/components/ReportTable.vue -->
<template>
  <div class="bg-white shadow-md rounded-lg overflow-hidden dark:bg-slate-800">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
        <thead class="bg-gray-50 dark:bg-slate-700">
          <tr>
            <th scope="col" class="p-4">
              <input 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :checked="areAllOnPageSelected"
                @change="$emit('toggle-select-all')"
              />
            </th>
            <th scope="col" class="table-header">Paciente</th>
            <th scope="col" class="table-header">Médico</th>
            <th scope="col" class="table-header">Instrumentador</th>
            <th scope="col" class="table-header">Estado</th>
            <th scope="col" class="table-header">Acciones</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 dark:bg-slate-800 dark:divide-slate-700">
          <tr v-if="reportes.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-slate-400">
              No se encontraron reportes con los filtros actuales.
            </td>
          </tr>
          <tr v-for="reporte in reportes" :key="reporte.id" :class="{'bg-blue-50 dark:bg-blue-900/20': isReportSelected(reporte.id)}">
            <td class="p-4">
              <input 
                type="checkbox" 
                class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                :checked="isReportSelected(reporte.id)"
                @change="$emit('toggle-selection', reporte.id)"
              />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-slate-100">{{ reporte.paciente }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.medico }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-slate-300">{{ reporte.instrumentador_completado || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <!-- La lógica de 'getEstadoClass' ahora vive dentro de este componente -->
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getEstadoClass(reporte.estado)]">
                {{ reporte.estado || 'Pendiente' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex items-center space-x-4">
                <button @click="$emit('open-link-modal', reporte)" class="action-link">Compartir</button>
                <a href="#" @click.prevent="$emit('open-drawer', reporte)" class="action-link-secondary">Ver Detalles</a>
                <button @click="$emit('export-summary', reporte)" title="Exportar Resumen de Paciente" class="action-icon">
                  <DocumentTextIcon class="h-5 w-5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { DocumentTextIcon } from '@heroicons/vue/24/outline';

// Props que el componente recibe del padre.
const props = defineProps({
  reportes: {
    type: Array,
    required: true
  },
  selectedReportes: {
    type: Set,
    required: true
  }
});

// Eventos que el componente emite hacia el padre.
const emit = defineEmits([
  'toggle-selection',
  'toggle-select-all',
  'open-drawer',
  'open-link-modal',
  'export-summary'
]);

// Lógica de selección que depende de las props.
const isReportSelected = (reporteId) => props.selectedReportes.has(reporteId);

const areAllOnPageSelected = computed(() => {
  const pageIds = props.reportes.map(r => r.id);
  return pageIds.length > 0 && pageIds.every(id => props.selectedReportes.has(id));
});

// ========= INICIO DE LA MEJORA: INTELIGENCIA DE PRESENTACIÓN MOVIDA AQUÍ =========
// Esta función ahora es responsabilidad de ReportTable.vue.
const getEstadoClass = (estado) => ({
  'bg-green-100 text-green-800': estado === 'Enviado',
  'bg-yellow-100 text-yellow-800': estado === 'Pendiente',
  'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200': estado === 'Expirado',
});
// ========= FIN DE LA MEJORA =========
</script>

<style scoped>
.table-header { @apply px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-slate-400; }
.action-link { @apply text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300; }
.action-link-secondary { @apply text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200; }
.action-icon { @apply text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300; }
</style>