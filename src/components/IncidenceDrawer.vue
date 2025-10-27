<!-- src/components/IncidenceDrawer.vue -->
<template>
  <Transition name="slide-fade">
    <div v-if="show" class="fixed inset-0 z-40">
      <div @click="$emit('close')" class="absolute inset-0 bg-black/50"></div>

      <div class="relative bg-white dark:bg-slate-800 w-full max-w-md h-full ml-auto flex flex-col">
        <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
          <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Detalles de la Incidencia</h2>
          <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
            <svg class="w-6 h-6 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div v-if="incidencia" class="p-6 flex-grow overflow-y-auto">
          <div class="space-y-4">
            
            <div>
              <h3 class="font-semibold text-gray-800 dark:text-slate-200 mb-2">Información General</h3>
              <div class="grid grid-cols-3 gap-2 text-sm">
                <span class="text-gray-500 dark:text-slate-400">ID Incidencia:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ incidencia.id }}</span>

                <span class="text-gray-500 dark:text-slate-400">Fecha:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ new Date(incidencia.created_at).toLocaleString() }}</span>

                <span class="text-gray-500 dark:text-slate-400">Reportado por:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ incidencia.reportado_por || 'No especificado' }}</span>
                
                <span class="text-gray-500 dark:text-slate-400">Tipo:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ incidencia.tipo }}</span>

                <span class="text-gray-500 dark:text-slate-400">Estado:</span>
                <span class="col-span-2">
                   <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', {
                    'bg-yellow-100 text-yellow-800': incidencia.estado === 'Abierta',
                    'bg-green-100 text-green-800': incidencia.estado === 'Resuelta',
                  }]">{{ incidencia.estado }}</span>
                </span>
              </div>
            </div>

            <div>
              <h3 class="font-semibold text-gray-800 dark:text-slate-200 mb-2">Descripción</h3>
              <p class="text-sm text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md whitespace-pre-wrap">{{ incidencia.descripcion }}</p>
            </div>

            <div v-if="incidencia.reportes">
              <h3 class="font-semibold text-gray-800 dark:text-slate-200 mb-2">Cirugía Asociada</h3>
              <div class="grid grid-cols-3 gap-2 text-sm">
                <span class="text-gray-500 dark:text-slate-400">Paciente:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ incidencia.reportes.paciente }}</span>

                <span class="text-gray-500 dark:text-slate-400">Médico:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ incidencia.reportes.medico }}</span>
              </div>
            </div>

            <div v-if="incidencia.instrumentadores">
              <h3 class="font-semibold text-gray-800 dark:text-slate-200 mb-2">Instrumentador Asignado</h3>
              <div class="grid grid-cols-3 gap-2 text-sm">
                <span class="text-gray-500 dark:text-slate-400">Nombre:</span>
                <span class="col-span-2 text-gray-900 dark:text-slate-100">{{ incidencia.instrumentadores.nombre_completo }}</span>
              </div>
            </div>

          </div>
        </div>
        
        <div class="p-4 border-t border-gray-200 dark:border-slate-700 shrink-0">
          <div class="flex justify-end space-x-3">
            <!-- 
              === BOTÓN CON LÓGICA ===
              - Se muestra solo si la incidencia está 'Abierta'.
              - Llama a la función 'markAsResolved' al hacer clic.
              - Se deshabilita mientras se está procesando la solicitud.
            -->
            <button 
              v-if="incidencia && incidencia.estado === 'Abierta'"
              @click="markAsResolved"
              :disabled="isUpdating"
              class="px-4 py-2 bg-green-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-green-700 disabled:bg-green-400 disabled:cursor-wait"
            >
              {{ isUpdating ? 'Marcando...' : 'Marcar como Resuelta' }}
            </button>
            <button class="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700">
              Eliminar
            </button>
          </div>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
  incidencia: {
    type: Object,
    default: null
  }
});

// --- NUEVO EMIT ---
// Añadimos un nuevo evento para notificar al padre que la incidencia fue actualizada.
const emit = defineEmits(['close', 'updated']);

const toast = useToast();
// --- NUEVO ESTADO ---
const isUpdating = ref(false); // Para controlar el estado de carga del botón.

// --- NUEVA FUNCIÓN ---
const markAsResolved = async () => {
  if (!props.incidencia) return;

  isUpdating.value = true;
  try {
    // Hacemos la llamada a Supabase para actualizar la fila.
    // .update() define los nuevos valores.
    // .eq() especifica qué fila actualizar (la que tenga el ID correspondiente).
    const { error } = await supabase
      .from('incidencias')
      .update({ estado: 'Resuelta' })
      .eq('id', props.incidencia.id);
    
    if (error) throw error;

    toast.success('La incidencia ha sido marcada como resuelta.');
    // Notificamos al componente padre que hubo una actualización.
    emit('updated');
    // Cerramos el panel.
    emit('close');

  } catch (err) {
    toast.error('Error al actualizar la incidencia: ' + err.message);
  } finally {
    isUpdating.value = false;
  }
};
</script>

<style scoped>
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease-out;
}
.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>