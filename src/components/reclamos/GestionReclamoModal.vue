<!-- src/components/reclamos/GestionReclamoModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Overlay -->
      <div @click="closeModal" class="fixed inset-0 bg-black bg-opacity-70 transition-opacity"></div>
      
      <!-- Contenido del Modal -->
      <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-h-[90vh]">
        
        <!-- Cabecera -->
        <div class="p-5 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Detalles del Reclamo #{{ formData?.id }}
          </h3>
        </div>

        <!-- Cuerpo del Modal -->
        <div v-if="formData" class="p-6 flex-grow overflow-y-auto space-y-6">
          
          <!-- Sección 1: Información reportada por el médico -->
          <section class="space-y-4">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Información del Médico</h4>
            <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700 space-y-3 text-sm">
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Médico:</span>
                <strong class="text-slate-800 dark:text-slate-200 text-right">{{ formData.nombre_medico }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Tipo:</span>
                <strong class="text-slate-800 dark:text-slate-200 text-right">{{ formData.tipo_reclamo }}</strong>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-500 dark:text-slate-400">Severidad:</span>
                <strong class="text-slate-800 dark:text-slate-200 text-right">{{ formData.severidad }}</strong>
              </div>
              <div>
                <span class="text-slate-500 dark:text-slate-400">Descripción:</span>
                <p class="mt-1 p-3 bg-white dark:bg-slate-700 rounded-md text-slate-700 dark:text-slate-300 border dark:border-slate-600 whitespace-pre-wrap">{{ formData.descripcion_reclamo }}</p>
              </div>
               <!-- Visualización de la firma si existe -->
               <div v-if="formData.url_firma" class="mt-2">
                <span class="text-slate-500 dark:text-slate-400 block mb-1">Firma:</span>
                <img :src="formData.url_firma" alt="Firma del médico" class="h-16 object-contain border rounded bg-white" />
              </div>
            </div>
          </section>

          <!-- Sección 2: Gestión Interna -->
          <section class="space-y-4">
            <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Gestión Interna</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="estado" class="form-label">Estado del Reclamo</label>
                <select id="estado" v-model="formData.estado" class="form-input mt-1">
                  <option v-for="s in estadosQueja" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
              <div>
                <label for="responsable" class="form-label">Responsable Interno</label>
                <input type="text" id="responsable" v-model="formData.responsable_interno" class="form-input mt-1" placeholder="Nombre del responsable..." />
              </div>
            </div>
            <div>
              <label for="resultado" class="form-label">Resultado / Resolución</label>
              <textarea id="resultado" v-model="formData.resultado" rows="3" class="form-input mt-1" placeholder="Describa la resolución..."></textarea>
            </div>
            <div>
              <label for="observacion" class="form-label">Observación Interna</label>
              <textarea id="observacion" v-model="formData.observacion_interna" rows="3" class="form-input mt-1" placeholder="Notas internas..."></textarea>
            </div>
          </section>

        </div>

        <!-- Pie del Modal -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex justify-end items-center space-x-3 flex-shrink-0">
          <button @click="closeModal" class="px-4 py-2 rounded-md text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 ring-1 ring-slate-300 dark:ring-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600">
            Cancelar
          </button>
          <button @click="handleSave" :disabled="isSaving" class="px-4 py-2 rounded-md text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
            <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span>{{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  queja: { type: Object, default: null },
  isSaving: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'save']);

const formData = ref(null);
const estadosQueja = ['Abierta', 'En Proceso', 'Resuelta', 'Cerrada'];

watch(() => props.queja, (newQueja) => {
  if (newQueja) {
    formData.value = JSON.parse(JSON.stringify(newQueja));
  } else {
    formData.value = null;
  }
}, { immediate: true });

const closeModal = () => {
  emit('close');
};

const handleSave = () => {
  if (formData.value) {
    emit('save', formData.value);
  }
};
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
.form-label {
  @apply block text-sm font-medium text-slate-700 dark:text-slate-300;
}
.form-input {
  @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white dark:placeholder-slate-400;
}
textarea.form-input {
  @apply h-auto;
}
</style>