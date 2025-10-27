<!-- src/components/ReportPDF.vue -->
<template>
  <div ref="pdfTemplateRef" class="bg-white text-black p-8 font-sans w-[210mm] min-h-[296mm]">
    <div v-if="reporte" class="flex flex-col h-full text-xs">
      
      <header class="flex justify-between items-start border-b-2 border-slate-200 pb-3">
        <img src="/2.svg" alt="Districorr Logo" class="h-16">
        <div class="text-right">
          <h1 class="text-2xl font-bold text-[#1E3A8A]">Reporte de Cirugía</h1>
          <p class="text-slate-600 font-semibold text-sm">Ficha de Identificación del Instrumentador Quirúrgico</p>
          <div class="text-xs text-slate-500 mt-1">
            <span>ID Reporte: {{ reporte.id_cirugia }}</span> |
            <span>Generado: {{ new Date().toLocaleString('es-ES') }}</span>
          </div>
        </div>
      </header>

      <main class="flex-grow space-y-4 mt-4">
        <section class="p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div class="grid grid-cols-2 gap-x-6 gap-y-1">
            <InfoItem icon="UserIcon" label="Paciente" :value="reporte.paciente" is-bold />
            <InfoItem icon="ClipboardDocumentCheckIcon" label="Médico" :value="reporte.medico" />
            <InfoItem icon="CalendarIcon" label="Fecha de Cirugía" :value="formatDate(reporte.fecha_cirugia)" />
            <InfoItem icon="MapPinIcon" label="Lugar / Institución" :value="reporte.lugar_cirugia" />
          </div>
        </section>

        <section>
          <div class="grid grid-cols-2 gap-x-6">
            <InfoItem icon="UserCircleIcon" label="Completado por" :value="reporte.instrumentador_completado" />
            <InfoItem icon="IdentificationIcon" label="DNI" :value="instrumentadorDni" />
          </div>
        </section>

        <section class="grid grid-cols-2 gap-x-6">
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-slate-700">Cuestionario</h3>
            <InfoItem label="Set completo recibido" :value="formatBoolean(reporte.set_completo)" />
            <InfoItem v-if="reporte.set_completo === false" label="Faltantes informados a tiempo" :value="formatBoolean(reporte.informe_faltante)" />
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-slate-700">Evaluación</h3>
            <RatingStars label="Puntualidad" :rating="reporte.rating_puntualidad" />
            <RatingStars label="Condiciones" :rating="reporte.rating_condiciones" />
            <RatingStars label="Asesoramiento" :rating="reporte.rating_asesoramiento" />
            <RatingStars label="General" :rating="reporte.rating_evaluacion_general" />
          </div>
        </section>
        
        <section>
          <h2 class="text-base font-bold text-slate-800 mb-2 border-b pb-1">Datos Adicionales</h2>
          <InfoBlock label="Consumo Realizado" :value="reporte.consumo_realizado" />
          <div class="grid grid-cols-2 gap-x-6 mt-3">
            <InfoBlock label="Comentarios / Observaciones" :value="reporte.observaciones" />
            <div class="space-y-1 text-xs border p-2 rounded-md bg-slate-50">
              <InfoItem label="Representante" :value="reporte.representante_ventas" />
              <InfoItem label="Duración Cirugía" :value="reporte.duracion_cirugia" />
              <InfoItem label="Logística" :value="humanize(reporte.tipo_logistica)" />
              <InfoItem label="Transporte" :value="reporte.transporte_utilizado" />
            </div>
          </div>
        </section>
        
        <section v-if="reporte.url_firma" class="pt-2">
          <h2 class="text-base font-bold text-slate-800 mb-2 border-b pb-1">Firma del Instrumentador</h2>
          <div class="mt-2 text-center">
            <div class="border-2 border-slate-200 p-2 inline-block rounded-md shadow-inner">
              <img :src="reporte.url_firma" alt="Firma" class="h-32 object-contain">
            </div>
            <p class="mt-2 font-semibold text-sm">{{ reporte.instrumentador_completado }}</p>
            <p class="text-xs text-slate-500 italic">Firma digital registrada en el sistema</p>
          </div>
        </section>
      </main>

      <footer class="text-center text-xs text-slate-500 pt-3 border-t-2 border-slate-200 mt-auto">
        Reporte generado automáticamente por Districorr – {{ new Date().toLocaleString('es-ES') }}<br>
        9 de julio 1251 -  DISTRICORR SRL
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, h } from 'vue';
import { UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon, UserCircleIcon, IdentificationIcon } from '@heroicons/vue/24/outline';

const props = defineProps({ 
  reporte: Object,
  instrumentadorDni: String,
});

// Creamos una referencia al div principal del template.
const pdfTemplateRef = ref(null);

// --- CORRECCIÓN ---
// Esta línea expone la referencia 'pdfTemplateRef' para que el componente padre pueda acceder a ella.
defineExpose({ pdfTemplateRef });

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};
const formatBoolean = (value) => (value === null || value === undefined) ? 'N/A' : (value ? '✅ Sí' : '❌ No');
const humanize = (text) => {
  if (!text) return 'N/A';
  return text.replace('_', ' ').replace(/\b\w/g, char => char.toUpperCase());
};

const InfoItem = defineComponent({
  props: ['label', 'value', 'icon', 'isBold'],
  setup(props) {
    const icons = { UserIcon, ClipboardDocumentCheckIcon, CalendarIcon, MapPinIcon, UserCircleIcon, IdentificationIcon };
    const iconComponent = props.icon ? h(icons[props.icon], { class: 'h-4 w-4 mr-2 text-slate-500 flex-shrink-0' }) : null;
    return () => h('div', { class: 'flex py-0.5' }, [
      iconComponent,
      h('span', { class: 'font-semibold text-slate-800 mr-2 whitespace-nowrap' }, props.label + ':'),
      h('span', { class: ['text-slate-600', { 'font-bold': props.isBold }] }, props.value || 'N/A')
    ]);
  }
});

const InfoBlock = ({ label, value }) => h('div', {}, [
  h('strong', { class: 'block font-bold text-slate-700 mb-1' }, label),
  h('p', { class: 'p-2 bg-slate-100 border border-slate-200 rounded text-slate-600 whitespace-pre-wrap text-xs min-h-[40px]' }, value || 'Sin comentarios.')
]);

const RatingStars = defineComponent({
  props: ['label', 'rating'],
  setup(props) {
    const ratingColors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-lime-500', 'text-emerald-500'];
    const stars = Array.from({ length: 5 }, (_, i) => h('span', { class: i < props.rating ? ratingColors[props.rating - 1] : 'text-slate-300' }, '★'));
    return () => h('div', { class: 'flex items-center' }, [
      h('span', { class: 'font-semibold text-slate-800 mr-2 w-28' }, props.label + ':'),
      h('div', { class: 'flex text-base' }, stars),
      h('span', { class: 'ml-2 text-xs text-slate-500' }, `(${props.rating || 'N'}/${'A'})`)
    ]);
  }
});
</script>