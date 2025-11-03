<!-- src/components/ReportCard.vue (Refactorizado, limpio y con acción de expirar) -->
<template>
  <!-- CAMBIO: Se eliminó el flexbox y el checkbox, simplificando la estructura. -->
  <div class="bg-white dark:bg-slate-800 shadow-md rounded-lg p-4 space-y-3">
    
    <!-- Encabezado con datos y estado -->
    <div class="flex justify-between items-start">
      <div>
        <p class="font-bold text-lg text-gray-800 dark:text-slate-100">{{ reporte.paciente }}</p>
        <p class="text-sm text-gray-600 dark:text-slate-300">{{ reporte.medico }}</p>
        <p v-if="reporte.instrumentador_completado" class="text-sm text-gray-500 dark:text-slate-400 mt-1">
          <span class="font-medium">Completado por:</span> {{ reporte.instrumentador_completado }}
        </p>
      </div>
      <!-- CAMBIO: Lógica de clases actualizada para incluir el estado 'Expirado' y ser consistente con la tabla. -->
      <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap', {
        'bg-green-100 text-green-800': reporte.estado === 'Enviado',
        'bg-yellow-100 text-yellow-800': reporte.estado === 'Pendiente',
        'bg-gray-100 text-gray-800 dark:bg-slate-600 dark:text-slate-200': reporte.estado === 'Expirado',
      }]">
        {{ reporte.estado || 'Pendiente' }}
      </span>
    </div>
    
    <!-- Acciones unificadas y con la nueva opción de expirar -->
    <div class="pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-end items-center space-x-4">
      <!-- CAMBIO: Botón unificado 'Compartir' que emite @share. Es más simple y consistente. -->
      <button 
        @click="$emit('share', reporte)" 
        :disabled="isGenerating"
        class="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 disabled:text-gray-400"
      >
        {{ isGenerating ? '...' : 'Compartir' }}
      </button>

      <button 
        @click="$emit('details', reporte)" 
        class="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-slate-200"
      >
        Detalles
      </button>

      <!-- CAMBIO: Nuevo botón 'Expirar' que emite @expire para ser manejado por AdminView. -->
      <button 
        @click="$emit('expire', reporte)" 
        class="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
      >
        Expirar
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reporte: {
    type: Object,
    required: true
  },
  isGenerating: Boolean,
});

// CAMBIO: Emits simplificados para alinearse con el nuevo flujo de acciones.
defineEmits(['share', 'details', 'expire']);
</script>