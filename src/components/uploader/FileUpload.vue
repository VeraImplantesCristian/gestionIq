<!-- src/components/uploader/FileUpload.vue -->
<template>
  <div class="uploader-container">
    <!-- Input 1: Para selección múltiple de archivos desde el explorador -->
    <input 
      type="file" 
      @change="handleFileChange" 
      ref="fileInputMultiple" 
      :accept="acceptedFileTypes"
      hidden 
      multiple 
    />
    <!-- Input 2: Exclusivo para la cámara (sin 'multiple', con 'capture') -->
    <input 
      type="file" 
      @change="handleFileChange" 
      ref="fileInputCamera" 
      :accept="acceptedFileTypes"
      capture="environment"
      hidden 
    />

    <!-- Botones iniciales para seleccionar archivos -->
    <div v-if="selectedFiles.length === 0" class="initial-buttons">
      <button @click="triggerFileInput('multiple')" :disabled="isUploading">
        Seleccionar Archivos
      </button>
      <button v-if="enableCamera && isMobile" @click="triggerFileInput('camera')" :disabled="isUploading" class="mt-2">
        Abrir Cámara
      </button>
      <button v-if="enableCamera && !isMobile" @click="isWebcamModalOpen = true" :disabled="isUploading" class="mt-2">
        Usar Webcam
      </button>
    </div>

    <!-- Galería de previsualización para los archivos seleccionados -->
    <div v-if="selectedFiles.length > 0" class="preview-gallery-container">
      <h4 class="preview-title">Archivos a subir ({{ selectedFiles.length }}):</h4>
      <div class="preview-gallery">
        <div v-for="(file, index) in selectedFiles" :key="index" class="preview-card">
          <img v-if="file.type.startsWith('image/')" :src="getPreviewUrl(file)" class="preview-image" alt="Previsualización" />
          <div v-else class="preview-generic">📄</div>
          <p class="preview-caption" :title="file.name">{{ file.name }}</p>
          <button @click="removeFile(index)" class="remove-btn" :disabled="isUploading" aria-label="Quitar archivo">×</button>
        </div>
      </div>
    </div>

    <!-- Acciones de subida -->
    <div v-if="selectedFiles.length > 0" class="upload-actions">
      <!-- Este botón ahora es controlado por el padre, pero mantenemos el texto para feedback -->
      <button @click="confirmSelection" :disabled="isUploading">
        {{ isUploading ? `Procesando ${uploadProgress.current} de ${uploadProgress.total}...` : `Confirmar Selección (${selectedFiles.length})` }}
      </button>
      <progress v-if="isUploading" :value="uploadProgress.current" :max="uploadProgress.total"></progress>
    </div>
    
    <p v-if="statusMessage" :class="{ 'status-error': statusMessage.includes('Error') }">
      {{ statusMessage }}
    </p>

    <!-- Modal de la webcam para escritorio -->
    <WebcamCapture 
      :show="isWebcamModalOpen" 
      @close="isWebcamModalOpen = false"
      @photo-taken="handlePhotoTaken"
    />
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { supabase } from '../../services/supabase';
import { useImageCompression } from './useImageCompression';
import { useB2Upload } from './useB2Upload';
import { useDeviceDetection } from '../../composables/useDeviceDetection';
import WebcamCapture from '../capture/WebcamCapture.vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  area: { type: String, required: true },
  ownerId: { type: String, required: true },
  acceptedFileTypes: { type: String, default: 'image/*' },
  enableCamera: { type: Boolean, default: false },
});

const emit = defineEmits(['selection-confirmed', 'all-uploads-complete', 'upload-failed', 'upload-success']);

const toast = useToast();

// --- ESTADO ---
const fileInputMultiple = ref(null);
const fileInputCamera = ref(null);
const selectedFiles = ref([]);
const statusMessage = ref('');
const isUploading = ref(false);
const uploadProgress = ref({ current: 0, total: 0 });
const isWebcamModalOpen = ref(false);
const isChainShotActive = ref(false);

// --- COMPOSABLES ---
const { isMobile } = useDeviceDetection();
const { compressImageIfNeeded } = useImageCompression();
const { uploadFile } = useB2Upload();

// --- MÉTODOS ---

const triggerFileInput = (mode) => {
  isChainShotActive.value = (mode === 'camera');
  if (mode === 'multiple') {
    fileInputMultiple.value.click();
  } else if (mode === 'camera') {
    fileInputCamera.value.click();
  }
};

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  if (newFiles.length > 0) {
    selectedFiles.value.push(...newFiles);
    if (isChainShotActive.value) {
      setTimeout(() => {
        fileInputCamera.value.click();
      }, 100);
      return;
    }
  } else {
    isChainShotActive.value = false;
  }
  event.target.value = '';
};

