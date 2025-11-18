<!-- src/views/ReclamoView.vue -->
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">

      <!-- Cabecera con Branding y Botón de Tema -->
      <header class="text-center mb-10 relative">
        <div class="absolute top-0 right-0">
          <button class="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800" @click="toggleDark()">
            <SunIcon v-if="isDark" class="h-6 w-6 text-amber-400" />
            <MoonIcon v-else class="h-6 w-6 text-slate-500" />
          </button>
        </div>
        <div class="inline-block text-lg font-semibold tracking-wider text-slate-500 dark:text-slate-400 mb-4">
          D I S T R I C O R R
        </div>
        <h1 class="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
          Reporte de Inconvenientes o Sugerencias
        </h1>
        <p class="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Tu opinión nos ayuda a mejorar nuestro servicio. Contanos si algo no salió como esperabas y lo solucionamos cuanto antes.
        </p>
      </header>

      <!-- Contenedor del Formulario -->
      <div class="bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-6 md:p-8">
        <Transition name="fade" mode="out-in">
          <div v-if="!formSubmitted" key="form">
            <FormularioMedicoReclamo 
              :is-submitting="isSubmitting"
              :signature-preview-url="signaturePreviewUrl"
              @submit="handleFormSubmit"
              @open-signature-modal="openSignatureModal"
            />
          </div>
          <div v-else key="success" class="text-center py-12">
            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/50">
              <svg class="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 class="mt-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Reporte Enviado con Éxito</h2>
            <p class="mt-2 text-base text-slate-600 dark:text-slate-400">Gracias por tu tiempo. Hemos recibido tu feedback.</p>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <SignatureModal 
    :show="isSignatureModalVisible"
    @close="closeSignatureModal"
    @save="handleSignatureSave"
    @clear="handleSignatureClear"
  />
</template>

<script setup>
import { ref, onUnmounted, watchEffect } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { useStorage, usePreferredDark } from '@vueuse/core';
import { SunIcon, MoonIcon } from '@heroicons/vue/24/outline';
import FormularioMedicoReclamo from '../components/reclamos/FormularioMedicoReclamo.vue';
import SignatureModal from '../components/SignatureModal.vue';

// --- LÓGICA DE MODO OSCURO ---
const isDark = useStorage('iq-dark-mode', usePreferredDark().value);
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value);
});
const toggleDark = () => (isDark.value = !isDark.value);

// --- ESTADO DE LA VISTA ---
const isSubmitting = ref(false);
const formSubmitted = ref(false);
const toast = useToast();
const isSignatureModalVisible = ref(false);
const signatureBlob = ref(null);
const signaturePreviewUrl = ref(null);

const openSignatureModal = () => isSignatureModalVisible.value = true;
const closeSignatureModal = () => isSignatureModalVisible.value = false;

const handleSignatureSave = (blob) => {
  signatureBlob.value = blob;
  if (signaturePreviewUrl.value) URL.revokeObjectURL(signaturePreviewUrl.value);
  signaturePreviewUrl.value = URL.createObjectURL(blob);
  closeSignatureModal();
};

const handleSignatureClear = () => {
  signatureBlob.value = null;
  if (signaturePreviewUrl.value) {
    URL.revokeObjectURL(signaturePreviewUrl.value);
    signaturePreviewUrl.value = null;
  }
};

// --- LÓGICA DE ENVÍO FINAL ---
const handleFormSubmit = async ({ formData, isFormValid, errors }) => {
  if (!signatureBlob.value) {
    errors.signature = 'La firma de confirmación es requerida.';
    toast.error("Por favor, confirme el reporte con su firma.");
    return;
  }
  
  if (!isFormValid) {
    toast.error("Por favor, revise los campos requeridos.");
    return;
  }

  isSubmitting.value = true;
  
  try {
    // 1. Subir la firma a Supabase Storage
    const filePath = `firmas-reclamos/firma-${Date.now()}.webp`;
    const { error: uploadError } = await supabase.storage
      .from('firmas')
      .upload(filePath, signatureBlob.value, { contentType: 'image/webp' });
    if (uploadError) throw uploadError;

    // 2. Obtener la URL pública de la firma
    const { data: urlData } = supabase.storage.from('firmas').getPublicUrl(filePath);

    // 3. Insertar el reporte en la base de datos
    const { error: insertError } = await supabase
      .from('quejas')
      .insert([
        { 
          nombre_medico: formData.nombre_medico,
          tipo_reclamo: formData.tipo_reclamo,
          severidad: formData.severidad || null, // Aseguramos que sea nulo si no se elige
          descripcion_reclamo: formData.descripcion_reclamo,
          contacto_preferido: formData.contacto_preferido,
          url_firma: urlData.publicUrl,
          // Los campos opcionales del formulario no se envían si están vacíos
          ...(formData.especialidad && { especialidad: formData.especialidad }),
          ...(formData.institucion && { institucion: formData.institucion }),
        }
      ]);
    if (insertError) throw insertError;

    formSubmitted.value = true;
    toast.success("Reporte enviado correctamente. ¡Gracias!");

  } catch (error) {
    console.error('Error al enviar el reporte:', error);
    toast.error(`Error al enviar el reporte: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

onUnmounted(() => {
  if (signaturePreviewUrl.value) URL.revokeObjectURL(signaturePreviewUrl.value);
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>