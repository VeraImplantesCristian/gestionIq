<!-- src/components/FormStepSignature.vue -->
<template>
  <div class="space-y-8">
    <div>
      <h2 class="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Firma y Confirmación</h2>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Por favor, provea su firma y acepte los términos para finalizar.</p>
    </div>

    <!-- Panel de Firma -->
    <div class="space-y-4">
      <label class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">
        Firma Digital <span class="text-red-500">*</span>
      </label>
      
      <!-- Vista Previa de la Firma -->
      <div v-if="signaturePreviewUrl" 
           class="relative p-2 border border-slate-300 rounded-xl shadow-inner bg-slate-50 dark:bg-slate-900/50 dark:border-slate-700">
        <img :src="signaturePreviewUrl" alt="Firma guardada" class="h-40 w-full object-contain">
        <button type="button" @click="openSignatureModal" 
                class="absolute top-2 right-2 p-2 bg-white/70 backdrop-blur-sm rounded-full text-slate-600 hover:text-blue-600 shadow-sm dark:bg-slate-700/70 dark:text-slate-300 dark:hover:text-blue-400">
          <PencilIcon class="h-5 w-5" />
        </button>
      </div>
      
      <!-- Placeholder para la Firma -->
      <div v-else 
           @click="openSignatureModal"
           class="h-48 w-full border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer hover:border-blue-500 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800/50">
        <div class="w-16 h-16 grid place-content-center bg-slate-100 dark:bg-slate-700/50 rounded-full mb-2">
          <PencilSquareIcon class="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <p class="font-semibold text-slate-700 dark:text-slate-300">Abrir panel de firma</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">Haga clic aquí para firmar</p>
      </div>
      <p v-if="errors.signature" class="text-sm text-red-500 mt-1">{{ errors.signature }}</p>
    </div>
    
    <!-- Aceptación de Términos -->
    <div class="space-y-4 pt-6 border-t border-slate-200/70 dark:border-slate-700/60">
      <div class="flex items-start gap-3">
        <input 
          type="checkbox" 
          id="acepta_terminos"
          :checked="formData.acepta_terminos"
          @change="updateFormData({ acepta_terminos: $event.target.checked })"
          class="h-6 w-6 text-blue-600 rounded mt-0.5 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 shrink-0"
        >
        <label for="acepta_terminos" class="text-slate-700 dark:text-slate-300">
          He leído y acepto los 
          <a :href="termsUrl" target="_blank" class="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Términos y Condiciones
          </a> 
          sobre la devolución del material. <span class="text-red-500">*</span>
        </label>
      </div>
      <p v-if="errors.acepta_terminos" class="text-sm text-red-500 ml-9">{{ errors.acepta_terminos }}</p>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import { PencilIcon, PencilSquareIcon } from '@heroicons/vue/24/solid';

const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
  signaturePreviewUrl: String 
});

const emit = defineEmits(['update:form-data', 'open-signature-modal', 'set-footer-action']);

const updateFormData = (payload) => {
  emit('update:form-data', payload);
};

const openSignatureModal = () => {
  emit('open-signature-modal');
};

const termsUrl = "https://ugznvonyvtjfqskhubbi.supabase.co/storage/v1/object/public/documentos/Terminos%20y%20condiciones.pdf";

// --- LÓGICA DEL BOTÓN STICKY ---
// Al montarse, le decimos al padre (FichaForm) que el botón principal de este paso
// debe ser el de "Abrir Panel de Firma".
onMounted(() => {
  emit('set-footer-action', {
    text: 'Abrir Panel de Firma',
    action: openSignatureModal,
    class: 'bg-blue-600 text-white font-semibold hover:bg-blue-700',
    // Ocultamos el botón del footer si ya hay una firma.
    hidden: !!props.signaturePreviewUrl 
  });
});

// Al desmontarse (cambiar de paso), limpiamos la acción del footer.
onUnmounted(() => {
  emit('set-footer-action', null);
});
</script>