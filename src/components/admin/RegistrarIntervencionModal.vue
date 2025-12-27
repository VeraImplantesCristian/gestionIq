<!-- src/components/admin/RegistrarIntervencionModal.vue -->
<template>
  <!-- El modal se renderiza solo si la prop 'show' es verdadera -->
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" @click.self="close">
    <!-- Contenedor del contenido del modal -->
    <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md m-4">
      
      <!-- Encabezado del modal -->
      <div class="p-5 border-b dark:border-slate-700">
        <h3 class="text-xl font-semibold text-gray-900 dark:text-white">🟣 Registrar Intervención Clave</h3>
      </div>

      <!-- Cuerpo del modal con la información de confirmación -->
      <div class="p-5 space-y-4">
        <!-- Solo se muestra si tenemos datos del reporte -->
        <div v-if="reporte">
          <p class="text-sm text-gray-600 dark:text-slate-300">Estás a punto de registrar un aporte excepcional para:</p>
          <div class="mt-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
            <p><strong>Instrumentador:</strong> {{ reporte.instrumentador_nombre }}</p>
            <p><strong>Cirugía:</strong> #{{ reporte.id }} - {{ reporte.paciente }}</p>
          </div>
          <p class="mt-4 text-xs text-gray-500 dark:text-slate-400">
            <strong>Recuerda:</strong> Esta acción visibiliza contexto operativo y no afecta numéricamente al IVO.
          </p>
        </div>
        <!-- Mensaje de error si no se pasaron los datos del reporte -->
        <div v-else>
          <p class="text-red-500">Error: No se han proporcionado los datos de la cirugía.</p>
        </div>
      </div>

      <!-- Pie del modal con los botones de acción -->
      <div class="px-5 py-4 bg-gray-50 dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-lg">
        <button @click="close" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">
          Cancelar
        </button>
        <button 
          @click="confirmAction" 
          :disabled="!reporte"
          class="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Confirmar Registro
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
// --- PROPS Y EMITS ---
// defineProps define las propiedades que el componente padre puede pasarle.
const props = defineProps({
  // Controla si el modal está visible.
  show: {
    type: Boolean,
    default: false
  },
  // Recibe el objeto completo del reporte (cirugía) seleccionado.
  reporte: {
    type: Object,
    default: null
  }
});

// defineEmits define los eventos que este componente puede enviar al padre.
const emit = defineEmits(['close', 'confirm']);

// --- LÓGICA ---
/**
 * Emite el evento 'close' para que el componente padre sepa que debe cerrar el modal.
 */
function close() {
  emit('close');
}

/**
 * Emite el evento 'confirm' para que el componente padre sepa que debe ejecutar la acción.
 */
function confirmAction() {
  // Solo emite si tenemos un reporte válido.
  if (props.reporte) {
    emit('confirm');
  }
}
</script>