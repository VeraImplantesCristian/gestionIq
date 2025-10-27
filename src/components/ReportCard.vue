<!-- src/components/ReportCard.vue -->
<template>
  <div class="bg-white shadow-md rounded-lg p-4 flex space-x-4">
    <!-- Checkbox de Selección -->
    <div class="flex items-center justify-center">
      <input 
        type="checkbox" 
        :checked="selected"
        @change="$emit('toggle-select', reporte.id)"
        class="h-6 w-6 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
      >
    </div>
    
    <!-- Contenido Principal de la Tarjeta -->
    <div class="flex-grow space-y-3">
      <!-- Encabezado con datos y estado -->
      <div class="flex justify-between items-start">
        <div>
          <p class="font-bold text-lg text-gray-800">{{ reporte.paciente }}</p>
          <p class="text-sm text-gray-600">{{ reporte.medico }}</p>
          <!-- NUEVO: Muestra el instrumentador si el reporte fue enviado -->
          <p v-if="reporte.instrumentador_completado" class="text-sm text-gray-500 mt-1">
            <span class="font-medium">Completado por:</span> {{ reporte.instrumentador_completado }}
          </p>
        </div>
        <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', reporte.estado === 'Enviado' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
          {{ reporte.estado || 'Pendiente' }}
        </span>
      </div>
      
      <!-- Acciones -->
      <div class="pt-2 border-t flex justify-end items-center space-x-4">
        <button 
          v-if="!reporte.token" 
          @click="$emit('generate', reporte)" 
          :disabled="isGenerating" 
          class="text-sm font-medium text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-wait"
        >
          {{ isGenerating ? 'Generando...' : 'Generar Link' }}
        </button>
        <button 
          v-else 
          @click="$emit('copy', reporte)" 
          class="text-sm font-medium text-blue-600 hover:text-blue-900"
        >
          Copiar Link
        </button>
        <button 
          @click="$emit('details', reporte)" 
          class="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  reporte: Object,
  isGenerating: Boolean,
  selected: Boolean,
});
defineEmits(['generate', 'copy', 'details', 'toggle-select']);
</script>