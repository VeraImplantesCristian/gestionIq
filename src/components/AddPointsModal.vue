<!-- src/components/AddPointsModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div @click.self="$emit('close')" class="w-full max-w-md p-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">
              Sumar Puntos a <span class="text-indigo-600 dark:text-indigo-400">{{ instrumentador?.nombre_completo }}</span>
            </h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <svg class="w-6 h-6 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="p-6 space-y-4">
              <div>
                <label for="puntos" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Puntos a Sumar</label>
                <input 
                  v-model.number="pointsToAdd" 
                  type="number" 
                  id="puntos" 
                  required
                  placeholder="Ej: 10"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" 
                />
                <p class="mt-2 text-sm text-gray-500 dark:text-slate-400">
                  Puntos actuales: {{ instrumentador?.puntos_manuales }}. Total después de sumar: {{ (instrumentador?.puntos_manuales || 0) + (pointsToAdd || 0) }}
                </p>
              </div>
            </div>

            <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-4">
              <button type="button" @click="$emit('close')" class="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-500">
                Cancelar
              </button>
              <button type="submit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait">
                {{ isSubmitting ? 'Guardando...' : 'Guardar Puntos' }}
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
const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const isSubmitting = ref(false);
const pointsToAdd = ref(null);

const handleSubmit = async () => {
  if (!props.instrumentador || !pointsToAdd.value || pointsToAdd.value <= 0) {
    toast.error('Por favor, ingrese un número de puntos válido.');
    return;
  }

  isSubmitting.value = true;
  try {
    // 1. Calculamos el nuevo total de puntos manuales.
    const newTotalPoints = (props.instrumentador.puntos_manuales || 0) + pointsToAdd.value;

    // --- CORRECCIÓN ---
    // 2. Usamos la variable 'newTotalPoints' en la llamada a Supabase.
    const { error } = await supabase
      .from('instrumentadores')
      .update({ puntos_manuales: newTotalPoints }) // <--- Aquí estaba el error
      .eq('dni', props.instrumentador.dni);
    
    if (error) throw error;

    toast.success(`Se sumaron ${pointsToAdd.value} puntos a ${props.instrumentador.nombre_completo}.`);
    emit('updated');
    emit('close');

  } catch (err) {
    toast.error('Error al sumar los puntos: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    pointsToAdd.value = null;
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>