<!-- src/components/EditInstrumentadorModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
      <div ref="modalContent" class="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-4">Editar Instrumentador</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label for="dni" class="block text-sm font-medium text-gray-700 dark:text-slate-300">DNI (No editable)</label>
              <!-- El DNI es la clave primaria, por lo que no permitimos su edición para mantener la integridad de los datos. -->
              <input type="text" id="dni" :value="editableInstrumentador.dni" disabled class="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm text-gray-500 dark:text-slate-400">
            </div>
            <div>
              <label for="nombre_completo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Nombre Completo</label>
              <input type="text" id="nombre_completo" v-model="editableInstrumentador.nombre_completo" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <p v-if="error" class="text-red-500 dark:text-red-400 text-sm mt-1">{{ error }}</p>
            </div>
          </div>
          
          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button type="submit" :disabled="isSaving" class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center">
              <svg v-if="isSaving" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
              {{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  show: Boolean,
  instrumentador: Object
});
const emit = defineEmits(['close', 'instrumentador-updated']);

const toast = useToast();
const editableInstrumentador = ref({});
const isSaving = ref(false);
const error = ref(null);
const modalContent = ref(null);

// Usamos watch para crear una copia local editable del instrumentador cuando el modal se abre.
// Esto evita la mutación directa de la prop, una buena práctica en Vue.
watch(() => props.instrumentador, (newVal) => {
  if (newVal) {
    editableInstrumentador.value = { ...newVal };
  }
});

// Cierra el modal si se hace clic fuera de su contenido
onClickOutside(modalContent, () => emit('close'));

const handleSubmit = async () => {
  if (!editableInstrumentador.value.nombre_completo?.trim()) {
    error.value = "El nombre no puede estar vacío.";
    return;
  }
  isSaving.value = true;
  error.value = null;

  try {
    const { error: updateError } = await supabase
      .from('instrumentadores')
      .update({ nombre_completo: editableInstrumentador.value.nombre_completo.trim() })
      .eq('dni', props.instrumentador.dni);

    if (updateError) throw updateError;

    toast.success("Instrumentador actualizado con éxito.");
    emit('instrumentador-updated'); // Emitimos el evento para que la vista principal refresque los datos
    emit('close'); // Cerramos el modal

  } catch (err) {
    error.value = `Error al actualizar: ${err.message}`;
    toast.error(error.value);
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>