<!-- src/components/capture/WebcamCapture.vue -->
<template>
  <!-- Usamos <Teleport> para renderizar el modal en el body, evitando problemas de z-index -->
  <Teleport to="body">
    <!-- El modal solo se muestra si la prop 'show' es verdadera -->
    <div v-if="show" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <h3 class="modal-title">Capturar Foto desde Webcam</h3>

        <!-- Contenedor del video y mensajes de estado -->
        <div class="video-container">
          <div v-if="errorMsg" class="error-state">
            <p><strong>Error:</strong> {{ errorMsg }}</p>
            <p>Asegúrate de haber dado permiso al navegador para usar la cámara.</p>
          </div>
          <div v-else-if="isLoading" class="loading-state">Cargando cámara...</div>
          
          <!-- El elemento <video> donde se mostrará el stream de la webcam -->
          <video ref="videoRef" autoplay playsinline class="video-feed"></video>
          
          <!-- El <canvas> está oculto, lo usamos para procesar la imagen -->
          <canvas ref="canvasRef" style="display: none;"></canvas>
        </div>

        <!-- Botones de acción -->
        <div class="modal-actions">
          <button @click="closeModal" class="btn-secondary">Cancelar</button>
          <button @click="capturePhoto" :disabled="isLoading || !!errorMsg" class="btn-primary">
            Capturar Foto
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true }
});

const emit = defineEmits(['close', 'photo-taken']);

const videoRef = ref(null);
const canvasRef = ref(null);
const stream = ref(null);
const isLoading = ref(false);
const errorMsg = ref('');

/**
 * Inicia la cámara usando la API getUserMedia.
 */
const startCamera = async () => {
  if (!props.show || stream.value) return;

  isLoading.value = true;
  errorMsg.value = '';
  try {
    // Pedimos permiso al usuario y obtenemos el stream de video.
    stream.value = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user' } // Prioriza la cámara frontal
    });
    // Asignamos el stream al elemento <video> para que se muestre.
    if (videoRef.value) {
      videoRef.value.srcObject = stream.value;
    }
  } catch (err) {
    console.error("Error al acceder a la webcam:", err);
    errorMsg.value = "No se pudo acceder a la cámara.";
  } finally {
    isLoading.value = false;
  }
};

/**
 * Detiene todos los tracks de video para apagar la cámara y liberar recursos.
 */
const stopCamera = () => {
  if (stream.value) {
    stream.value.getTracks().forEach(track => track.stop());
    stream.value = null;
  }
};

/**
 * Captura un fotograma del video, lo convierte en un archivo y lo emite.
 */
const capturePhoto = () => {
  if (!videoRef.value || !canvasRef.value) return;

  const video = videoRef.value;
  const canvas = canvasRef.value;
  const context = canvas.getContext('2d');

  // Ajustamos el tamaño del canvas al del video.
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Dibujamos el fotograma actual del video en el canvas.
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convertimos el contenido del canvas a un Blob (un objeto tipo archivo).
  canvas.toBlob((blob) => {
    // Creamos un archivo real a partir del Blob.
    const photoFile = new File([blob], `webcam-${Date.now()}.jpg`, { type: 'image/jpeg' });
    // Emitimos el evento con el archivo para que el padre lo reciba.
    emit('photo-taken', photoFile);
    closeModal();
  }, 'image/jpeg', 0.9); // Calidad del 90%
};

const closeModal = () => {
  emit('close');
};

// Usamos un 'watcher' para iniciar/detener la cámara cuando la prop 'show' cambia.
watch(() => props.show, (newValue) => {
  if (newValue) {
    startCamera();
  } else {
    stopCamera();
  }
});

// Nos aseguramos de apagar la cámara si el componente se destruye.
onUnmounted(() => {
  stopCamera();
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}
.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}
.video-container {
  position: relative;
  background-color: #000;
  border-radius: 4px;
  overflow: hidden;
}
.video-feed {
  width: 100%;
  display: block;
}
.error-state, .loading-state {
  color: white;
  text-align: center;
  padding: 4rem 1rem;
}
.modal-actions {
  margin-top: 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}
.btn-primary, .btn-secondary {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
}
.btn-primary {
  background-color: #3b82f6;
  color: white;
}
.btn-primary:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}
.btn-secondary {
  background-color: #e5e7eb;
  color: #1f2937;
}
</style>