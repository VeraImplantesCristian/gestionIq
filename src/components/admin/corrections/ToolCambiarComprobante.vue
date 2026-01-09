<!-- src/components/admin/corrections/ToolCambiarComprobante.vue -->
<template>
  <div class="tool-container">
    <header class="tool-header">
      <h4 class="tool-title">Cambiar Comprobante de Pago</h4>
      <p class="tool-description">
        Reemplaza el archivo del comprobante asociado a esta orden.
      </p>
    </header>

    <div class="tool-body">
      <div>
        <label class="form-label">Nuevo Archivo de Comprobante</label>
        <FileUpload 
          ref="fileUploader" 
          :owner-id="`orden-${orderId}`"
        />
      </div>

      <div class="pt-4">
        <button 
          @click="handleUpdate"
          :disabled="!isFormValid || isSubmitting"
          class="btn-primary w-full"
        >
          <span v-if="isSubmitting">Actualizando...</span>
          <span v-else>Actualizar Comprobante</span>
        </button>
        <p v-if="!isFormValid && !isSubmitting" class="text-xs text-center mt-2 text-red-500">
          Se requiere un archivo para actualizar.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../../../services/supabase';
// --- CAMBIO: Se importa el composable completo ---
import { useToasts } from '../../../composables/useToasts';
import FileUpload from '../../uploader/FileUpload.vue';

const props = defineProps({
  orderId: {
    type: [Number, String],
    required: true
  }
});

const emit = defineEmits(['action-completed']);

// --- CAMBIO: Se instancian todas las funciones necesarias del composable ---
const { showLoadingToast, updateToast, showErrorToast } = useToasts();
const fileUploader = ref(null);
const isSubmitting = ref(false);

const isFormValid = computed(() => {
  return fileUploader.value?.hasFiles;
});

const handleUpdate = async () => {
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;
  // --- CAMBIO: Se usa la nueva función para mostrar el toast de carga ---
  const loadingToastId = showLoadingToast("Subiendo nuevo comprobante...");

  try {
    const uploadResult = await fileUploader.value.startUpload('comprobantes-pago');
    
    if (!uploadResult || uploadResult.length === 0 || !uploadResult[0].object_key) {
      throw new Error("La subida del archivo no devolvió la clave del objeto.");
    }
    const newObjectKey = uploadResult[0].object_key;
    
    // --- CAMBIO: Se usa la nueva función para actualizar el toast ---
    updateToast(loadingToastId, "Comprobante subido. Actualizando registro...", 'info');

    const { error: rpcError } = await supabase.rpc('actualizar_comprobante_orden_pago', {
      p_orden_id: props.orderId,
      p_nuevo_object_key: newObjectKey
    });

    if (rpcError) throw rpcError;

    // --- CAMBIO: Se usa la nueva función para mostrar el toast de éxito ---
    updateToast(loadingToastId, `¡Comprobante de la Orden #${props.orderId} actualizado con éxito!`, 'success');
    
    emit('action-completed');
    fileUploader.value.reset();

  } catch (err) {
    console.error("Error al actualizar el comprobante:", err);
    // --- CAMBIO: Se usa la nueva función para mostrar el toast de error ---
    // Se actualiza el toast de carga a un estado de error.
    updateToast(loadingToastId, `Error: ${err.message}`, 'error');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.tool-container { @apply bg-white dark:bg-slate-800 rounded-xl shadow; }
.tool-header { @apply p-4 border-b border-slate-200 dark:border-slate-700; }
.tool-title { @apply font-semibold text-slate-800 dark:text-slate-100; }
.tool-description { @apply text-sm text-slate-500 dark:text-slate-400; }
.tool-body { @apply p-4 space-y-4; }
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
</style>