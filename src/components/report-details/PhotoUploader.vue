<!-- src/components/report-details/PhotoUploader.vue -->
<template>
  <div class="photo-uploader-container">
    <!-- Input de archivo oculto que permite la selección múltiple -->
    <input
      type="file"
      ref="fileInput"
      @change="handleFileChange"
      accept="image/*"
      multiple
      hidden
    />
    <!-- El botón visible que el usuario presiona -->
    <button @click="triggerFileInput" class="btn btn-primary">
      Subir Fotos
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- DEFINICIÓN DE EVENTOS ---
// El componente notificará al padre (PhotosGallery) cuando se seleccionen fotos.
const emit = defineEmits(['photos-uploaded']);

// --- ESTADO INTERNO ---
const fileInput = ref(null);

// --- MÉTODOS ---
/**
 * Activa el clic en el input de archivo oculto.
 */
const triggerFileInput = () => {
  fileInput.value.click();
};

/**
 * Se ejecuta cuando el usuario selecciona uno o más archivos.
 * @param {Event} event - El evento del input de archivo.
 */
const handleFileChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    // Emitimos el evento con la lista de archivos seleccionados.
    emit('photos-uploaded', Array.from(files));
  }
  // Limpiamos el valor del input para permitir seleccionar los mismos archivos de nuevo.
  event.target.value = '';
};
</script>

<style scoped>
.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid transparent;
  font-weight: 500;
  cursor: pointer;
  font-size: 0.875rem;
}
.btn-primary {
  background-color: #2563eb;
  color: white;
}
</style>