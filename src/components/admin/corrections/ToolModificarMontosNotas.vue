<!-- src/components/admin/corrections/ToolModificarMontosNotas.vue -->
<template>
  <div class="tool-container">
    <header class="tool-header">
      <h4 class="tool-title">Modificar Montos y Notas</h4>
      <p class="tool-description">
        Ajusta los montos a pagar de cada cirugía y edita las notas generales de la orden.
      </p>
    </header>

    <div class="tool-body">
      <!-- Estado de Carga -->
      <div v-if="isLoading" class="text-center p-6">
        <p>Cargando detalles de la orden...</p>
      </div>

      <!-- Estado de Error -->
      <div v-else-if="error" class="bg-red-100 text-red-700 p-4 rounded-lg text-center">
        <p>{{ error }}</p>
      </div>

      <!-- Formulario de Edición -->
      <div v-else class="space-y-6">
        <!-- Lista de Cirugías Editables -->
        <div>
          <h5 class="form-label font-semibold mb-2">Cirugías Incluidas</h5>
          <!-- --- INICIO DE LA MODIFICACIÓN --- -->
          <!-- Se añade un mensaje para cuando no hay cirugías en la orden -->
          <div v-if="formData.cirugias.length === 0" class="text-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-sm text-slate-500 dark:text-slate-400">
            Esta orden de pago no tiene cirugías asociadas.
          </div>
          <!-- --- FIN DE LA MODIFICACIÓN --- -->
          <div v-else class="space-y-4">
            <div v-for="cirugia in formData.cirugias" :key="cirugia.reporte_id" class="cirugia-item">
              <div class="flex-grow">
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ cirugia.paciente }} - {{ cirugia.tipo_cirugia }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">ID: {{ cirugia.id_cirugia }} | Fecha: {{ formatDate(cirugia.fecha_cirugia) }}</p>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-slate-500">$</span>
                <input
                  type="number"
                  v-model.number="cirugia.monto_a_pagar"
                  class="form-input w-32 text-right"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Campo de Notas -->
        <div>
          <label for="notas-orden" class="form-label font-semibold">Notas Generales de la Orden</label>
          <textarea
            id="notas-orden"
            v-model="formData.notas"
            rows="3"
            class="form-input"
            placeholder="Añadir notas o comentarios..."
          ></textarea>
        </div>

        <!-- Botón de Guardar -->
        <div class="pt-4">
          <button 
            @click="handleSaveChanges"
            :disabled="isSubmitting"
            class="btn-primary w-full"
          >
            <span v-if="isSubmitting">Guardando Cambios...</span>
            <span v-else>Guardar Cambios</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { supabase } from '../../../services/supabase';
import { useToasts } from '../../../composables/useToasts';

const props = defineProps({
  orderId: { type: [Number, String], required: true }
});
const emit = defineEmits(['action-completed']);

const { showSuccessToast, showErrorToast } = useToasts();
const isLoading = ref(true);
const isSubmitting = ref(false);
const error = ref(null);

const formData = reactive({
  notas: '',
  cirugias: []
});

onMounted(async () => {
  try {
    const { data, error: rpcError } = await supabase.rpc('obtener_detalle_orden_pago', {
      p_orden_id: props.orderId
    });
    if (rpcError) throw rpcError;
    if (!data) throw new Error("No se encontraron detalles para esta orden.");

    formData.notas = data.notas || '';
    
    // --- CAMBIO CRÍTICO: Se añade un fallback a un array vacío ---
    // Si 'data.pagos' es null o undefined, se usará [] para evitar el error con .flatMap()
    formData.cirugias = (data.pagos || []).flatMap(pago => 
      pago.cirugias.map(cirugia => ({
        reporte_id: cirugia.reporte_id,
        paciente: cirugia.paciente,
        tipo_cirugia: cirugia.tipo_cirugia,
        id_cirugia: cirugia.id_cirugia,
        fecha_cirugia: cirugia.fecha_cirugia,
        monto_a_pagar: cirugia.monto_a_pagar
      }))
    );

  } catch (err) {
    error.value = `Error al cargar los detalles: ${err.message}`;
    showErrorToast(error.value);
  } finally {
    isLoading.value = false;
  }
});

const handleSaveChanges = async () => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;

  try {
    const payload = {
      notas: formData.notas,
      cirugias_modificadas: formData.cirugias.map(c => ({
        reporte_id: c.reporte_id,
        nuevo_monto: parseFloat(c.monto_a_pagar) || 0
      }))
    };

    const { data, error: rpcError } = await supabase.rpc('modificar_orden_de_pago', {
      p_orden_id: props.orderId,
      p_modificaciones: payload
    });

    if (rpcError) throw rpcError;

    showSuccessToast(data);
    emit('action-completed');

  } catch (err) {
    showErrorToast(err, 'Error al guardar los cambios.');
  } finally {
    isSubmitting.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};
</script>

<style scoped>
.tool-container { @apply bg-white dark:bg-slate-800 rounded-xl shadow; }
.tool-header { @apply p-4 border-b border-slate-200 dark:border-slate-700; }
.tool-title { @apply font-semibold text-slate-800 dark:text-slate-100; }
.tool-description { @apply text-sm text-slate-500 dark:text-slate-400; }
.tool-body { @apply p-4; }
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
.form-input { @apply px-3 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.cirugia-item { @apply flex justify-between items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg; }
</style>