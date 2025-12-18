<!-- src/components/uploader/FileUpload.vue -->
<template>
  <div class="uploader-container">
    <!-- 
      Input de archivo oculto.
      - 'multiple': Permite al usuario seleccionar más de un archivo a la vez.
    -->
    <input 
      type="file" 
      @change="handleFileChange" 
      ref="fileInput" 
      :accept="acceptedFileTypes"
      :capture="captureMode"
      hidden 
      multiple 
    />

    <!-- 
      Botones iniciales para seleccionar archivos.
      Se ocultan una vez que hay archivos en la cola para subir.
    -->
    <div v-if="selectedFiles.length === 0" class="initial-buttons">
      <button @click="triggerFileInput(false)" :disabled="isUploading">
        Seleccionar Archivos
      </button>
      <!-- Botón para cámara de móvil (solo en móviles) -->
      <button v-if="enableCamera && isMobile" @click="triggerFileInput(true)" :disabled="isUploading" class="mt-2">
        Abrir Cámara
      </button>
      <!-- Botón para webcam de PC (solo en escritorio) -->
      <button v-if="enableCamera && !isMobile" @click="isWebcamModalOpen = true" :disabled="isUploading" class="mt-2">
        Usar Webcam
      </button>
    </div>

    <!-- 
      Galería de previsualización para los archivos seleccionados.
      Aparece cuando hay al menos un archivo en la cola.
    -->
    <div v-if="selectedFiles.length > 0" class="preview-gallery-container">
      <h4 class="preview-title">Archivos a subir ({{ selectedFiles.length }}):</h4>
      <div class="preview-gallery">
        <div v-for="(file, index) in selectedFiles" :key="index" class="preview-card">
          <img v-if="file.type.startsWith('image/')" :src="getPreviewUrl(file)" class="preview-image" alt="Previsualización" />
          <div v-else class="preview-generic">📄</div>
          <p class="preview-caption" :title="file.name">{{ file.name }}</p>
          <!-- Botón para eliminar un archivo del lote antes de subirlo -->
          <button @click="removeFile(index)" class="remove-btn" :disabled="isUploading" aria-label="Quitar archivo">×</button>
        </div>
      </div>
    </div>

    <!-- Acciones de subida -->
    <div v-if="selectedFiles.length > 0" class="upload-actions">
      <button @click="startUpload" :disabled="isUploading || selectedFiles.length === 0">
        {{ isUploading ? `Subiendo ${uploadProgress.current} de ${uploadProgress.total}...` : `Confirmar y Subir (${selectedFiles.length}) Archivos` }}
      </button>
      <!-- Barra de progreso general del lote -->
      <progress v-if="isUploading" :value="uploadProgress.current" :max="uploadProgress.total"></progress>
    </div>
    
    <p v-if="statusMessage" :class="{ 'status-error': statusMessage.includes('Error') }">
      {{ statusMessage }}
    </p>

    <!-- 
      Instancia del componente modal de la webcam.
      Se renderiza aquí pero se muestra en el body gracias a <Teleport>.
    -->
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

const props = defineProps({
  area: { type: String, required: true },
  ownerId: { type: String, required: true },
  acceptedFileTypes: { type: String, default: 'image/*' },
  enableCamera: { type: Boolean, default: false },
});

const emit = defineEmits(['upload-success', 'upload-error']);

// --- ESTADO ---
const fileInput = ref(null);
const selectedFiles = ref([]);
const captureMode = ref(null);
const statusMessage = ref('');
const isUploading = ref(false);
const uploadProgress = ref({ current: 0, total: 0 });
const isWebcamModalOpen = ref(false);

// --- COMPOSABLES ---
const { isMobile } = useDeviceDetection();
const { compressImageIfNeeded } = useImageCompression();
const { uploadFile } = useB2Upload();

// --- MÉTODOS ---

const triggerFileInput = (useCamera) => {
  captureMode.value = useCamera ? 'environment' : null;
  fileInput.value.click();
};

const handleFileChange = (event) => {
  const newFiles = Array.from(event.target.files);
  if (!newFiles.length) return;
  selectedFiles.value.push(...newFiles);
  statusMessage.value = '';
  event.target.value = ''; // Permite seleccionar los mismos archivos de nuevo
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

const startUpload = async () => {
  if (selectedFiles.value.length === 0) return;

  isUploading.value = true;
  statusMessage.value = 'Iniciando subida en lote...';
  uploadProgress.value = { current: 0, total: selectedFiles.value.length };

  const filesToUpload = [...selectedFiles.value];
  
  for (const file of filesToUpload) {
    try {
      uploadProgress.value.current++;
      statusMessage.value = `Procesando ${file.name}...`;
      
      let fileToProcess = file;
      if (file.type.startsWith('image/')) {
        fileToProcess = await compressImageIfNeeded(file);
      }

      const extension = fileToProcess.name.split('.').pop();
      
      statusMessage.value = `Solicitando permiso para ${file.name}...`;
      const { data: presignedData, error: presignedError } = await supabase.functions.invoke('b2-presigned-url', {
        body: { area: props.area, owner: props.ownerId, contentType: fileToProcess.type, extension },
      });
      if (presignedError) throw presignedError;

      statusMessage.value = `Subiendo ${file.name}...`;
      await uploadFile(presignedData.uploadUrl, fileToProcess);
      
      emit('upload-success', {
        owner_id: props.ownerId,
        object_key: presignedData.objectKey,
        area: props.area,
        content_type: fileToProcess.type,
        size_bytes: fileToProcess.size,
        file_name: fileToProcess.name,
      });

    } catch (error) {
      console.error(`Fallo al subir ${file.name}:`, error);
      statusMessage.value = `Error con el archivo ${file.name}.`;
      emit('upload-error', { error, file });
      isUploading.value = false;
      return; // Detenemos el lote en caso de error
    }
  }

  statusMessage.value = '¡Lote de subida completado!';
  isUploading.value = false;
  selectedFiles.value = []; // Limpiamos la selección al terminar con éxito
};

// --- FUNCIÓN EXPUESTA ---
// Permite que el componente padre llame a este método para limpiar el estado.
const clear = () => {
  selectedFiles.value = [];
  statusMessage.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Exponemos la función 'clear' para que sea accesible desde el ref del padre.
defineExpose({ clear });
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