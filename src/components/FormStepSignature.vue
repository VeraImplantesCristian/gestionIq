<!-- src/components/FormStepSignature.vue (Versión Final y Simplificada) -->
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
        
        <div class="absolute top-2 right-2 flex gap-2">
          <!-- VOLVEMOS AL EMIT DIRECTO EN EL TEMPLATE -->
          <button type="button" @click="$emit('open-signature-modal')" 
                  class="action-button" title="Cambiar firma">
            <PencilIcon class="h-5 w-5" />
          </button>
          <button type="button" @click="$emit('clear-signature')" 
                  class="action-button" title="Limpiar firma">
            <TrashIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <!-- Placeholder para la Firma -->
      <div v-else 
           @click="$emit('open-signature-modal')"
           :class="[
            'h-48 w-full border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-4 cursor-pointer transition-colors',
            errors.signature 
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
              : 'border-slate-300 hover:border-blue-500 hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800/50'
           ]">
        <div class="w-16 h-16 grid place-content-center bg-slate-100 dark:bg-slate-700/50 rounded-full mb-2">
          <PencilSquareIcon 
            :class="['w-8 h-8', errors.signature ? 'text-red-500' : 'text-slate-400 dark:text-slate-500']" />
        </div>
        <p class="font-semibold text-slate-700 dark:text-slate-300">Abrir panel de firma</p>
        <p class="text-sm text-slate-500 dark:text-slate-400">Haga clic aquí para firmar</p>
      </div>
      <p v-if="errors.signature" class="text-sm text-red-500 mt-1">{{ errors.signature }}</p>
    </div>
    
    <!-- Aceptación de Términos -->
    <div class="space-y-4 pt-6 border-t border-slate-200/70 dark:border-slate-700/60">
      <label for="acepta_terminos" class="flex items-start gap-3 cursor-pointer">
        <input 
          type="checkbox" 
          id="acepta_terminos"
          :checked="formData.acepta_terminos"
          @change="$emit('update:formData', { acepta_terminos: $event.target.checked })"
          class="h-6 w-6 text-blue-600 rounded mt-0.5 border-slate-300 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 shrink-0"
        >
        <span class="text-slate-700 dark:text-slate-300">
          He leído y acepto los 
          <a :href="termsUrl" target="_blank" rel="noopener noreferrer" @click.stop
             class="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
            Términos y Condiciones
          </a> 
          sobre la devolución del material. <span class="text-red-500">*</span>
        </span>
      </label>
      <p v-if="errors.acepta_terminos" class="text-sm text-red-500 ml-9">{{ errors.acepta_terminos }}</p>
    </div>
  </div>
</template>

<script setup>
import { PencilIcon, PencilSquareIcon, TrashIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  formData: Object,
  errors: Object,
  signaturePreviewUrl: String,
});

// La declaración de emits sigue siendo una buena práctica, así que la mantenemos.
const emit = defineEmits(['update:formData', 'open-signature-modal', 'clear-signature']);

const termsUrl = "https://ugznvonyvtjfqskhubbi.supabase.co/storage/v1/object/public/documentos/Terminos%20y%20condiciones.pdf";
</script>

<style scoped>
.action-button {
  @apply p-2 bg-white/70 backdrop-blur-sm rounded-full text-slate-600 hover:text-blue-600 shadow-sm dark:bg-slate-700/70 dark:text-slate-300 dark:hover:text-blue-400;
}
</style>