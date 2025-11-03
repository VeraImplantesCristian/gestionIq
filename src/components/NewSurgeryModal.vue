<!-- src/components/NewSurgeryModal.vue (COMPLETO Y MEJORADO) -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60" @click.self="close">
      
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 transform transition-all dark:bg-slate-800">
        <form @submit.prevent="handleSubmit">
          <!-- Encabezado -->
          <div class="p-6 border-b dark:border-slate-700">
            <h2 class="text-2xl font-bold text-gray-800 dark:text-slate-100">Nueva Cirugía / Asignar</h2>
          </div>

          <!-- Cuerpo del Formulario -->
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
            <!-- CAMBIO 1: Se añade el nuevo campo al formulario -->
            <div>
              <label for="tipo_cirugia" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Tipo de Cirugía</label>
              <input type="text" id="tipo_cirugia" v-model="form.tipo_cirugia" placeholder="Ej: Artroplastia de Rodilla" class="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
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
import { ref, reactive, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
});

const emit = defineEmits(['close', 'surgery-created']);
const toast = useToast();

const isSubmitting = ref(false);
const form = reactive({
  paciente: '',
  medico: '',
  fecha_cirugia: '',
  lugar_cirugia: '',
  // CAMBIO 2: Se añade la nueva propiedad al estado del formulario
  tipo_cirugia: '', 
  estado: 'Pendiente',
});

const resetForm = () => {
  form.paciente = '';
  form.medico = '';
  form.fecha_cirugia = '';
  form.lugar_cirugia = '';
  // CAMBIO 3: Se resetea el nuevo campo
  form.tipo_cirugia = '';
};

const handleSubmit = async () => {
  isSubmitting.value = true;
  try {
    const { data, error } = await supabase
      .from('reportes')
      .insert([form])
      .select()
      .single(); // Usamos .single() para obtener un objeto en lugar de un array

    if (error) throw error;

    if (data) {
      emit('surgery-created', data);
    }
    close();
  } catch (error) {
    toast.error(`Error al crear la cirugía: ${error.message}`);
  } finally {
    isSubmitting.value = false;
  }
};

const close = () => {
  emit('close');
};

// Reseteamos el formulario solo cuando el modal se cierra, no cuando se abre.
watch(() => props.show, (newValue) => {
  if (!newValue) {
    setTimeout(resetForm, 300); // Pequeño delay para que no se vea el reseteo durante la animación de cierre
  }
});

</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>