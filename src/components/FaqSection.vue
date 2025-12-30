<!-- src/components/FaqSection.vue -->
<template>
  <div class="faq-wrap">
    <div class="faq-card">
      <div class="faq-header">
        <h2 class="faq-title">Preguntas Frecuentes</h2>
        <p class="faq-subtitle">
          Respuestas rápidas sobre pagos, comprobantes y estados. Si tu caso es especial, escribinos y lo revisamos.
        </p>
      </div>

      <div class="faq-list">
        <div
          v-for="item in faqItems"
          :key="item.id"
          class="faq-item"
        >
          <button
            type="button"
            class="faq-q"
            @click="toggleFaq(item.id)"
            :aria-expanded="openFaqId === item.id"
          >
            <span class="faq-q-text">{{ item.q }}</span>
            <svg
              class="faq-chevron"
              :class="openFaqId === item.id ? 'faq-chevron--open' : ''"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <div v-show="openFaqId === item.id" class="faq-a">
            <p class="faq-a-text" v-html="item.a"></p>
          </div>
        </div>
      </div>

      <div class="faq-footer">
        <div class="faq-tip">
          <strong>Tip:</strong> Si ves “Pendiente de pago”, normalmente es porque falta cerrar circuito:
          retorno de material + control + ficha completa.
        </div>

        <!-- --- INICIO DE LA MODIFICACIÓN --- -->
        <!-- Se añade una nueva sección para el contacto por WhatsApp -->
        <div class="mt-6 pt-6 border-t border-slate-100 dark:border-slate-700">
          <p class="text-center text-sm text-slate-500 dark:text-slate-400 mb-3">¿No encontraste tu respuesta?</p>
          <a 
            :href="whatsappLink" 
            target="_blank" 
            rel="noopener noreferrer"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-green-500 text-white font-bold rounded-lg shadow-md hover:bg-green-600 transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.487 5.235 3.487 8.413.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01s-.521.074-.792.372c-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.626.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
            </svg>
            <span>Contactar por WhatsApp</span>
          </a>
        </div>
        <!-- --- FIN DE LA MODIFICACIÓN --- -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// --- INICIO DE LA MODIFICACIÓN ---
// Se añade la constante para el enlace de WhatsApp.
const whatsappLink = "https://wa.me/5493794007558?text=Hola%20Cesar,%20tengo%20una%20consulta%20sobre%20mis%20pagos.";
// --- FIN DE LA MODIFICACIÓN ---

const openFaqId = ref(null);
const toggleFaq = (id) => {
  openFaqId.value = openFaqId.value === id ? null : id;
};

const faqItems = ref([
  { id: 'pago-cuando', q: '¿Cuándo se paga una cirugía?', a: `El pago se realiza <strong>dentro de los 10 días hábiles</strong> posteriores a que:<br>• El material regresa al depósito y se controla<br>• La ficha técnica esté <strong>completa y validada</strong>.` },
  { id: 'pendiente-por-que', q: '¿Por qué figura “Pendiente de pago” si ya instrumenté la cirugía?', a: `Porque el pago no se dispara solo por “instrumentar”. Se paga cuando se cierra el circuito: <strong>retorno de material</strong>, <strong>control</strong> y <strong>ficha técnica completa</strong>.` },
  { id: 'sin-ficha', q: '¿Puedo cobrar si no completé la ficha técnica?', a: `No. La ficha técnica es <strong>obligatoria</strong> y forma parte de la política de la empresa. Sin ficha → <strong>no se procesa el pago</strong>.` },
  { id: 'pago-agrupado', q: '¿Qué pasa si me pagaron varias cirugías juntas?', a: `Es normal. Muchas veces se agrupan varias cirugías de una misma semana en <strong>un solo pago</strong> (un solo comprobante).` },
  { id: 'comprobante-donde', q: '¿Dónde veo mi comprobante de pago?', a: `Cuando el estado figura como <strong>“Pagado”</strong>, vas a ver el botón <strong>“Ver recibo”</strong> disponible en la tarjeta del reporte.` },
  { id: 'por-que-ficha', q: '¿Por qué es tan importante completar la ficha técnica?', a: `Porque permite validar el evento quirúrgico, controlar materiales y registrar observaciones. Es el paso que habilita el cierre del circuito y el pago.` },
  { id: 'no-veo-pago', q: '¿Por qué no veo el estado de pago?', a: `Hasta que la ficha no esté completa y enviada, el sistema puede mostrarte “Completa la ficha…”. Recién con <strong>Enviado</strong> se muestra el estado de pago.` },
  { id: 'estados', q: '¿Qué significa cada estado?', a: `<strong>Pendiente:</strong> falta completar o validar la ficha.<br><strong>Enviado:</strong> ficha cerrada y circuito finalizado.<br><strong>Pagado:</strong> pago realizado y comprobante disponible.` },
  { id: 'dos-tiempos', q: '¿Qué pasa si una cirugía se reprograma o tiene dos tiempos quirúrgicos?', a: `Cada tiempo se gestiona como un <strong>evento logístico distinto</strong>. Eso impacta en materiales, fichas y pagos.` },
]);
</script>

<style scoped>
.faq-wrap { @apply w-full; }
.faq-card { @apply bg-white dark:bg-slate-800 rounded-2xl shadow p-6; }
.faq-header { @apply mb-6; }
.faq-title { @apply text-xl font-bold text-slate-800 dark:text-slate-100; }
.faq-subtitle { @apply mt-2 text-slate-600 dark:text-slate-300; }
.faq-list { @apply divide-y divide-slate-100 dark:divide-slate-700; }
.faq-item { @apply py-3; }
.faq-q { @apply w-full flex items-center justify-between gap-3 text-left px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors; }
.faq-q-text { @apply font-semibold text-slate-800 dark:text-slate-100; }
.faq-chevron { @apply w-5 h-5 text-slate-500 dark:text-slate-300 transition-transform; }
.faq-chevron--open { @apply rotate-180; }
.faq-a { @apply px-2 pt-2; }
.faq-a-text { @apply text-slate-600 dark:text-slate-300 leading-relaxed; }
.faq-footer { @apply mt-6; }
.faq-tip { @apply text-sm bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200; }
</style>