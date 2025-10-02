<!-- src/components/SignatureModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex flex-col bg-white">
      
      <div class="flex-shrink-0 p-4 border-b flex items-center justify-between">
        <h2 class="text-xl font-bold text-gray-800">Realice su firma</h2>
        <button @click="closeModal" class="text-2xl text-gray-500 hover:text-gray-800">&times;</button>
      </div>

      <div class="flex-grow p-2">
        <canvas 
          ref="canvasRef" 
          class="w-full h-full bg-gray-100 rounded-md cursor-crosshair"
          @mousedown="startDrawing"
          @mousemove="draw"
          @mouseup="stopDrawing"
          @mouseleave="stopDrawing"
          @touchstart.prevent="startDrawing"
          @touchmove.prevent="draw"
          @touchend="stopDrawing"
        ></canvas>
      </div>

      <div class="flex-shrink-0 p-4 border-t flex items-center justify-end space-x-4">
        <button @click="clearSignature" class="text-gray-600 font-semibold px-4 py-2 rounded-md hover:bg-gray-100">
          Limpiar Firma
        </button>
        <button @click="saveSignature" class="bg-blue-600 text-white font-bold px-6 py-3 rounded-md hover:bg-blue-700">
          Guardar Firma
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'save']);

const canvasRef = ref(null);
let ctx = null;
const isDrawing = ref(false);

watch(() => props.show, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      initializeCanvas();
    });
  }
});

const initializeCanvas = () => {
  const canvas = canvasRef.value;
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';
  }
};

const getCoordinates = (event) => {
  const canvas = canvasRef.value;
  // **AÑADIDO:** Comprobación de seguridad
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  if (event.touches && event.touches.length > 0) {
    return { x: event.touches[0].clientX - rect.left, y: event.touches[0].clientY - rect.top };
  }
  return { x: event.clientX - rect.left, y: event.clientY - rect.top };
};

const startDrawing = (event) => {
  if (!ctx) return;
  isDrawing.value = true;
  const { x, y } = getCoordinates(event);
  ctx.beginPath();
  ctx.moveTo(x, y);
};

const draw = (event) => {
  if (!isDrawing.value || !ctx) return;
  const { x, y } = getCoordinates(event);
  ctx.lineTo(x, y);
  ctx.stroke();
};

const stopDrawing = () => {
  isDrawing.value = false;
};

const clearSignature = () => {
  const canvas = canvasRef.value;
  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
};

const canvasToBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    // **AÑADIDO:** Comprobación de seguridad
    if (!canvas) {
      return reject(new Error("El canvas no está disponible."));
    }
    canvas.toBlob(resolve, 'image/webp', 0.7);
  });
};

const saveSignature = async () => {
  try {
    // **AÑADIDO:** Comprobación de seguridad
    if (!canvasRef.value) {
      console.error("Intento de guardar firma sin un canvas válido.");
      return;
    }
    const signatureBlob = await canvasToBlob(canvasRef.value);
    emit('save', signatureBlob);
    closeModal();
  } catch (error) {
    console.error("Error al guardar la firma:", error);
    // Opcional: mostrar una alerta al usuario
    alert("No se pudo guardar la firma. Por favor, inténtelo de nuevo.");
  }
};

const closeModal = () => {
  emit('close');
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>