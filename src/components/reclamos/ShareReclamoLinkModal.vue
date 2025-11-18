<!-- src/components/reclamos/ShareReclamoLinkModal.vue -->
<template>
  <!-- 
    El componente raíz es una transición para que el modal aparezca y desaparezca suavemente.
  -->
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      
      <!-- Overlay: Fondo oscuro semi-transparente. Al hacer clic, se emite el evento 'close'. -->
      <div @click="$emit('close')" class="fixed inset-0 bg-black bg-opacity-70 transition-opacity"></div>
      
      <!-- Contenido del Modal -->
      <div class="relative z-10 w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl overflow-hidden">
        
        <!-- Cabecera -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Compartir Link de Reclamo
          </h3>
          <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Envíe este enlace a los médicos para que puedan registrar sus quejas o sugerencias.
          </p>
        </div>

        <!-- Cuerpo -->
        <div class="p-5 space-y-4">
          <!-- Campo de texto falso que muestra el link a copiar -->
          <div class="flex items-center space-x-2 rounded-md bg-slate-100 dark:bg-slate-700 p-2 border border-slate-200 dark:border-slate-600">
            <svg class="h-5 w-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
            <input 
              type="text"
              :value="fullLink"
              readonly
              class="w-full bg-transparent text-sm text-slate-700 dark:text-slate-300 outline-none border-none p-0"
            />
          </div>

          <!-- Botones de Acción -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button @click="copyLink" class="action-button bg-slate-600 hover:bg-slate-700 text-white">
              <svg v-if="!linkCopied" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>{{ linkCopied ? '¡Copiado!' : 'Copiar Link' }}</span>
            </button>
            <button @click="shareViaWhatsApp" class="action-button bg-green-500 hover:bg-green-600 text-white">
              <svg class="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M16.75 13.96c.25.13.43.2.5.28.08.08.13.2.13.33 0 .13-.03.25-.08.38-.05.13-.18.28-.38.45-.2.18-.48.38-.83.6-.35.23-.78.48-1.3.75-.5.25-1.08.5-1.73.78-.65.28-1.3.43-1.98.43h-.15c-.7 0-1.38-.13-2.03-.38-.65-.25-1.25-.6-1.8-.98-.55-.4-1.05-.85-1.5-1.38-.45-.5-1.05-1.1-1.8-1.82-.23-.23-.43-.48-.6-.7-.2-.23-.34-.4-.4-.5-.08-.1-.13-.2-.13-.3 0-.1.02-.2.08-.28.05-.08.13-.15.2-.2.08-.05.14-.08.2-.08.13 0 .25.03.38.08.12.05.22.1.3.18.1.1.18.2.25.33.08.13.14.28.2.45.05.18.08.35.08.53 0 .1-.02.2-.05.28-.03.08-.08.15-.13.2-.05.05-.1.08-.18.1-.08.03-.14.03-.2 0-.05 0-.1-.02-.13-.05-.03-.03-.08-.08-.1-.13-.05-.05-.08-.1-.1-.18-.03-.08-.05-.14-.05-.2 0-.2.03-.38.08-.53.05-.15.14-.3.28-.45.14-.15.3-.28.5-.38.2-.1.4-.15.6-.2.18-.03.35-.05.5-.05h.13c.18 0 .35.02.5.05.15.03.3.08.43.13.13.05.25.1.35.18.1.08.18.15.23.23.05.08.1.18.13.28.03.1.05.2.05.3v.1c-.02.18-.08.35-.18.53-.1.18-.22.34-.38.52-.15.18-.3.3-.48.38-.18.1-.35.15-.53.15-.1 0-.2-.02-.28-.05-.08-.03-.15-.08-.2-.13-.05-.05-.1-.1-.15-.18-.05-.08-.08-.15-.08-.23 0-.08.02-.15.05-.23.03-.08.08-.14.13-.2.05-.05.1-.1.18-.13.08-.03.15-.05.2-.05.08 0 .14.02.2.05.05.03.1.08.13.13.03.05.08.1.1.15.03.05.05.1.05.13 0 0 0 .02 0 .03-.03.08-.05.15-.08.23-.03.08-.08.15-.13.2-.05.05-.1.1-.18.13-.08.03-.15.05-.23.05-.13 0-.25-.02-.35-.05-.1-.03-.2-.08-.28-.13s-.14-.1-.2-.15c-.05-.05-.1-.1-.1-.15-.02-.05-.03-.1-.03-.15 0-.1.02-.2.05-.28.03-.08.1-.15.15-.23.05-.08.13-.14.2-.2.08-.05.15-.1.23-.13.08-.03.18-.05.28-.05.15 0 .3.02.43.05.13.03.25.08.38.13.12.05.23.1.33.15.1.05.2.1.28.15.08.05.14.1.2.15.05.05.1.1.13.13.03.03.05.05.05.08z"/></svg>
              <span>WhatsApp</span>
            </button>
          </div>
        </div>

        <!-- Pie -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <button @click="$emit('close')" class="w-full sm:w-auto px-4 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 ring-1 ring-slate-300 dark:ring-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useToast } from 'vue-toastification';

// --- DEFINICIÓN DE PROPS Y EMITS ---
defineProps({
  show: { type: Boolean, required: true }
});
defineEmits(['close']);

const toast = useToast();
const linkCopied = ref(false);

// --- LÓGICA DE LINKS ---
const fullLink = computed(() => `${window.location.origin}/reclamo`);
const whatsappLink = computed(() => {
  const message = encodeURIComponent(`Estimado/a, le compartimos el enlace para registrar cualquier reclamo o sugerencia:\n\n${fullLink.value}`);
  return `https://api.whatsapp.com/send?text=${message}`;
});

// --- ACCIONES DE LOS BOTONES ---
const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(fullLink.value);
    linkCopied.value = true;
    toast.success("¡Link copiado al portapapeles!");
    setTimeout(() => { linkCopied.value = false; }, 2000);
  } catch (err) {
    toast.error("No se pudo copiar el link.");
    console.error('Error al copiar:', err);
  }
};

const shareViaWhatsApp = () => {
  window.open(whatsappLink.value, '_blank');
};
</script>

<style scoped>
/* Estilos para la transición de fundido */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
/* Estilo común para los botones de acción */
.action-button {
  @apply w-full flex items-center justify-center px-4 py-2.5 rounded-md text-sm font-semibold transition-colors;
}
</style>