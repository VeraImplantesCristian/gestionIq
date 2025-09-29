<!-- src/components/FichaForm.vue -->
<template>
  <div class="w-full max-w-4xl mx-auto">
    <!-- Cabecera con logo y Dark Mode Toggle -->
    <header class="flex items-center justify-between mb-6">
      <div class="w-12"></div>
      <div class="flex flex-col items-center">
        <img src="/1.svg" alt="Logo Districorr" class="h-12 mb-2">
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">Ficha Post Cirugía</h1>
      </div>
      <div class="w-12 flex justify-end">
        <DarkModeToggle />
      </div>
    </header>
    
    <!-- Barra de progreso visual -->
    <div class="w-full max-w-2xl mx-auto mb-8 px-4">
      <div class="flex items-center justify-between relative">
        <div class="absolute left-0 top-1/2 -translate-y-1/2 h-1 w-full bg-slate-200 dark:bg-slate-700">
          <div class="h-1 bg-blue-600 transition-all duration-300" :style="{ width: `${(currentStep / (steps.length - 1)) * 100}%` }"></div>
        </div>
        <div v-for="(step, index) in steps" :key="index" class="relative flex flex-col items-center">
          <div class="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 z-10" :class="index <= currentStep ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'">
            <span v-if="index < currentStep">✓</span>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <p class="text-xs mt-2 font-medium" :class="index <= currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'">{{ step.label }}</p>
        </div>
      </div>
    </div>

    <!-- Tarjeta de datos de cirugía STICKY con estilos dark -->
    <div class="sticky top-4 z-20 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm mb-8 dark:bg-slate-800/80 dark:border-slate-700">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="flex items-start space-x-2">
          <UserIcon class="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0 dark:text-slate-400"/>
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">Paciente</span>
            <strong class="text-slate-800 text-base dark:text-slate-200">{{ reporte.paciente }}</strong>
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <ClipboardDocumentCheckIcon class="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0 dark:text-slate-400"/>
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">Médico</span>
            <strong class="text-slate-700 dark:text-slate-300">{{ reporte.medico }}</strong>
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <CalendarIcon class="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0 dark:text-slate-400"/>
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">Fecha</span>
            <strong class="text-slate-700 dark:text-slate-300">{{ new Date(reporte.fecha_cirugia).toLocaleDateString() }}</strong>
          </div>
        </div>
        <div class="flex items-start space-x-2">
          <MapPinIcon class="h-5 w-5 text-slate-500 mt-0.5 flex-shrink-0 dark:text-slate-400"/>
          <div>
            <span class="block text-xs text-slate-500 dark:text-slate-400">Lugar</span>
            <strong class="text-slate-700 dark:text-slate-300">{{ reporte.lugar_cirugia }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenedor principal del formulario con estilos dark -->
    <form @submit.prevent="handleSubmit" class="bg-white p-6 sm:p-8 rounded-2xl shadow-md dark:bg-slate-800">
      <div class="min-h-[400px]">
        <Transition name="fade" mode="out-in">
          <component 
            :is="steps[currentStep].component"
            v-model="formData"
            :errors="errors"
            :signaturePreviewUrl="signaturePreviewUrl"
            @open-signature-modal="openSignatureModal"
            @clear-signature="handleSignatureClear"
          />
        </Transition>
      </div>

      <!-- Navegación con estilos dark -->
      <div class="mt-12 pt-6 border-t border-slate-200 flex justify-between items-center dark:border-slate-700">
        <button type="button" v-if="currentStep > 0" @click="prevStep" class="font-bold py-3 px-6 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
          Atrás
        </button>
        <div v-else></div>

        <button type="button" v-if="currentStep < steps.length - 1" @click="nextStep" class="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 flex items-center space-x-2 shadow-sm">
          <span>Siguiente</span>
          <ArrowRightIcon class="h-5 w-5"/>
        </button>
        <button type="submit" v-if="currentStep === steps.length - 1" :disabled="isSubmitting" class="bg-emerald-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-emerald-700 disabled:bg-slate-400 flex items-center space-x-2 shadow-sm">
          <span v-if="isSubmitting">Enviando...</span>
          <span v-else>Enviar Ficha</span>
          <CheckCircleIcon v-if="!isSubmitting" class="h-5 w-5"/>
        </button>
      </div>
    </form>

    <SignatureModal :show="isSignatureModalVisible" @close="closeSignatureModal" @save="handleSignatureSave" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted, markRaw } from 'vue';
