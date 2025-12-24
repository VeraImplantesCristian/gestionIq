<!-- src/components/uploader/FileUpload.vue -->
<template>
  <div 
    class="uploader-container"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="handleDrop"
    :class="{ 'is-dragging': isDragging }"
  >
    <!-- Inputs ocultos que son la base de la funcionalidad -->
    <input type="file" @change="handleFileChange" ref="fileInputMultiple" :accept="acceptedFileTypes" hidden multiple />
    <input type="file" @change="handleFileChange" ref="fileInputCamera" :accept="acceptedFileTypes" capture="environment" hidden />

    <!-- Estado inicial o cuando se arrastran archivos -->
    <div v-if="selectedFiles.length === 0" class="initial-state">
      <div class="drag-drop-text">{{ isDragging ? 'Soltá los archivos aquí' : 'Arrastrá archivos o seleccioná una opción' }}</div>
      <div class="initial-buttons">
        <button @click="triggerFileInput('multiple')" :disabled="isUploading">Seleccionar Archivos</button>
        <button v-if="enableCamera && isMobile" @click="triggerFileInput('camera')" :disabled="isUploading">Abrir Cámara</button>
        <button v-if="enableCamera && !isMobile" @click="isWebcamModalOpen = true" :disabled="isUploading">Usar Webcam</button>
      </div>
    </div>

    <!-- Galería de previsualización de archivos seleccionados -->
    <div v-else class="preview-gallery-container">
      <div class="preview-header">
        <h4 class="preview-title">Archivos listos ({{ selectedFiles.length }}):</h4>
        <!-- Botón para añadir más archivos -->
        <button @click="triggerFileInput('multiple')" class="add-more-btn" :disabled="isUploading">+</button>
      </div>
      <div class="preview-gallery">
        <div v-for="(file, index) in selectedFiles" :key="file.uniqueId" class="preview-card">
          <img v-if="file.type.startsWith('image/')" :src="file.previewUrl" class="preview-image" alt="Previsualización" />
          <p class="preview-caption" :title="file.name">{{ file.name }}</p>
          <button @click="removeFile(index)" class="remove-btn" :disabled="isUploading" aria-label="Quitar archivo">×</button>
        </div>
      </div>
    </div>

    <!-- Feedback durante la subida -->
    <div v-if="isUploading" class="upload-feedback">
      <p>Subiendo {{ uploadProgress.current }} de {{ uploadProgress.total }}...</p>
      <progress :value="uploadProgress.current" :max="uploadProgress.total"></progress>
    </div>

    <!-- Modal de Webcam para escritorio -->
    <WebcamCapture :show="isWebcamModalOpen" @close="isWebcamModalOpen = false" @photo-taken="addFiles" />
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
// Importaciones con las rutas corregidas según tu estructura de proyecto
import { supabase } from '../../services/supabase';
import { useB2Upload } from './useB2Upload';
import { useDeviceDetection } from '../../composables/useDeviceDetection';
import { resizeImage } from '../../services/useImageResizer.js';
import WebcamCapture from '../capture/WebcamCapture.vue';
import { useToast } from 'vue-toastification';

// --- PROPS Y COMPOSABLES ---
const props = defineProps({
  area: { type: String, default: 'logistica' },
  ownerId: { type: String, required: true },
  acceptedFileTypes: { type: String, default: 'image/*' },
  enableCamera: { type: Boolean, default: true },
});

const toast = useToast();
const { isMobile } = useDeviceDetection();
const { uploadFile } = useB2Upload();

// --- ESTADO DEL COMPONENTE ---
const fileInputMultiple = ref(null);
const fileInputCamera = ref(null);
const selectedFiles = ref([]);
const isUploading = ref(false);
const uploadProgress = ref({ current: 0, total: 0 });
const isWebcamModalOpen = ref(false);
const isChainShotActive = ref(false);
const isDragging = ref(false);

// --- LÓGICA DE MANEJO DE ARCHIVOS ---
const addFiles = (files) => {
  const fileList = Array.from(files);
  for (const file of fileList) {
    file.previewUrl = URL.createObjectURL(file);
    file.uniqueId = crypto.randomUUID();
    selectedFiles.value.push(file);
  }
};

const triggerFileInput = (mode) => {
  isChainShotActive.value = (mode === 'camera');
  if (mode === 'multiple') fileInputMultiple.value.click();
  else if (mode === 'camera') fileInputCamera.value.click();
};

const handleFileChange = (event) => {
  const newFiles = event.target.files;
  if (newFiles.length > 0) {
    addFiles(newFiles);
    if (isChainShotActive.value) {
      setTimeout(() => triggerFileInput('camera'), 100);
      return;
    }
  } else {
    isChainShotActive.value = false;
  }
  event.target.value = '';
};

