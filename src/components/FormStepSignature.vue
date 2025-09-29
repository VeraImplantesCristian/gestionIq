<!-- src/components/FormStepSignature.vue -->
<template>
  <div class="space-y-10">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Paso 3: Firma y Confirmación</h2>
    
    <div class="space-y-4">
      <h3 class="text-xl font-semibold text-slate-700 dark:text-slate-200">Firma Digital</h3>
      
      <div v-if="signaturePreviewUrl" class="p-2 border border-slate-300 rounded-lg shadow-inner bg-slate-50 relative dark:bg-slate-700 dark:border-slate-600">
        <img :src="signaturePreviewUrl" alt="Firma guardada" class="h-40 w-full object-contain">
        <button type-="button" @click="$emit('clear-signature')" class="absolute top-2 right-2 p-1.5 bg-white rounded-full text-slate-500 hover:text-red-600 hover:bg-red-50 shadow-sm dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-red-500/20 dark:hover:text-red-400">
          <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
      
      <div v-else class="h-48 w-full bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-center p-4 dark:bg-slate-900/50 dark:border-slate-600">
        <svg class="w-16 h-16 text-slate-400 dark:text-slate-500" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 36.8837L22.1429 28L28.5714 34L35 28L42.8571 34L50 28" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="signature-path"/>
          <path d="M54 20L42 20M42 20L38 16M42 20L38 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="hand-path"/>
        </svg>
        <p class="text-slate-500 mt-2 dark:text-slate-400">Haz clic en el botón de abajo para abrir el panel de firma.</p>
      </div>
      
      <button type="button" @click="$emit('open-signature-modal')" class="w-full sm:w-auto bg-slate-100 text-slate-800 font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-200 flex items-center justify-center space-x-2 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600">
        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
        <span>{{ signaturePreviewUrl ? 'Editar Firma' : 'Abrir Panel de Firma' }}</span>
      </button>
      <p v-if="errors.signature" class="text-red-500 text-sm mt-1">{{ errors.signature }}</p>
    </div>
    
    <div class="space-y-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3 dark:bg-yellow-500/10 dark:border-yellow-500/20">
      <svg class="h-6 w-6 text-yellow-500 flex-shrink-0 mt-0.5 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
      <div>
        <h3 class="text-xl font-semibold text-slate-800 dark:text-yellow-200">Confirmación Final</h3>
        <label class="flex items-start text-lg mt-2">
          <input type="checkbox" v-model="model.acepta_terminos" class="h-6 w-6 text-blue-600 rounded mt-1 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600">
          <span class="ml-3 text-slate-700 dark:text-slate-300">
            He leído y acepto los 
            <!-- **CORREGIDO:** Enlace al PDF con la URL correcta -->
            <a :href="termsUrl" target="_blank" class="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">Términos y Condiciones</a> 
            sobre la devolución del material.
          </span>
        </label>
        <p v-if="errors.acepta_terminos" class="text-red-500 text-sm ml-9">{{ errors.acepta_terminos }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Object,
  errors: Object,
  signaturePreviewUrl: String 
});

const emit = defineEmits(['update:modelValue', 'open-signature-modal', 'clear-signature']);

const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

// **CORREGIDO:** Usamos la URL estática proporcionada
const termsUrl = "https://ugznvonyvtjfqskhubbi.supabase.co/storage/v1/object/public/documentos/Terminos%20y%20condiciones.pdf";

</script>

<style scoped>
.signature-path {
  stroke-dasharray: 50;
  stroke-dashoffset: 50;
  animation: draw 2s ease-in-out forwards;
}
.hand-path {
  opacity: 0;
  animation: slide-in 2s ease-in-out forwards;
}
@keyframes draw {
  to {
    stroke-dashoffset: 0;
  }
}
@keyframes slide-in {
  0% {
    transform: translateX(20px);
    opacity: 0;
  }
  40% {
    transform: translateX(0);
    opacity: 1;
  }
  60% {
    opacity: 1;
  }
  100% {
    transform: translateX(30px);
    opacity: 0;
  }
}
</style>