import { supabase } from '../services/supabase.js';
import SignatureModal from './SignatureModal.vue';
import FormStepQuestionnaire from './FormStepQuestionnaire.vue';
import FormStepComments from './FormStepComments.vue';
import FormStepSignature from './FormStepSignature.vue';
import { UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/vue/24/solid';
import DarkModeToggle from './DarkModeToggle.vue';

const props = defineProps({
  reporte: { type: Object, required: true },
  instrumentadorNombre: { type: String, required: true }
})
const emit = defineEmits(['submit-success']);

const currentStep = ref(0);

const steps = computed(() => [
  { label: 'Cuestionario', component: markRaw(FormStepQuestionnaire) },
  { label: 'Comentarios', component: markRaw(FormStepComments) },
  { label: 'Firma', component: markRaw(FormStepSignature) },
]);

const formData = reactive({
  instrumentador_completado: props.instrumentadorNombre,
  set_completo: null,
  informe_faltante: null,
  rating_puntualidad: null,
  rating_condiciones: null,
  rating_asesoramiento: null,
  rating_evaluacion_general: null,
  consumo_realizado: '',
  representante_ventas: '',
  observaciones: '',
  tipo_logistica: null,
  transporte_utilizado: '',
  acepta_terminos: false,
  duracion_cirugia: '',
});

const errors = reactive({});
const isSubmitting = ref(false);
const signatureBlob = ref(null);
const signaturePreviewUrl = ref(null);
const isSignatureModalVisible = ref(false);

const nextStep = () => { if (currentStep.value < steps.value.length - 1) currentStep.value++; };
const prevStep = () => { if (currentStep.value > 0) currentStep.value--; };

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  if (formData.set_completo === null) errors.set_completo = 'Este campo es requerido.';
  if (formData.set_completo === false && formData.informe_faltante === null) errors.informe_faltante = 'Este campo es requerido.';
  const ratingKeys = ['rating_puntualidad', 'rating_condiciones', 'rating_asesoramiento', 'rating_evaluacion_general'];
  ratingKeys.forEach(key => { if (!formData[key]) errors[key] = 'Debe seleccionar una puntuación.'; });
  if (!formData.consumo_realizado.trim()) errors.consumo_realizado = 'El consumo realizado es un campo requerido.';
  if (!formData.tipo_logistica) errors.tipo_logistica = 'Debe seleccionar una opción de logística.';
  if (!signatureBlob.value) errors.signature = 'La firma es requerida.';
  if (!formData.acepta_terminos) errors.acepta_terminos = 'Debe aceptar los términos para continuar.';
  return Object.keys(errors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    if (errors.set_completo || errors.rating_puntualidad) currentStep.value = 0;
    else if (errors.consumo_realizado || errors.tipo_logistica) currentStep.value = 1;
    else currentStep.value = 2;
    return;
  }
  isSubmitting.value = true;
  try {
    const filePath = `firma-${props.reporte.id}-${Date.now()}.webp`;
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage.from('firmas').createSignedUploadUrl(filePath);
    if (signedUrlError) throw new Error(`Error al crear la URL de subida: ${signedUrlError.message}`);

    const { error: uploadError } = await supabase.storage.from('firmas').uploadToSignedUrl(signedUrlData.path, signedUrlData.token, signatureBlob.value, { upsert: false });
    if (uploadError) throw new Error(`Error al subir la firma: ${uploadError.message}`);

    const { data: urlData } = supabase.storage.from('firmas').getPublicUrl(filePath);

    // **CAMBIO CLAVE:** Añadimos la fecha de envío al objeto de actualización.
    const updates = { 
      ...formData, 
      url_firma: urlData.publicUrl, 
      estado: 'Enviado',
      fecha_envio: new Date().toISOString() // Guardamos la fecha y hora actual
    };
    
    const { error: updateError } = await supabase.from('reportes').update(updates).eq('id', props.reporte.id);
    if (updateError) throw updateError;
    
    emit('submit-success');
  } catch (error) {
    console.error('Error al enviar la ficha:', error);
    alert(`Error al enviar el formulario: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const openSignatureModal = () => { isSignatureModalVisible.value = true; };
const closeSignatureModal = () => { isSignatureModalVisible.value = false; };
const handleSignatureSave = (blob) => {
  signatureBlob.value = blob;
  if (signaturePreviewUrl.value) URL.revokeObjectURL(signaturePreviewUrl.value);
  signaturePreviewUrl.value = URL.createObjectURL(blob);
};

const handleSignatureClear = () => {
  signatureBlob.value = null;
  if (signaturePreviewUrl.value) {
    URL.revokeObjectURL(signaturePreviewUrl.value);
    signaturePreviewUrl.value = null;
  }
};

onUnmounted(() => {
  if (signaturePreviewUrl.value) URL.revokeObjectURL(signaturePreviewUrl.value);
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>