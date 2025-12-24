<!-- src/views/logistica/ConsumoView.vue -->
<template>
  <div class="consumo-view-container">
    <div class="form-wrapper">
      <h1 class="form-title">Control de Consumo y Devolución</h1>
      
      <!-- Paso 1: Selector de Cirugía -->
      <div class="form-group">
        <SurgerySelector @surgery-selected="handleSurgerySelection" ref="surgerySelectorRef" />
      </div>

      <!-- Alerta de Reporte Existente -->
      <div v-if="existingControlWarning" class="warning-alert">
        <span class="font-bold">⚠️ Atención:</span> Ya existe un control registrado para esta cirugía el {{ existingControlWarning }}.
      </div>

      <!-- Resumen de la cirugía seleccionada -->
      <div v-if="form.selectedSurgery" class="selected-surgery-summary">
        <strong>Cirugía:</strong> {{ form.selectedSurgery.display_text }}
      </div>

      <!-- Paso 2: Campos de Control (responsivos) -->
      <div class="form-grid">
        <div class="form-group">
          <label for="fecha-control">Fecha de Control</label>
          <input type="date" id="fecha-control" v-model="form.fecha" class="form-input" />
        </div>
        <div class="form-group">
          <label for="estado">Estado General</label>
          <select id="estado" v-model="form.estado" class="form-input">
            <option disabled value="">Seleccione un estado</option>
            <option value="ok">✅ OK</option>
            <option value="revision">⚠️ Necesita Revisión</option>
            <option value="problemas">❌ Con Problemas</option>
          </select>
        </div>
      </div>

      <!-- Paso 3: Observaciones / Consumo -->
      <div class="form-group">
        <label for="observaciones">Observaciones / Consumo Detallado</label>
        <textarea 
          id="observaciones"
          v-model="form.observaciones"
          placeholder="Ej: Se utilizó 1 tornillo de 4.5mm. Caja devuelta completa."
          rows="4"
          class="form-input"
        ></textarea>
      </div>

      <!-- Paso 4: Carga de Múltiples Fotos -->
      <div class="form-group">
        <label>Adjuntar Evidencia (Fotos)</label>
        <FileUpload 
          :area="'logistica'"
          :owner-id="form.selectedSurgery ? String(form.selectedSurgery.id) : 'temp'"
          :accepted-file-types="'image/*'"
          :enable-camera="true"
          @upload-success="handleUploadSuccess"
          @upload-error="handleUploadError"
          ref="fileUploaderRef"
        />
      </div>
      
      <!-- Visor de las fotos que se han subido a R2 y están listas para guardar -->
      <EvidenceViewer :files="form.evidences" />

      <!-- Paso 5: Botón de Guardar -->
      <div class="final-actions">
        <button @click="saveControl" :disabled="!isFormValid || isSaving">
          {{ isSaving ? 'Guardando...' : 'Guardar Control' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import { format } from 'date-fns';
import { useToast } from 'vue-toastification';

import SurgerySelector from '../../components/shared/SurgerySelector.vue';
import FileUpload from '../../components/uploader/FileUpload.vue';
import EvidenceViewer from '../../components/shared/EvidenceViewer.vue';

const toast = useToast();

const form = reactive({
  selectedSurgery: null,
  fecha: '',
  estado: '',
  observaciones: '',
  evidences: [],
});

const isSaving = ref(false);
const existingControlWarning = ref(null);

const surgerySelectorRef = ref(null);
const fileUploaderRef = ref(null);

onMounted(() => {
  form.fecha = format(new Date(), 'yyyy-MM-dd');
});

const isFormValid = computed(() => {
  return form.selectedSurgery && form.fecha && form.estado && form.observaciones.trim() !== '';
});

const handleSurgerySelection = async (surgery) => {
  form.selectedSurgery = surgery;
  existingControlWarning.value = null;
  try {
    const { data, error } = await supabase
      .from('logistica_controles')
      .select('fecha_retiro')
      .eq('cirugia_id', surgery.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      existingControlWarning.value = new Date(data.fecha_retiro).toLocaleDateString('es-ES');
    }
  } catch (err) {
    toast.error("Error al verificar controles existentes.");
  }
};

const handleUploadSuccess = (fileData) => {
  const newEvidence = {
    object_key: fileData.object_key,
    file_name: fileData.file_name,
    content_type: fileData.content_type,
    size_bytes: fileData.size_bytes || 0,
    id: fileData.object_key,
    url: `${import.meta.env.VITE_R2_PUBLIC_URL}/${fileData.object_key}`,
  };
  form.evidences.push(newEvidence);
};

const handleUploadError = (errorInfo) => {
  toast.error(`Error al subir el archivo ${errorInfo.file.name}.`);
  isSaving.value = false; 
};

const saveControl = async () => {
  if (!isFormValid.value) {
    toast.warning('Por favor, complete todos los campos requeridos.');
    return;
  }

  isSaving.value = true;

  try {
    // La lógica de subida de archivos ya ocurrió a través de los eventos de FileUpload.
    // Aquí, solo nos preocupamos de guardar el registro.
    const params = {
      p_cirugia_id: form.selectedSurgery.id,
      p_fecha_retiro: form.fecha,
      p_estado: form.estado,
      p_observaciones: form.observaciones,
      p_evidences: form.evidences.map(ev => ({
        object_key: ev.object_key,
        file_name: ev.file_name,
        content_type: ev.content_type,
        size_bytes: ev.size_bytes,
      })),
    };

    const { error } = await supabase.rpc('create_logistica_control_with_evidences', params);
    if (error) throw error;

    toast.success('¡Control de consumo guardado con éxito!');
    resetForm();

  } catch (error) {
    console.error("Error al guardar el control:", error);
    toast.error(`Error al guardar: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};

const resetForm = () => {
  form.selectedSurgery = null;
  form.estado = '';
  form.observaciones = '';
  form.evidences = [];
  form.fecha = format(new Date(), 'yyyy-MM-dd');
  existingControlWarning.value = null;
  
  if (surgerySelectorRef.value) {
    surgerySelectorRef.value.clear();
  }
  if (fileUploaderRef.value) {
    fileUploaderRef.value.clear();
  }
};
</script>

<style scoped>
.consumo-view-container {
  padding: 1rem;
  background-color: #f1f5f9;
  min-height: 100%;
}
.form-wrapper {
  max-width: 700px;
  margin: 0 auto;
  background-color: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.form-title {
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}
.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
  .consumo-view-container {
    padding: 2rem;
  }
  .form-wrapper {
    padding: 2rem;
  }
  .form-title {
    font-size: 1.5rem;
  }
}
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
label { font-weight: 500; }
.form-input, textarea, select { width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; }
.selected-surgery-summary { padding: 0.75rem; background-color: #eef2ff; border-left: 4px solid #4f46e5; font-size: 0.9rem; }
.final-actions button { width: 100%; padding: 1rem; background-color: #2563eb; color: white; font-weight: 700; border: none; border-radius: 8px; cursor: pointer; }
.final-actions button:disabled { background-color: #9ca3af; cursor: not-allowed; }
.warning-alert { padding: 0.75rem; background-color: #fff7ed; border-left: 4px solid #f97316; color: #c2410c; font-size: 0.9rem; border-radius: 4px; }
</style>