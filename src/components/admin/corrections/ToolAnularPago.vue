<!-- src/components/admin/corrections/ToolAnularPago.vue -->
<template>
  <div class="tool-container border-red-500/50">
    <header class="tool-header">
      <h4 class="tool-title text-red-800 dark:text-red-300">Anular Orden de Pago</h4>
      <p class="tool-description">
        Esta acción marcará la orden como 'Anulada' y devolverá todas las cirugías asociadas al estado 'Pendiente de Pago'. Esta acción es irreversible.
      </p>
    </header>

    <div class="tool-body">
      <!-- Estado inicial: Botón para iniciar la anulación -->
      <div v-if="!confirming" class="flex justify-center">
        <button @click="confirming = true" class="btn-danger">
          Anular Orden de Pago
        </button>
      </div>

      <!-- Estado de confirmación: pide al usuario que confirme la acción -->
      <div v-else class="confirmation-box">
        <p class="text-center font-semibold mb-4">¿Estás seguro de que querés anular esta orden?</p>
        <div class="flex justify-center gap-4">
          <button @click="confirming = false" class="btn-secondary">
            Cancelar
          </button>
          <button @click="handleAnular" :disabled="isSubmitting" class="btn-danger">
            <span v-if="isSubmitting">Anulando...</span>
            <span v-else>Sí, anular orden</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { supabase } from '../../../services/supabase';
import { useToasts } from '../../../composables/useToasts';

// Recibe el ID de la orden desde el componente padre (CorrectionWorkspace).
const props = defineProps({
  orderId: {
    type: [Number, String],
    required: true
  }
});

// Emite un evento para notificar al padre cuando la acción se completa.
const emit = defineEmits(['action-completed']);

const { showSuccessToast, showErrorToast } = useToasts();
const isSubmitting = ref(false);
const confirming = ref(false); // Estado para manejar el paso de confirmación.

const handleAnular = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    // Llama a la nueva función RPC que creamos en el backend.
    const { data, error } = await supabase.rpc('anular_orden_de_pago', {
      p_orden_id: props.orderId
    });

    if (error) throw error;

    // Muestra el mensaje de éxito que devuelve la RPC.
    showSuccessToast(data);
    
    // Notifica al componente padre que la acción terminó.
    emit('action-completed');

  } catch (err) {
    // Muestra un error si la RPC falla.
    showErrorToast(err, 'Error al anular la orden de pago.');
  } finally {
    isSubmitting.value = false;
    confirming.value = false; // Resetea el estado de confirmación.
  }
};
</script>

<style scoped>
.tool-container { @apply bg-white dark:bg-slate-800 rounded-xl shadow; }
.tool-header { @apply p-4 border-b border-slate-200 dark:border-slate-700; }
.tool-title { @apply font-semibold; }
.tool-description { @apply text-sm text-slate-500 dark:text-slate-400; }
.tool-body { @apply p-6; }

.btn-danger { @apply bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-red-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500; }

.confirmation-box { @apply bg-red-50 dark:bg-red-900/20 p-4 rounded-lg; }
</style>