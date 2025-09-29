<!-- src/components/ReportDrawer.vue -->
<template>
  <div>
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-40 flex items-center justify-center p-4" @click.self="close">
        <div class="fixed inset-0 bg-black bg-opacity-70 transition-opacity"></div>
        
        <div class="relative z-50 w-full max-w-3xl bg-white h-[90vh] flex flex-col rounded-2xl shadow-2xl dark:bg-slate-800">
          <div class="p-4 border-b flex justify-between items-center flex-shrink-0 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-800 dark:text-slate-100">Detalles Completos del Reporte</h2>
            <button @click="close" class="p-2 rounded-full text-gray-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">&times;</button>
          </div>

          <!-- **NUEVO:** Barra de Pestañas -->
          <div class="px-6 pt-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div class="flex space-x-4">
              <button @click="activeTab = 'details'" :class="['py-2 px-3 text-sm font-semibold rounded-t-md', activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']">
                Detalles del Reporte
              </button>
              <button @click="activeTab = 'history'" :class="['py-2 px-3 text-sm font-semibold rounded-t-md', activeTab === 'history' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']">
                Historial de Eventos
              </button>
            </div>
          </div>

          <!-- Cuerpo con Scroll y Contenido Dinámico -->
          <div class="flex-grow p-6 overflow-y-auto">
            <!-- Pestaña de Detalles -->
            <div v-show="activeTab === 'details'" class="space-y-8">
              <div v-if="reporte" class="text-sm">
                <section class="space-y-4">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Datos de la Cirugía</h3>
                  <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                    <DetailRow label="Paciente" :value="reporte.paciente" is-bold />
                    <DetailRow label="Médico" :value="reporte.medico" />
                    <DetailRow label="Fecha" :value="formatDate(reporte.fecha_cirugia)" />
                    <DetailRow label="Lugar" :value="reporte.lugar_cirugia" />
                    <DetailRow label="ID Cirugía" :value="reporte.id_cirugia" />
                  </div>
                </section>
                <section class="space-y-4">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Informe del Instrumentador</h3>
                  <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                    <DetailRow label="Completado por" :value="reporte.instrumentador_completado" is-bold />
                    <DetailRow label="DNI" :value="instrumentadorDni || 'Cargando...'" />
                    <DetailRow label="Set Completo" :value="formatBoolean(reporte.set_completo)" />
                    <DetailRow v-if="reporte.set_completo === false" label="Informó Faltante" :value="formatBoolean(reporte.informe_faltante)" />
                  </div>
                </section>
                <section class="space-y-4">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Evaluación</h3>
                  <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                    <RatingRow label="Puntualidad" :rating="reporte.rating_puntualidad" />
                    <RatingRow label="Condiciones" :rating="reporte.rating_condiciones" />
                    <RatingRow label="Asesoramiento" :rating="reporte.rating_asesoramiento" />
                    <RatingRow label="General" :rating="reporte.rating_evaluacion_general" is-bold />
                  </div>
                </section>
                <section class="space-y-4">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Datos Adicionales de Importancia</h3>
                  <div class="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                    <h4 class="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Consumo Realizado</h4>
                    <p class="text-base text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{{ reporte.consumo_realizado || 'No especificado.' }}</p>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                      <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-2">Observaciones</h4>
                      <p class="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{{ reporte.observaciones || 'Sin observaciones.' }}</p>
                    </div>
                    <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700 space-y-2">
                      <DetailRow label="Representante" :value="reporte.representante_ventas" simple />
                      <DetailRow label="Duración Cirugía" :value="reporte.duracion_cirugia" simple />
                      <DetailRow label="Logística" :value="reporte.tipo_logistica" simple />
                      <DetailRow label="Transporte" :value="reporte.transporte_utilizado" simple />
                    </div>
                  </div>
                </section>
                <section v-if="reporte.url_firma" class="space-y-4">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Firma</h3>
                  <div class="border rounded-lg p-4 bg-slate-100 dark:bg-slate-700 dark:border-slate-600">
                    <img :src="reporte.url_firma" alt="Firma" class="mx-auto h-32 object-contain" />
                    <button @click="downloadSignature" class="mt-4 w-full text-center text-sm text-blue-600 hover:underline dark:text-blue-400">
                      Descargar Firma
                    </button>
                  </div>
                </section>
              </div>
            </div>

            <!-- **NUEVO:** Pestaña de Historial -->
            <div v-show="activeTab === 'history'">
              <ul class="space-y-4">
                <li v-for="(event, index) in timelineEvents" :key="index" class="flex items-start space-x-4">
                  <div class="flex flex-col items-center self-stretch">
                    <span class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="event.iconBg">
                      <component :is="event.icon" class="h-5 w-5 text-white" />
                    </span>
                    <div v-if="index < timelineEvents.length - 1" class="w-0.5 flex-grow bg-slate-200 dark:bg-slate-700 my-2"></div>
                  </div>
                  <div>
                    <p class="font-bold text-slate-800 dark:text-slate-100">{{ event.title }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ formatDateTime(event.date) }}</p>
                    <p v-if="event.subtitle" class="text-sm text-slate-500 dark:text-slate-400">{{ event.subtitle }}</p>
                  </div>
                </li>
                 <li v-if="timelineEvents.length === 0" class="text-center text-slate-500 py-8">
                  No hay eventos de historial para mostrar.
                </li>
              </ul>
            </div>
          </div>

          <div class="p-4 border-t flex justify-end items-center space-x-3 flex-shrink-0 dark:border-slate-700">
             <button @click="close" class="font-semibold px-4 py-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">Cerrar</button>
            <button @click="generatePDF" :disabled="isGeneratingPdf || reporte?.estado !== 'Enviado'" class="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center">
              <svg v-if="isGeneratingPdf" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              <span>{{ isGeneratingPdf ? 'Generando...' : 'Descargar PDF' }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="isGeneratingPdf" class="fixed -left-[9999px] top-0">
      <ReportPDF :reporte="reporte" :instrumentador-dni="instrumentadorDni" ref="pdfComponentRef" />
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, nextTick, defineComponent, h } from 'vue';
import { supabase } from '../services/supabase.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import ReportPDF from './ReportPDF.vue';
import { DocumentPlusIcon, LinkIcon, PaperAirplaneIcon } from '@heroicons/vue/24/solid';

