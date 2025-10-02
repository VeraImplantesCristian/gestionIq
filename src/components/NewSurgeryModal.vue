<!-- src/components/NewSurgeryModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="close">
      
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all dark:bg-slate-800">
        <form @submit.prevent="handleSubmit">
          <!-- Encabezado -->
          <div class="p-6 border-b dark:border-slate-700">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100">Nueva Cirugía / Asignar</h2>
          </div>

          <!-- Cuerpo del Formulario (simplificado) -->
          <div class="p-6 space-y-4">
            <div>
              <label for="paciente" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Paciente</label>
              <input type="text" id="paciente" v-model="form.paciente" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            </div>
            <div>
              <label for="medico" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Médico</label>
              <input type="text" id="medico" v-model="form.medico" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            </div>
            <div>
              <label for="fecha_cirugia" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Fecha de Cirugía</label>
              <input type="date" id="fecha_cirugia" v-model="form.fecha_cirugia" required class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            </div>
            <div>
              <label for="lugar_cirugia" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Lugar de Cirugía (Institución)</label>
              <input type="text" id="lugar_cirugia" v-model="form.lugar_cirugia" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
            </div>
          </div>

          <!-- Pie de página con Acciones -->
          <div class="px-6 py-4 bg-gray-50 flex justify-end space-x-4 dark:bg-slate-900/50">
            <button type="button" @click="close" class="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-md hover:bg-gray-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button type="submit" :disabled="isSubmitting" class="bg-blue-600 text-white font-bold px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400">
              {{ isSubmitting ? 'Guardando...' : 'Guardar y Crear' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { supabase } from '../services/supabase.js';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'surgery-created']);

const isSubmitting = ref(false);
const form = reactive({
  // **MODIFICADO:** id_cirugia eliminado del formulario
  paciente: '',
  medico: '',
  fecha_cirugia: '',
  lugar_cirugia: '',
  estado: 'Pendiente',
});

const resetForm = () => {
  form.paciente = '';
  form.medico = '';
  form.fecha_cirugia = '';
  form.lugar_cirugia = '';
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    // La base de datos asignará el id_cirugia automáticamente
    const { data, error } = await supabase
      .from('reportes')
      .insert([form])
      .select();

    if (error) throw error;

    if (data) {
      emit('surgery-created', data[0]);
    }
    close();
  } catch (error) {
    // El manejo de errores de ID duplicado ya no es necesario aquí
    alert(`Error al crear la cirugía: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  resetForm();
  emit('close');
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