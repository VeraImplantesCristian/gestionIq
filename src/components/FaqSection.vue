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
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Toda la lógica y los datos de las FAQ ahora viven en este componente.
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
/* Los estilos son los mismos que ya tenías, simplemente se mueven aquí. */
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