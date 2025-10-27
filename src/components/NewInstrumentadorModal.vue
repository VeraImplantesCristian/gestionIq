<!-- src/components/NewInstrumentadorModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div @click.self="$emit('close')" class="w-full max-w-2xl p-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Nuevo Instrumentador</h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <svg class="w-6 h-6 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="flex-grow overflow-y-auto">
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div class="space-y-4">
                <div>
                  <label for="new-nombre_completo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Nombre Completo</label>
                  <input v-model="formData.nombre_completo" type="text" id="new-nombre_completo" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label for="new-dni" class="block text-sm font-medium text-gray-700 dark:text-slate-300">DNI</label>
                  <input v-model="formData.dni" type="text" id="new-dni" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label for="new-cuil" class="block text-sm font-medium text-gray-700 dark:text-slate-300">CUIL</label>
                  <input v-model="formData.cuil" type="text" id="new-cuil" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
              </div>

              <div class="space-y-4">
                <div>
                  <label for="new-alias" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Alias</label>
                  <input v-model="formData.alias" type="text" id="new-alias" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label for="new-telefono" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Teléfono</label>
                  <input v-model="formData.telefono" type="tel" id="new-telefono" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
                <div>
                  <label for="new-lugar_trabajo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Lugar de Trabajo</label>
                  <input v-model="formData.lugar_trabajo" type="text" id="new-lugar_trabajo" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                </div>
              </div>

              <div class="md:col-span-2">
                <label for="new-puntos_manuales" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Puntos Manuales (Inicial)</label>
                <input v-model.number="formData.puntos_manuales" type="number" id="new-puntos_manuales" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

            </div>
          </form>
          
          <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-4 shrink-0">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button @click="handleSubmit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait">
              {{ isSubmitting ? 'Creando...' : 'Crear Instrumentador' }}
            </button>
          </div>

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
});
const emit = defineEmits(['close', 'created']);

const toast = useToast();
const isSubmitting = ref(false);

const initialFormData = {
  nombre_completo: '',
  dni: '',
  cuil: '',
  alias: '',
  telefono: '',
  lugar_trabajo: '',
  puntos_manuales: 0,
};
const formData = ref({ ...initialFormData });

const handleSubmit = async () => {
  if (!formData.value.nombre_completo || !formData.value.dni) {
    toast.error('El Nombre Completo y el DNI son obligatorios.');
    return;
  }

  isSubmitting.value = true;
  try {
    const { error } = await supabase
      .from('instrumentadores')
      .insert([formData.value]);
    
    if (error) {
      if (error.code === '23505') {
        throw new Error('El DNI ingresado ya existe.');
      }
      throw error;
    }

    toast.success('Instrumentador creado con éxito.');
    emit('created');
    emit('close');

  } catch (err) {
    toast.error('Error al crear el instrumentador: ' + err.message);
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