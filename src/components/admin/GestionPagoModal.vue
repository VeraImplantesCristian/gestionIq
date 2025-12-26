<!-- src/components/admin/GestionPagoModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="close">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Registrar Pago</h3>
          <button @click="close" class="close-button">&times;</button>
        </div>
        
        <div class="modal-body">
          <p class="mb-4 text-sm text-slate-600">Estás registrando el pago para la cirugía del paciente: <strong class="text-slate-800">{{ reporte.paciente }}</strong>.</p>
          
          <div class="form-grid">
            <div class="form-group">
              <label for="monto">Monto Pagado</label>
              <input type="number" id="monto" v-model="form.monto" class="form-input" placeholder="Ej: 15000" />
            </div>
            <div class="form-group">
              <label for="fecha_pago">Fecha de Pago</label>
              <input type="date" id="fecha_pago" v-model="form.fecha_pago" class="form-input" />
            </div>
          </div>

          <div class="form-group mt-4">
            <label>Comprobante de Pago (PDF o Imagen)</label>
            <FileUpload
              ref="fileUploaderRef"
              area="comprobantes-pago"
              :owner-id="String(reporte.id)"
              :accepted-file-types="'image/*,application/pdf'"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button @click="close" class="btn-secondary">Cancelar</button>
          <button @click="handleSave" :disabled="isSaving || !isFormValid" class="btn-primary">
            {{ isSaving ? 'Guardando...' : 'Guardar Pago' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { supabase } from '../../services/supabase';
import FileUpload from '../uploader/FileUpload.vue';

const props = defineProps({
  show: { type: Boolean, default: false },
  reporte: { type: Object, required: true }
});

const emit = defineEmits(['close', 'pago-registrado']);

const toast = useToast();
const fileUploaderRef = ref(null);
const isSaving = ref(false);

const form = reactive({
  monto: null,
  fecha_pago: '',
});

const isFormValid = computed(() => {
  return form.monto > 0 && form.fecha_pago;
});

onMounted(() => {
  form.fecha_pago = new Date().toISOString().split('T')[0];
});

const close = () => {
  emit('close');
};

const handleSave = async () => {
  if (!isFormValid.value) {
    toast.warning("Por favor, completá el monto y la fecha.");
    return;
  }

  isSaving.value = true;
  try {
    let comprobanteKey = null;

    // 1. Subir el archivo del comprobante si existe
    const uploadedFiles = await fileUploaderRef.value.startUpload();
    if (uploadedFiles.length > 0) {
      comprobanteKey = uploadedFiles[0].object_key;
    }

    // 2. Llamar a la RPC con todos los datos
    const { error } = await supabase.rpc('marcar_como_pagado', {
      p_reporte_id: props.reporte.id,
      p_instrumentador_dni: props.reporte.instrumentador_dni,
      p_monto: form.monto,
      p_fecha_pago: form.fecha_pago,
      p_comprobante_key: comprobanteKey
    });

    if (error) throw error;

    toast.success("¡Pago registrado con éxito!");
    emit('pago-registrado');
    close();

  } catch (error) {
    toast.error(`Error al registrar el pago: ${error.message}`);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { background-color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 90%; max-width: 500px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #e5e7eb; }
.modal-title { font-size: 1.125rem; font-weight: 600; }
.close-button { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
.modal-body { padding: 1.5rem; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
label { font-size: 0.875rem; font-weight: 500; }
.form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; }
.btn-primary { background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; }
.btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; }
.btn-secondary { background-color: white; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>