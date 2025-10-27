<!-- src/components/FichaForm.vue -->
<template>
  <div class="w-full">
    <!-- Contenedor Principal para la Interfaz Superior -->
    <div class="max-w-4xl mx-auto px-4">
      <div class="bg-white dark:bg-slate-900 rounded-2xl ring-1 ring-slate-200/70 dark:ring-slate-700/60 p-4 pt-6">
        <!-- 1) Header -->
        <header class="flex items-center justify-between gap-3 relative mb-4 px-0">
          <div class="flex items-center gap-3">
            <img src="/1.svg" class="h-8 opacity-90 dark:opacity-100" alt="Districorr" />
            <h1 class="text-xl font-bold text-slate-800 dark:text-slate-200 hidden sm:block">Ficha Post Cirugía</h1>
          </div>
          <button class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800" @click="toggleDark()">
            <SunIcon v-if="isDark" class="h-6 w-6 text-amber-400" />
            <MoonIcon v-else class="h-6 w-6 text-slate-500" />
          </button>
        </header>

        <!-- 2) Stepper -->
        <nav class="mx-auto mt-2">
          <ol class="grid grid-cols-3 text-sm font-medium text-slate-500">
            <li v-for="(step, index) in steps" :key="step.label" class="relative text-center" :class="{'text-blue-600 dark:text-blue-400': index === currentStep}">
              <div class="absolute inset-0 flex items-center" aria-hidden="true" v-if="index > 0">
                <div class="h-0.5 w-full" :class="index <= currentStep ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'"></div>
              </div>
              <div @click="currentStep = index" class="relative w-8 h-8 mx-auto flex items-center justify-center rounded-full cursor-pointer" :class="index < currentStep ? 'bg-blue-600 hover:bg-blue-700' : (index === currentStep ? 'border-2 border-blue-600 bg-white dark:bg-slate-900' : 'border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900')">
                <span v-if="index < currentStep" class="text-white">✓</span>
                <span v-else :class="index === currentStep ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'">{{ index + 1 }}</span>
              </div>
              <p class="mt-2 hidden sm:block">{{ step.label }}</p>
            </li>
          </ol>
        </nav>

        <!-- 3) Info-bar -->
        <section class="mt-6">
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <InfoCard label="Paciente" :value="reporte.paciente" :icon="UserIcon" />
            <InfoCard label="Médico" :value="reporte.medico" :icon="ClipboardDocumentCheckIcon" />
            <InfoCard label="Fecha" :value="formatDate(reporte.fecha_cirugia)" :icon="CalendarIcon" />
            <InfoCard label="Lugar" :value="reporte.lugar_cirugia" :icon="MapPinIcon" />
          </div>
        </section>
      </div>
    </div>

    <!-- 4) Contenedor de paso -->
    <main class="max-w-4xl mx-auto mt-6 px-4 pb-28 md:pb-6">
      <div class="rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-700/60 p-4 md:p-8">
        <Transition name="fade-slide" mode="out-in">
          <component 
            :is="steps[currentStep].component"
            :form-data="formData"
            @update:form-data="updateFormData"
            :errors="errors"
            :signature-preview-url="signaturePreviewUrl"
            @open-signature-modal="openSignatureModal"
            @set-footer-action="setFooterAction"
          />
        </Transition>
      </div>
    </main>

    <!-- 5) Footer Sticky redondeado -->
    <footer class="md:mt-8 fixed md:static bottom-0 left-0 right-0 bg-slate-100/80 dark:bg-slate-950/80 backdrop-blur-sm p-3 border-t border-slate-200/60 dark:border-slate-800 shadow-up md:rounded-b-2xl rounded-t-2xl">
      <div class="max-w-4xl mx-auto flex justify-between items-center px-2">
        <button type="button" @click="prevStep" class="px-4 h-11 min-w-[44px] rounded-xl ring-1 ring-slate-300/70 dark:ring-slate-700 font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" :class="currentStep > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'">
          Atrás
        </button>
        
        <button type="button" v-if="footerAction" @click="footerAction.action" :disabled="isSubmitting" :class="footerAction.class" class="px-6 h-11 rounded-xl font-semibold transition-colors flex items-center justify-center">
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ isSubmitting ? 'Enviando...' : footerAction.text }}</span>
        </button>
      </div>
    </footer>

    <SignatureModal :show="isSignatureModalVisible" @close="closeSignatureModal" @save="handleSignatureSave" @clear="handleSignatureClear" />
  </div>
</template>


<script setup>
import { ref, reactive, computed, onUnmounted, markRaw, watchEffect, defineComponent, h } from 'vue';
import { useStorage, usePreferredDark } from '@vueuse/core';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import SignatureModal from './SignatureModal.vue';
import FormStepQuestionnaire from './FormStepQuestionnaire.vue';
import FormStepComments from './FormStepComments.vue';
import FormStepSignature from './FormStepSignature.vue';
import { SunIcon, MoonIcon, UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  reporte: { type: Object, required: true },
  instrumentador: { type: Object, required: true }
});
const emit = defineEmits(['submit-success']);