const handlePhotoTaken = (photoFile) => {
  selectedFiles.value.push(photoFile);
};

const getPreviewUrl = (file) => {
  return URL.createObjectURL(file);
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const confirmSelection = () => {
  emit('selection-confirmed', selectedFiles.value);
};

const startUpload = async () => {
  console.log('[FileUpload] 🚀 startUpload INICIADO.');
  if (selectedFiles.value.length === 0) {
    console.log('[FileUpload] No hay archivos seleccionados. Saliendo.');
    return [];
  }

  isUploading.value = true;
  statusMessage.value = 'Iniciando subida en lote...';
  uploadProgress.value = { current: 0, total: selectedFiles.value.length };
  toast.info(`Iniciando subida de ${selectedFiles.value.length} archivos...`);

  const filesToUpload = [...selectedFiles.value];
  const uploadedFilesData = [];

  for (const file of filesToUpload) {
    try {
      uploadProgress.value.current++;
      console.log(`[FileUpload] 🔄 Procesando archivo ${uploadProgress.value.current}/${uploadProgress.value.total}: ${file.name}`);
      
      let fileToProcess = file;
      if (file.type.startsWith('image/')) {
        console.log(`[FileUpload] 🖼️ Comprimiendo imagen: ${file.name}`);
        fileToProcess = await compressImageIfNeeded(file);
        console.log(`[FileUpload] ✅ Imagen comprimida.`);
      }

      const extension = fileToProcess.name.split('.').pop();
      
      console.log(`[FileUpload] 🔗 Solicitando URL firmada para ${file.name}...`);
      const { data: presignedData, error: presignedError } = await supabase.functions.invoke('b2-presigned-url', {
        body: { area: props.area, owner: props.ownerId, contentType: fileToProcess.type, extension },
      });
      if (presignedError) throw presignedError;
      console.log(`[FileUpload] ✅ URL firmada recibida.`);

      console.log(`[FileUpload] 📤 Subiendo a R2: ${file.name}`);
      await uploadFile(presignedData.uploadUrl, fileToProcess);
      console.log(`[FileUpload] ✅ Archivo subido a R2 con éxito.`);
      
      const fileResult = {
        owner_id: props.ownerId,
        object_key: presignedData.objectKey,
        area: props.area,
        content_type: fileToProcess.type,
        size_bytes: fileToProcess.size,
        file_name: fileToProcess.name,
      };
      uploadedFilesData.push(fileResult);
      emit('upload-success', fileResult);

    } catch (error) {
      console.error(`[FileUpload] ❌ FALLO al subir ${file.name}:`, error);
      toast.error(`Error al subir ${file.name}: ${error.message}`);
      emit('upload-failed', { error, file });
      isUploading.value = false;
      throw error;
    }
  }

  console.log('[FileUpload] 🎉 Lote de subida completado con éxito.');
  toast.success('Todos los archivos se subieron correctamente.');
  isUploading.value = false;
  selectedFiles.value = [];
  return uploadedFilesData;
};

const clear = () => {
  selectedFiles.value = [];
  statusMessage.value = '';
  if (fileInputMultiple.value) fileInputMultiple.value.value = '';
  if (fileInputCamera.value) fileInputCamera.value.value = '';
};

defineExpose({ clear, startUpload, selectedFiles });
</script>

<style scoped>
.uploader-container { display: flex; flex-direction: column; gap: 1rem; max-width: 100%; }
.initial-buttons { display: flex; flex-direction: column; gap: 0.5rem; }
.preview-gallery-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem; }
.preview-title { font-size: 0.875rem; font-weight: 500; margin-bottom: 0.75rem; color: #4a5568; }
.preview-gallery { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; }
.preview-card { position: relative; flex-shrink: 0; width: 80px; }
.preview-image, .preview-generic { width: 80px; height: 80px; border-radius: 4px; object-fit: cover; border: 1px solid #e2e8f0; background-color: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.preview-caption { font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 0.25rem; text-align: center; }
.remove-btn { position: absolute; top: -5px; right: -5px; width: 20px; height: 20px; border-radius: 50%; background-color: rgba(0, 0, 0, 0.6); color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; }
.upload-actions { display: flex; flex-direction: column; gap: 0.5rem; }
.status-error { color: red; }
button { padding: 0.75rem 1rem; border: 1px solid #ccc; border-radius: 8px; background-color: #f8f9fa; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
button:hover { background-color: #e9ecef; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
progress { width: 100%; }
</style>