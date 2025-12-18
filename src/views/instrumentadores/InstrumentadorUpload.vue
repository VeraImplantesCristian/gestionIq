<!-- src/views/instrumentadores/InstrumentadorUpload.vue -->
<template>
  <div class="instrumentador-upload-container">
    <h2>Subir Comprobante</h2>
    <p>
      Estás subiendo un archivo como: <strong>{{ instrumentadorDni }}</strong>
    </p>

    <!-- 
      Aquí está la magia de la reutilización.
      Es el MISMO componente FileUpload, pero configurado para este caso de uso:
      - area: 'instrumentadores' -> Guarda los archivos en una carpeta separada en R2.
      - acceptedFileTypes: 'image/*' -> Solo permite subir imágenes.
      - enableCamera: true -> Prioriza el uso de la cámara en móviles.
    -->
    <FileUpload 
      :area="'instrumentadores'"
      :owner-id="instrumentadorDni"
      :accepted-file-types="'image/*'"
      :enable-camera="true"
      @upload-success="handleUploadSuccess"
      @upload-error="handleUploadError"
    />

    <!-- 
      En este caso, no necesitamos un botón de "Guardar" separado.
      La subida del archivo es la única acción, así que guardamos en la BD automáticamente.
      Solo mostramos un mensaje de estado.
    -->
    <div v-if="statusMessage" class="status-container">
      <p :class="statusClass">{{ statusMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../../services/supabase';
import FileUpload from '../../components/uploader/FileUpload.vue';

// --- ESTADO DE LA VISTA ---

// En una app real, el DNI vendría del estado de login o de un paso anterior.
const instrumentadorDni = ref('12345678'); 
const statusMessage = ref('');
const hasError = ref(false);
const isSaving = ref(false);

const statusClass = computed(() => hasError.value ? 'status-error' : 'status-success');

// --- MÉTODOS / HANDLERS ---

/**
 * Se ejecuta cuando FileUpload emite 'upload-success'.
 * A diferencia del caso de Logística, aquí la lógica es más simple:
 * en cuanto el archivo se sube, intentamos guardar el registro en la base de datos.
 * @param {object} fileData - Los datos del archivo subido.
 */
const handleUploadSuccess = async (fileData) => {
  console.log('FileUpload notificó éxito. Procediendo a guardar en la BD.', fileData);
  statusMessage.value = 'Archivo subido. Guardando registro...';
  hasError.value = false;
  isSaving.value = true;

  try {
    // La tabla podría ser 'instrumentador_comprobantes' o similar.
    // El objeto a insertar solo contiene los datos del archivo.
    const { error } = await supabase.from('instrumentador_comprobantes').insert(fileData);

    if (error) throw error;

    statusMessage.value = `¡Comprobante "${fileData.file_name}" guardado con éxito!`;
  
  } catch (error) {
    statusMessage.value = `Error al guardar el registro: ${error.message}`;
    hasError.value = true;
  } finally {
    isSaving.value = false;
  }
};

/**
 * Maneja el evento de error desde el componente hijo.
 */
const handleUploadError = (error) => {
  statusMessage.value = `Error al subir el archivo: ${error.message}`;
  hasError.value = true;
};
</script>

<style scoped>
.instrumentador-upload-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: center;
}
.status-container {
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 4px;
  background-color: #f8f9fa;
}
.status-error {
  color: red;
}
.status-success {
  color: green;
}
</style>