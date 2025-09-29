<!-- src/components/ReporteModal.vue -->
<template>
  <!-- Usamos <Transition> para una animación suave de entrada y salida -->
  <Transition name="fade">
    <!-- El contenedor principal del modal, que solo se muestra si la prop 'show' es verdadera -->
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click.self="closeModal">
      
      <!-- El panel del modal -->
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 transform transition-all">
        
        <!-- Encabezado del Modal -->
        <div class="flex items-start justify-between border-b pb-3">
          <h2 class="text-2xl font-bold text-gray-800">Detalles del Reporte</h2>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">&times;</button>
        </div>

        <!-- Cuerpo del Modal -->
        <div v-if="reporte" class="mt-4 space-y-4">
          <!-- Datos principales -->
          <div>
            <p><strong class="font-semibold text-gray-600">Paciente:</strong> {{ reporte.paciente }}</p>
            <p><strong class="font-semibold text-gray-600">Médico:</strong> {{ reporte.medico }}</p>
            <p><strong class="font-semibold text-gray-600">Fecha:</strong> {{ new Date(reporte.fecha_cirugia).toLocaleDateString() }}</p>
          </div>

          <!-- Observaciones -->
          <div v-if="reporte.observaciones">
            <h3 class="font-semibold text-gray-600">Observaciones:</h3>
            <p class="text-gray-800 bg-gray-50 p-2 rounded border">{{ reporte.observaciones }}</p>
          </div>

          <!-- Firma -->
          <div v-if="reporte.url_firma">
            <h3 class="font-semibold text-gray-600">Firma del Instrumentador:</h3>
            <div class="border rounded-md p-2 mt-1">
              <img :src="reporte.url_firma" alt="Firma" class="mx-auto h-32 object-contain" />
            </div>
          </div>
          <div v-else>
            <p class="text-gray-500">Aún no se ha enviado la firma.</p>
          </div>

        </div>

        <!-- Pie del Modal -->
        <div class="mt-6 text-right">
          <button @click="closeModal" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
// Definimos las props que este componente espera recibir
const props = defineProps({
  show: {
    type: Boolean,
    default: false, // Por defecto, el modal está oculto
  },
  reporte: {
    type: Object,
    default: () => ({}), // El objeto con los datos del reporte
  },
});

// Definimos los eventos que este componente puede emitir hacia el padre
const emit = defineEmits(['close']);

// Función que emite el evento 'close' para que el componente padre sepa que debe cerrar el modal
const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
/* Estilos para la animación de transición del modal */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>