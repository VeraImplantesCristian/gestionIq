<!-- src/components/GenerateLinkModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div @click.self="$emit('close')" class="w-full max-w-lg">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl">

          <!-- Header -->
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Compartir Ficha Digital</h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Cerrar">&times;</button>
          </div>

          <!-- Body -->
          <div v-if="reporte" class="p-6 space-y-6">
            <!-- Resumen de la cirugía -->
            <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700 text-sm">
              <p><strong class="text-slate-600 dark:text-slate-300">Paciente:</strong> <span class="font-semibold">{{ reporte.paciente }}</span></p>
              <p><strong class="text-slate-600 dark:text-slate-300">Médico:</strong> {{ reporte.medico }}</p>
              <p><strong class="text-slate-600 dark:text-slate-300">Fecha:</strong> {{ fechaCirugiaFmt }}</p>
              <p><strong class="text-slate-600 dark:text-slate-300">Lugar:</strong> {{ reporte.lugar_cirugia }}</p>
            </div>

            <!-- Campo del Link Generado -->
            <div class="relative">
              <input type="text" :value="fullLink || 'Haga clic en Generar Link...'" readonly class="w-full p-3 pr-10 border-slate-300 rounded-md shadow-sm text-sm bg-slate-100 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300" />
              <button @click="copyLink" :disabled="!fullLink" class="absolute inset-y-0 right-0 flex items-center pr-3 disabled:opacity-50" aria-label="Copiar link">
                <svg class="w-5 h-5 text-gray-500 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
              </button>
            </div>

            <!-- Botones de Acción -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button @click="generateLink" :disabled="isLoading" :class="['action-button', localShortCode ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white']">
                <svg v-if="isLoading" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                <span>{{ isLoading ? 'Generando...' : (localShortCode ? 'Regenerar Link' : 'Generar Link') }}</span>
              </button>
              <button @click="shareOnWhatsApp" :disabled="!fullLink" class="action-button bg-green-500 hover:bg-green-600 text-white">
                <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                <span>Compartir</span>
              </button>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <!-- ========= INICIO DE LA SOLUCIÓN: BOTÓN DE EXPIRAR LINK ========= -->
            <button @click="expireLink" :disabled="isLoading" class="action-button-danger">
              <svg v-if="isExpiring" class="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
              <span>{{ isExpiring ? 'Expirando...' : 'Expirar Link' }}</span>
            </button>
            <!-- ========= FIN DE LA SOLUCIÓN ========= -->
            <button @click="$emit('close')" class="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium">
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
  reporte: Object,
});
// ========= INICIO DE LA SOLUCIÓN: AÑADIR NUEVO EMIT =========
const emit = defineEmits(['close', 'link-generated', 'link-expired']);
// ========= FIN DE LA SOLUCIÓN =========
const toast = useToast();

const isLoading = ref(false);
const isExpiring = ref(false); // Nuevo estado para el botón de expirar
const localShortCode = ref(props.reporte?.short_code);

watch(() => props.reporte, (newReporte) => {
  if (newReporte) {
    localShortCode.value = newReporte.short_code;
  } else {
    localShortCode.value = null;
  }
}, { immediate: true });

const fullLink = computed(() => {
  if (!localShortCode.value) return null;
  return `${window.location.origin}/f/${localShortCode.value}`;
});

const fechaCirugiaFmt = computed(() => {
  const f = props.reporte?.fecha_cirugia;
  if (!f) return '—';
  return new Date(`${f}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
});

const generateLink = async () => {
  if (!props.reporte) return;
  isLoading.value = true;
  try {
    const { data: short_code, error } = await supabase.rpc('create_short_link', { p_reporte_id: props.reporte.id });
    if (error) throw error;
    
    localShortCode.value = short_code;
    emit('link-generated', { reporteId: props.reporte.id, short_code });
    toast.success('¡Link corto generado/actualizado!');
  } catch (err) {
    toast.error('Error al generar el link: ' + err.message);
  } finally {
    isLoading.value = false;
  }
};

const clipboardText = computed(() => {
  if (!fullLink.value) return '';
  return [`Ficha Digital de Cirugía`, `Paciente: ${props.reporte?.paciente || '—'}`, `Médico: ${props.reporte?.medico || '—'}`, `Fecha: ${fechaCirugiaFmt.value}`, `Lugar: ${props.reporte?.lugar_cirugia || '—'}`, '', fullLink.value].join('\n');
});

const copyLink = async () => {
  if (!clipboardText.value) return;
  try {
    await navigator.clipboard.writeText(clipboardText.value);
    toast.success('¡Mensaje completo copiado!');
  } catch (err) {
    toast.error('No se pudo copiar el mensaje.');
  }
};

const shareOnWhatsApp = () => {
  if (!fullLink.value) return;
  const whatsappText = [`*Ficha Digital de Cirugía*`, `*Paciente:* ${props.reporte?.paciente || '—'}`, `*Médico:* ${props.reporte?.medico || '—'}`, `*Fecha:* ${fechaCirugiaFmt.value}`, `*Lugar:* ${props.reporte?.lugar_cirugia || '—'}`, '', fullLink.value].join('\n');
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
  window.open(whatsappUrl, '_blank');
};

// ========= INICIO DE LA SOLUCIÓN: FUNCIÓN PARA EXPIRAR EL LINK =========
const expireLink = async () => {
  if (!props.reporte) return;
  if (!window.confirm(`¿Estás seguro de que quieres expirar el link para "${props.reporte.paciente}"? Esta acción no se puede deshacer.`)) {
    return;
  }
  
  isExpiring.value = true;
  try {
    const { error } = await supabase.rpc('expire_report_link', { p_reporte_id: props.reporte.id });
    if (error) throw error;
    
    toast.success('¡Link expirado con éxito!');
    emit('link-expired', { reporteId: props.reporte.id });
    emit('close'); // Cerramos el modal después de la acción.
  } catch (err) {
    toast.error(`Error al expirar el link: ${err.message}`);
  } finally {
    isExpiring.value = false;
  }
};
// ========= FIN DE LA SOLUCIÓN =========
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.action-button { @apply w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm disabled:opacity-50; }
/* Nuevo estilo para el botón de peligro */
.action-button-danger { @apply flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 disabled:opacity-50; }
</style>