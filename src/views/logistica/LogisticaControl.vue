<!-- src/views/logistica/LogisticaControl.vue (Versión Mejorada) -->
<template>
  <div class="logistica-control-container">
    <h2>Control de Devolución de Caja</h2>

    <!-- 
      Paso 1: El selector de cirugías.
      - Escuchamos el evento '@surgery-selected' para saber cuándo el usuario ha elegido una.
    -->
    <SurgerySelector @surgery-selected="handleSurgerySelection" />

    <!-- Mostramos un resumen de la cirugía seleccionada para confirmación del usuario -->
    <div v-if="selectedSurgery" class="selected-surgery-summary">
      <p><strong>Cirugía Seleccionada:</strong> {{ selectedSurgery.display_text }}</p>
      <p><strong>ID de Reporte:</strong> {{ selectedSurgery.id }}</p>
    </div>

    <!-- Paso 2: Nuevos campos de Fecha y Estado -->
    <div class="form-grid">
      <!-- Campo de Fecha de Retiro -->
      <div class="form-group">
        <label for="fecha-retiro">Fecha de Retiro:</label>
        <input type="date" id="fecha-retiro" v-model="fechaRetiro" class="form-input" />
      </div>

      <!-- Campo de Estado con colores -->
      <div class="form-group">
        <label for="estado">Estado de la Devolución:</label>
        <div class="custom-select-wrapper">
          <select id="estado" v-model="estado" class="form-input" :class="estadoColorClass">
            <option disabled value="">Seleccione un estado</option>
            <option v-for="option in estadoOptions" :key="option.value" :value="option.value">
              {{ option.text }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Paso 3: Campo de Observaciones -->
    <div class="form-group">
      <label for="observaciones">Observaciones:</label>
      <textarea 
        id="observaciones"
        v-model="observaciones"
        placeholder="Ej: La caja volvió completa pero con una pinza rota..."
        rows="4"
        class="form-input"
      ></textarea>
    </div>

    <!-- Paso 4: Nuestro componente FileUpload -->
    <FileUpload 
      :area="'logistica'"
      :owner-id="selectedSurgery ? String(selectedSurgery.id) : 'sin-asignar'"
      :accepted-file-types="'image/*,application/pdf'"
      :enable-camera="true"
      @upload-success="handleUploadSuccess"
      @upload-error="handleUploadError"
      :disabled="!selectedSurgery"
    />

    <!-- Paso 5: Botón final para guardar todo -->
    <div class="final-actions">
      <button 
        @click="saveLogisticaRecord" 
        :disabled="!isFormValid || isSaving"
      >
        {{ isSaving ? 'Guardando...' : 'Guardar Control Completo' }}
      </button>
    </div>

    <p v-if="statusMessage" :class="statusClass">{{ statusMessage }}</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns'; // Para formatear la fecha

// Importamos nuestros componentes reutilizables
import FileUpload from '../../components/uploader/FileUpload.vue';
import SurgerySelector from '../../components/shared/SurgerySelector.vue';

// --- ESTADO DE LA VISTA ---
const selectedSurgery = ref(null);
const fechaRetiro = ref('');
const estado = ref('');
const observaciones = ref('');
const uploadedFileData = ref(null);
const isSaving = ref(false);
const statusMessage = ref('');
const hasError = ref(false);

// Opciones para el desplegable de estado
const estadoOptions = [
  { value: 'ok', text: '✅ OK', class: 'status-ok' },
  { value: 'revision', text: '⚠️ Necesita Revisión', class: 'status-revision' },
  { value: 'problemas', text: '❌ Con Problemas', class: 'status-problemas' },
];

// --- LÓGICA DE INICIALIZACIÓN ---
onMounted(() => {
  // Establece la fecha de hoy en formato YYYY-MM-DD por defecto.
  fechaRetiro.value = format(new Date(), 'yyyy-MM-dd');
});

// --- PROPIEDADES COMPUTADAS ---
const statusClass = computed(() => hasError.value ? 'status-error' : 'status-success');

// Clase de color para el <select> de estado
const estadoColorClass = computed(() => {
  const selectedOption = estadoOptions.find(opt => opt.value === estado.value);
  return selectedOption ? selectedOption.class : '';
});

// Valida que todos los campos necesarios estén completos antes de permitir guardar.
const isFormValid = computed(() => {
  return selectedSurgery.value && fechaRetiro.value && estado.value && uploadedFileData.value;
});

// --- MÉTODOS / HANDLERS ---

// Se ejecuta cuando SurgerySelector emite el evento con la cirugía seleccionada.
const handleSurgerySelection = (surgery) => {
  selectedSurgery.value = surgery;
};

// Se ejecuta cuando FileUpload emite el evento de subida exitosa.
const handleUploadSuccess = (fileData) => {
  uploadedFileData.value = fileData;
  statusMessage.value = `Archivo "${fileData.file_name}" subido. Listo para guardar.`;
  hasError.value = false;
};

const handleUploadError = (error) => {
  statusMessage.value = `Error al subir el archivo: ${error.message}`;
  hasError.value = true;
};

// Guarda el registro completo en la base de datos.
const saveLogisticaRecord = async () => {
  if (!isFormValid.value) return;

  isSaving.value = true;
  statusMessage.value = 'Guardando registro...';
  hasError.value = false;

  try {
    const recordToInsert = {
      // Renombramos 'owner_id' a 'cirugia_id' para que coincida con la BD
      cirugia_id: uploadedFileData.value.owner_id, 
      fecha_retiro: fechaRetiro.value,
      estado: estado.value,
      observaciones: observaciones.value,
      object_key: uploadedFileData.value.object_key,
      content_type: uploadedFileData.value.content_type,
      size_bytes: uploadedFileData.value.size_bytes,
      file_name: uploadedFileData.value.file_name,
    };

    const { error } = await supabase.from('logistica_controles').insert(recordToInsert);
    if (error) throw error;

    statusMessage.value = '¡Control de logística guardado con éxito!';
    resetForm();

  } catch (error) {
    statusMessage.value = `Error al guardar el registro: ${error.message}`;
    hasError.value = true;
  } finally {
    isSaving.value = false;
  }
};

// Función para limpiar el formulario después de un guardado exitoso.
const resetForm = () => {
  selectedSurgery.value = null;
  fechaRetiro.value = format(new Date(), 'yyyy-MM-dd');
  estado.value = '';
  observaciones.value = '';
  uploadedFileData.value = null;
  // Esto requeriría una función dentro de SurgerySelector para limpiarlo,
  // pero por ahora lo dejamos así para simplicidad.
};
</script>

<style scoped>
.logistica-control-container {
  display: flex; flex-direction: column; gap: 1.5rem; max-width: 600px;
  margin: 2rem auto; padding: 2rem; border: 1px solid #e2e8f0; border-radius: 8px;
}
.form-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
}
.form-group {
  display: flex; flex-direction: column; gap: 0.5rem;
}
.form-input, textarea {
  width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;
}
.selected-surgery-summary {
  padding: 1rem; background-color: #f0f8ff; border-left: 4px solid #4a90e2;
}
.status-error { color: #d9534f; }
.status-success { color: #5cb85c; }

/* Estilos para el select de estado con colores */
.custom-select-wrapper { position: relative; }
select.form-input {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  padding-right: 2.5rem;
  background-color: #fff;
  color: #333;
  font-weight: 600;
}
.status-ok { border-color: #5cb85c; background-color: #f0fff0; }
.status-revision { border-color: #f0ad4e; background-color: #fff8e1; }
.status-problemas { border-color: #d9534f; background-color: #fff0f0; }
</style>