const toast = useToast();

const prefersDark = usePreferredDark();
const isDark = useStorage('iq-dark-mode', true);
watchEffect(() => {
  document.documentElement.classList.toggle('dark', isDark.value);
});
const toggleDark = () => (isDark.value = !isDark.value);

const currentStep = ref(0);
const steps = computed(() => [
  { label: 'Cuestionario', component: markRaw(FormStepQuestionnaire) },
  { label: 'Comentarios', component: markRaw(FormStepComments) },
  { label: 'Firma', component: markRaw(FormStepSignature) },
]);

const formData = reactive({
  instrumentador_dni: props.instrumentador.dni,
  instrumentador_completado: props.instrumentador.nombre_completo,
  set_completo: null,
  informe_faltante: null,
  rating_puntualidad: 0,
  rating_condiciones: 0,
  rating_asesoramiento: 0,
  rating_evaluacion_general: 0,
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

const updateFormData = (payload) => {
  Object.assign(formData, payload);
};

const nextStep = () => { if (currentStep.value < steps.value.length - 1) currentStep.value++; };
const prevStep = () => { if (currentStep.value > 0) currentStep.value--; };

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  if (formData.set_completo === null) errors.set_completo = 'Este campo es requerido.';
  if (formData.set_completo === false && formData.informe_faltante === null) errors.informe_faltante = 'Este campo es requerido.';
  const ratingKeys = ['rating_puntualidad', 'rating_condiciones', 'rating_asesoramiento', 'rating_evaluacion_general'];
  ratingKeys.forEach(key => { if (!formData[key] || formData[key] === 0) errors[key] = 'Debe seleccionar una puntuación.'; });
  if (!formData.consumo_realizado.trim()) errors.consumo_realizado = 'El consumo realizado es un campo requerido.';
  if (!formData.tipo_logistica) errors.tipo_logistica = 'Debe seleccionar una opción de logística.';
  if (!signatureBlob.value) errors.signature = 'La firma es requerida.';
  if (!formData.acepta_terminos) errors.acepta_terminos = 'Debe aceptar los términos para continuar.';
  
  if (Object.keys(errors).length > 0) {
    toast.error("Por favor, complete todos los campos requeridos.");
    return false;
  }
  return true;
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
    const { error: uploadError } = await supabase.storage.from('firmas').upload(filePath, signatureBlob.value, {
      contentType: 'image/webp'
    });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('firmas').getPublicUrl(filePath);

    const updates = { 
      ...formData, 
      url_firma: urlData.publicUrl, 
      estado: 'Enviado',
      fecha_envio: new Date().toISOString()
    };
    
    const { error: updateError } = await supabase.from('reportes').update(updates).eq('id', props.reporte.id);
    if (updateError) throw updateError;
    
    emit('submit-success');
  } catch (error) {
    console.error('Error al enviar la ficha:', error);
    toast.error(`Error al enviar el formulario: ${error.message}`);
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
  closeSignatureModal();
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

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const footerAction = ref(null);
const setFooterAction = (action) => {
  if (action) {
    footerAction.value = action;
  } else {
    if (currentStep.value < steps.value.length - 1) {
      footerAction.value = { text: 'Siguiente', action: nextStep, class: 'bg-blue-600 text-white hover:bg-blue-700' };
    } else {
      footerAction.value = { text: 'Enviar Ficha', action: handleSubmit, class: 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-slate-400' };
    }
  }
};
watchEffect(() => setFooterAction(null));

const InfoCard = defineComponent({
  // --- CORRECCIÓN: La prop 'icon' ahora puede ser un Objeto o una Función ---
  props: { label: String, value: String, icon: [Object, Function] },
  setup(props) {
    const iconComponent = props.icon ? h(props.icon, { class: 'h-5 w-5 text-slate-400 dark:text-slate-500 flex-shrink-0' }) : null;
    return () => h('div', { class: 'card-info flex items-start gap-3' }, [
      iconComponent,
      h('div', [
        h('span', { class: 'block text-xs text-slate-500 dark:text-slate-400' }, props.label),
        h('strong', { class: 'text-slate-800 text-base dark:text-slate-200' }, props.value)
      ])
    ]);
  }
});
</script>

<style>
.card-info { 
  @apply rounded-xl bg-white dark:bg-slate-800/50 ring-1 ring-slate-200/70 dark:ring-slate-700/60 px-4 py-3; 
}
.fade-slide-enter-active, .fade-slide-leave-active { 
  transition: all .2s ease; 
}
.fade-slide-enter-from { 
  opacity: 0; 
  transform: translateY(6px); 
}
.fade-slide-leave-to { 
  opacity: 0; 
  transform: translateY(-6px); 
}
.shadow-up {
  box-shadow: 0 -4px 6px -1px rgb(0 0 0 / 0.05), 0 -2px 4px -2px rgb(0 0 0 / 0.05);
}
.dark .shadow-up {
  box-shadow: 0 -4px 10px -1px rgb(0 0 0 / 0.2), 0 -2px 6px -2px rgb(0 0 0 / 0.2);
}
</style>