const handleDrop = (event) => {
  isDragging.value = false;
  addFiles(event.dataTransfer.files);
};

const removeFile = (index) => {
  const fileToRemove = selectedFiles.value[index];
  URL.revokeObjectURL(fileToRemove.previewUrl);
  selectedFiles.value.splice(index, 1);
};

// --- LÓGICA DE SUBIDA (NÚCLEO DEL COMPONENTE) ---
const startUpload = async () => {
  if (selectedFiles.value.length === 0) return [];

  isUploading.value = true;
  uploadProgress.value = { current: 0, total: selectedFiles.value.length };
  toast.info(`Iniciando subida de ${selectedFiles.value.length} archivos...`);

  const uploadedFilesData = [];

  for (const originalFile of selectedFiles.value) {
    uploadProgress.value.current++;
    try {
      // 1. Generamos UN solo nombre base aquí en el frontend.
      const baseName = crypto.randomUUID();
      
      const fileExtension = originalFile.name.split('.').pop() || 'tmp';
      const thumbnailFile = await resizeImage(originalFile);

      // Función auxiliar para llamar a la Edge Function
      const getPresignedUrl = (file, ext, isThumb = false) => {
        return supabase.functions.invoke('b2-presigned-url', {
          body: {
            area: props.area,
            owner: props.ownerId,
            contentType: file.type,
            extension: ext,
            isThumb: isThumb,
            baseName: baseName // 2. Enviamos el mismo nombre base en ambas peticiones.
          }
        });
      };
      
      const presignedUrlPromises = [];
      presignedUrlPromises.push(getPresignedUrl(originalFile, fileExtension, false));
      if (thumbnailFile) {
        presignedUrlPromises.push(getPresignedUrl(thumbnailFile, 'webp', true));
      }

      const responses = await Promise.all(presignedUrlPromises);
      const originalResponse = responses[0];
      const thumbResponse = responses.length > 1 ? responses[1] : null;

      if (originalResponse.error) throw originalResponse.error;
      if (thumbResponse && thumbResponse.error) throw thumbResponse.error;

      const originalPresigned = originalResponse.data;
      
      const uploadPromises = [];
      uploadPromises.push(uploadFile(originalPresigned.uploadUrl, originalFile));
      if (thumbnailFile && thumbResponse) {
        const thumbPresigned = thumbResponse.data;
        uploadPromises.push(uploadFile(thumbPresigned.uploadUrl, thumbnailFile));
      }

      await Promise.all(uploadPromises);

      uploadedFilesData.push({
        object_key: originalPresigned.objectKey,
        area: props.area,
        content_type: originalFile.type,
        size_bytes: originalFile.size,
        file_name: originalFile.name,
      });

    } catch (error) {
      const errorMessage = error.message || 'Error desconocido durante la subida.';
      toast.error(`Fallo crítico en la subida de ${originalFile.name}: ${errorMessage}`);
      console.error(`[FileUpload] Error detallado para ${originalFile.name}:`, error);
      isUploading.value = false;
      throw new Error(`Fallo en la subida del archivo: ${errorMessage}`);
    }
  }

  toast.success('Todos los archivos se subieron correctamente.');
  isUploading.value = false;
  return uploadedFilesData;
};

const clear = () => {
  selectedFiles.value.forEach(file => URL.revokeObjectURL(file.previewUrl));
  selectedFiles.value = [];
};

onUnmounted(clear);

defineExpose({ startUpload, clear });
</script>

<style scoped>
.uploader-container {
  width: 100%;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}
.uploader-container.is-dragging {
  background-color: #ebf8ff;
  border-color: #3182ce;
}
.initial-state { text-align: center; }
.drag-drop-text { color: #718096; margin-bottom: 1rem; font-weight: 500; }
.initial-buttons { display: flex; flex-direction: column; gap: 0.5rem; justify-content: center; }
@media (min-width: 640px) {
  .initial-buttons { flex-direction: row; }
}
.preview-gallery-container { width: 100%; }
.preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
.preview-title { font-size: 0.875rem; font-weight: 500; color: #4a5568; }
.add-more-btn { width: 30px; height: 30px; border-radius: 50%; font-size: 1.5rem; line-height: 1; padding: 0; }
.preview-gallery { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; }
.preview-card { position: relative; flex-shrink: 0; width: 100px; }
.preview-image { width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 1px solid #e2e8f0; }
.preview-caption { font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.25rem; text-align: center; }
.remove-btn { position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(0, 0, 0, 0.7); color: white; border: 2px solid white; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 16px; line-height: 1; padding: 0; }
.upload-feedback { text-align: center; }
button { padding: 0.75rem 1rem; border: 1px solid #ccc; border-radius: 8px; background-color: #f8f9fa; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
progress { width: 100%; margin-top: 0.5rem; }
</style>