<!-- src/components/admin/PostPagoModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" @click.self="$emit('close')">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
        <header class="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">✅ Pago Registrado con Éxito</h2>
          <p class="text-sm text-slate-500">Utilizá los siguientes textos para comunicar el pago.</p>
        </header>

        <main class="p-6 space-y-6 overflow-y-auto">
          <div>
            <label class="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Resumen General del Lote</label>
            <div class="relative">
              <textarea readonly :value="generalSummaryText" class="textarea-display"></textarea>
              <button @click="copyToClipboard(generalSummaryText, 'Resumen general')" class="copy-button">Copiar</button>
            </div>
          </div>

          <div>
            <h3 class="mb-2 text-lg font-semibold">Mensajes para Instrumentadores</h3>
            <div class="space-y-4">
              <div v-for="inst in paymentData.instrumentadores" :key="inst.dni">
                <label class="block mb-1 text-sm font-medium text-slate-600 dark:text-slate-300">Para: {{ inst.nombre }}</label>
                <div class="relative">
                  <textarea readonly :value="generateWhatsAppMessage(inst)" class="h-32 textarea-display"></textarea>
                  <button @click="copyToClipboard(generateWhatsAppMessage(inst), `Mensaje para ${inst.nombre}`)" class="copy-button">Copiar</button>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer class="p-4 text-right border-t bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700">
          <button @click="$emit('close')" class="btn-secondary">Cerrar</button>
        </footer>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: Boolean,
  paymentData: {
    type: Object,
    default: () => ({ instrumentadores: [], monto_total_general: 0 })
  }
});

defineEmits(['close']);

const toast = useToast();

const generalSummaryText = computed(() => {
  if (!props.paymentData || !props.paymentData.instrumentadores || props.paymentData.instrumentadores.length === 0) return '';
  
  let text = `RESUMEN DE PAGO\n`;
  text += `--------------------\n`;
  props.paymentData.instrumentadores.forEach(inst => {
    text += `Instrumentador: ${inst.nombre}\n`;
    text += `Monto: ${formatCurrency(inst.monto_total)}\n`;
    text += `Cirugías: ${inst.cirugias_count}\n\n`;
  });
  text += `--------------------\n`;
  text += `TOTAL GENERAL PAGADO: ${formatCurrency(props.paymentData.monto_total_general)}`;
  return text;
});

const generateWhatsAppMessage = (instrumentador) => {
  if (!instrumentador.activity_token) {
    return `¡Hola ${instrumentador.nombre.split(' ')[0]}! Te informo que se ha procesado tu pago por un total de ${formatCurrency(instrumentador.monto_total)}. No se encontró un link de acceso para tu perfil.`;
  }
  const accessLink = `${window.location.origin}/resumen/${instrumentador.activity_token}`;
  
  return `¡Hola ${instrumentador.nombre.split(' ')[0]}! Te informo que se ha procesado tu pago por un total de ${formatCurrency(instrumentador.monto_total)} correspondiente a ${instrumentador.cirugias_count} cirugía(s).\n\nPuedes ver el detalle y el comprobante accediendo a tu resumen de actividad con tu DNI en el siguiente enlace:\n${accessLink}\n\n¡Muchas gracias!`;
};

const copyToClipboard = async (text, label) => {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`¡${label} copiado al portapapeles!`);
  } catch (err) {
    toast.error('No se pudo copiar el texto.');
  }
};

const formatCurrency = (value) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.textarea-display { @apply w-full p-3 border border-slate-300 rounded-md bg-slate-50 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 text-sm font-mono; resize: none; }
.copy-button { @apply absolute top-2 right-2 bg-slate-200 dark:bg-slate-600 text-xs font-semibold px-2 py-1 rounded hover:bg-slate-300 dark:hover:bg-slate-500; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600; }
</style>