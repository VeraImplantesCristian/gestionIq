<!-- src/components/EditInstrumentadorModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div @click.self="$emit('close')" class="w-full max-w-3xl p-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Editar Instrumentador</h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">&times;</button>
          </div>

          <form v-if="formData" @submit.prevent="handleSubmit" id="edit-instrumentador-form" class="flex-grow overflow-y-auto">
            <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              
              <div class="space-y-4 md:col-span-2">
                <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2">Datos Personales</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div class="md:col-span-2">
                    <label for="nombre_completo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Nombre Completo</label>
                    <input v-model="formData.nombre_completo" type="text" id="nombre_completo" required class="mt-1 block w-full rounded-md" />
                  </div>
                  <div>
                    <label for="dni" class="block text-sm font-medium text-gray-700 dark:text-slate-300">DNI (No editable)</label>
                    <input :value="formData.dni" type="text" id="dni" disabled class="mt-1 block w-full rounded-md bg-gray-100 dark:bg-slate-900" />
                  </div>
                  <div>
                    <label for="cuil" class="block text-sm font-medium text-gray-700 dark:text-slate-300">CUIT / CUIL</label>
                    <input v-model="formData.cuil" type="text" id="cuil" class="mt-1 block w-full rounded-md" />
                  </div>
                  <div>
                    <label for="telefono" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Teléfono</label>
                    <input v-model="formData.telefono" type="tel" id="telefono" class="mt-1 block w-full rounded-md" />
                  </div>
                  <div>
                    <label for="lugar_trabajo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Lugar de Trabajo</label>
                    <input v-model="formData.lugar_trabajo" type="text" id="lugar_trabajo" class="mt-1 block w-full rounded-md" />
                  </div>
                </div>
              </div>

              <div class="space-y-4 md:col-span-2">
                <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2">Datos Bancarios</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label for="banco" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Banco</label>
                    <input v-model="formData.banco" type="text" id="banco" class="mt-1 block w-full rounded-md" />
                  </div>
                  <div>
                    <label for="cbu" class="block text-sm font-medium text-gray-700 dark:text-slate-300">CBU</label>
                    <input v-model="formData.cbu" type="text" id="cbu" class="mt-1 block w-full rounded-md" />
                  </div>
                  <div class="md:col-span-2">
                    <label for="alias_bancario" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Alias Bancario</label>
                    <input v-model="formData.alias_bancario" type="text" id="alias_bancario" class="mt-1 block w-full rounded-md" />
                  </div>
                </div>
              </div>

              <div class="md:col-span-2">
                <h3 class="text-lg font-medium text-gray-900 dark:text-slate-100 border-b dark:border-slate-700 pb-2">Programa IQ</h3>
                <div class="mt-4">
                  <label for="puntos_manuales" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Puntos Manuales</label>
                  <input v-model.number="formData.puntos_manuales" type="number" id="puntos_manuales" class="mt-1 block w-full md:w-1/2 rounded-md" />
                </div>
              </div>

            </div>
          </form>
          
          <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-4 shrink-0">
            <button type="button" @click="$emit('close')" class="px-4 py-2 rounded-md text-sm font-medium">Cancelar</button>
            <button @click="handleSubmit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium">
              {{ isSubmitting ? 'Guardando...' : 'Guardar Cambios' }}
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

const props = defineProps({ show: Boolean, instrumentador: Object });
const emit = defineEmits(['close', 'updated']);

const toast = useToast();
const isSubmitting = ref(false);
const formData = ref(null);

watch(() => props.instrumentador, (newInstrumentador) => {
  if (newInstrumentador) {
    formData.value = { ...newInstrumentador };
  } else {
    formData.value = null;
  }
}, { immediate: true, deep: true });

const handleSubmit = async () => {
  if (!formData.value) return;
  isSubmitting.value = true;
  try {
    const updateData = {
      nombre_completo: formData.value.nombre_completo,
      alias: formData.value.alias,
      telefono: formData.value.telefono,
      lugar_trabajo: formData.value.lugar_trabajo,
      cuil: formData.value.cuil,
      puntos_manuales: formData.value.puntos_manuales,
      cbu: formData.value.cbu,
      alias_bancario: formData.value.alias_bancario,
      banco: formData.value.banco
    };

    const { error } = await supabase
      .from('instrumentadores')
      .update(updateData)
      .eq('dni', formData.value.dni);
    
    if (error) throw error;

    toast.success('Instrumentador actualizado con éxito.');
    emit('updated');
    emit('close');

  } catch (err) {
    toast.error('Error al actualizar el instrumentador: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
input, select {
  @apply border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white;
}
button {
  @apply bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500;
}
button.bg-blue-600 {
  @apply text-white border-transparent;
}
</style>