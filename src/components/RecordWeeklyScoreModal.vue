<!-- src/components/RecordWeeklyScoreModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div @click.self="$emit('close')" class="w-full max-w-md p-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Valorar a <span class="text-indigo-600 dark:text-indigo-400">{{ instrumentador?.nombre_completo }}</span>
            </h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <svg class="w-6 h-6 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="p-6 space-y-4">
              <div>
                <label for="puntaje" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Puntaje General (1-10)</label>
                <input 
                  v-model.number="formData.puntaje" 
                  type="number" 
                  id="puntaje" 
                  required
                  min="1"
                  max="10"
                  placeholder="Ej: 9"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                />
              </div>
              <div>
                <label for="notas" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Notas (Opcional)</label>
                <textarea 
                  v-model="formData.notas"
                  id="notas"
                  rows="3"
                  placeholder="Ej: Entregó todo en tiempo y forma."
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                ></textarea>
              </div>
               <div>
                <label for="responsable" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Tu Nombre (Responsable)</label>
                <input 
                  v-model="formData.responsable" 
                  type="text" 
                  id="responsable" 
                  required
                  placeholder="Ej: Franco (Depósito)"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                />
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-4">
              <button type="button" @click="$emit('close')" class="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-500">
                Cancelar
              </button>
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait">
                {{ isSubmitting ? 'Guardando...' : 'Guardar Valoración' }}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
  instrumentador: {
    type: Object,
    default: null
  }
});
const emit = defineEmits(['close', 'created']);

const toast = useToast();
const isSubmitting = ref(false);

const initialFormData = {
  puntaje: null,
  notas: '',
  responsable: ''
};
const formData = ref({ ...initialFormData });

const handleSubmit = async () => {
  if (!props.instrumentador) return;
  
  const puntaje = formData.value.puntaje;
  if (!puntaje || puntaje < 1 || puntaje > 10) {
    toast.error('El puntaje debe ser un número entre 1 y 10.');
    return;
  }
  if (!formData.value.responsable) {
    toast.error('Debes ingresar tu nombre como responsable.');
    return;
  }

  isSubmitting.value = true;
  try {
    const { error } = await supabase
      .from('valoraciones_semanales')
      .insert([{ 
        instrumentador_dni: props.instrumentador.dni,
        puntaje: formData.value.puntaje,
        notas: formData.value.notas,
        responsable: formData.value.responsable
      }]);
    
    if (error) throw error;

    toast.success(`Valoración guardada para ${props.instrumentador.nombre_completo}.`);
    emit('created');
    emit('close');

  } catch (err) {
    toast.error('Error al guardar la valoración: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    formData.value = { ...initialFormData };
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>