const DetailRow = defineComponent({
  props: { label: String, value: [String, Number, Boolean], isBold: Boolean, preWrap: Boolean, simple: Boolean },
  template: `
    <div :class="simple ? 'grid grid-cols-2' : 'grid grid-cols-3 gap-4 py-2 border-b border-slate-200/50 last:border-b-0 dark:border-slate-600/50'">
      <dt class="font-semibold text-gray-600 dark:text-slate-300">{{ label }}</dt>
      <dd class="text-gray-800 dark:text-slate-100" :class="[simple ? 'text-right' : 'col-span-2', { 'font-bold': isBold, 'whitespace-pre-wrap': preWrap }]">{{ value || 'N/A' }}</dd>
    </div>
  `
});

const RatingRow = defineComponent({
  props: { label: String, rating: Number, isBold: Boolean },
  template: `
    <div class="grid grid-cols-3 gap-4 py-2 border-b border-slate-200/50 last:border-b-0 dark:border-slate-600/50">
      <dt class="font-semibold text-gray-600 dark:text-slate-300">{{ label }}</dt>
      <dd class="col-span-2 flex items-center" :class="{ 'font-bold': isBold }">
        <span v-if="rating" class="flex items-center">
          <span v-for="i in 5" :key="i" class="text-lg" :class="i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'">★</span>
          <span class="ml-2 text-gray-800 dark:text-slate-100">({{ rating }}/5)</span>
        </span>
        <span v-else class="text-gray-500 dark:text-slate-400">N/A</span>
      </dd>
    </div>
  `
});

const props = defineProps({
  show: Boolean,
  reporte: Object,
});
const emit = defineEmits(['close']);
const instrumentadorDni = ref(null);
const activeTab = ref('details');

const close = () => {
  instrumentadorDni.value = null;
  activeTab.value = 'details';
  emit('close');
};

const timelineEvents = computed(() => {
  if (!props.reporte) return [];
  const events = [];
  
  if (props.reporte.created_at) {
    events.push({
      icon: DocumentPlusIcon,
      iconBg: 'bg-blue-500',
      title: 'Reporte Creado',
      date: props.reporte.created_at
    });
  }
  
  if (props.reporte.token) {
    events.push({
      icon: LinkIcon,
      iconBg: 'bg-purple-500',
      title: 'Link de Ficha Generado',
      date: props.reporte.created_at 
    });
  }

  if (props.reporte.fecha_envio) {
    events.push({
      icon: PaperAirplaneIcon,
      iconBg: 'bg-emerald-500',
      title: 'Ficha Enviada',
      subtitle: `por ${props.reporte.instrumentador_completado}`,
      date: props.reporte.fecha_envio
    });
  }

  return events.sort((a, b) => new Date(a.date) - new Date(b.date));
});

watch(() => props.reporte, async (newReporte) => {
  if (newReporte && newReporte.instrumentador_completado) {
    instrumentadorDni.value = 'Buscando...';
    try {
      const { data, error } = await supabase.from('instrumentadores').select('dni').eq('nombre_completo', newReporte.instrumentador_completado).single();
      if (error && error.code !== 'PGRST116') throw error;
      instrumentadorDni.value = data?.dni || 'No encontrado';
    } catch (err) {
      console.error("Error buscando DNI:", err);
      instrumentadorDni.value = 'Error al buscar';
    }
  } else {
    instrumentadorDni.value = null;
  }
});

const downloadSignature = () => {
  if (!props.reporte?.url_firma) return;
  fetch(props.reporte.url_firma)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `firma-${props.reporte.id_cirugia || props.reporte.id}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    .catch(() => alert('No se pudo descargar la firma.'));
};

const isGeneratingPdf = ref(false);
const pdfComponentRef = ref(null);

const generatePDF = async () => {
  if (!props.reporte) return;
  isGeneratingPdf.value = true;
  try {
    await nextTick();
    const pdfElement = pdfComponentRef.value?.pdfTemplateRef;
    if (!pdfElement) throw new Error("No se encontró el elemento para generar el PDF.");
    const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    let imgHeight = pdfWidth / ratio;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
    while (heightLeft > 0) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    const fileName = `Reporte-${props.reporte.id_cirugia || props.reporte.id}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    alert("Hubo un error al generar el PDF. Revise la consola.");
  } finally {
    isGeneratingPdf.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  date.setDate(date.getDate() + 1);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatBoolean = (value) => {
  if (value === null || value === undefined) return 'N/A';
  return value ? '✅ Sí' : '❌ No';
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }) + ' hs';
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>