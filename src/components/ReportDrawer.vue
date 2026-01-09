<!-- src/components/ReportDrawer.vue -->
<template>
  <div>
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-40 flex items-center justify-center p-4">
        <!-- Overlay -->
        <div @click="cancelEdit" class="fixed inset-0 bg-black bg-opacity-70 transition-opacity"></div>
        
        <!-- 
          Contenido del Modal 
          --- CAMBIO: Se aumenta el ancho máximo del modal. ---
          - Se cambió 'max-w-3xl' por 'max-w-4xl' para darle más espacio horizontal.
        -->
        <div class="relative z-50 w-full max-w-4xl bg-white h-[90vh] flex flex-col rounded-lg shadow-xl dark:bg-slate-800">
          
          <!-- Cabecera -->
          <div class="p-4 border-b flex justify-between items-center flex-shrink-0 dark:border-slate-700">
            <h2 class="text-xl font-bold text-gray-800 dark:text-slate-100">
              {{ isEditing ? 'Editando Reporte' : 'Detalles Completos del Reporte' }}
            </h2>
            <button @click="cancelEdit" class="p-2 rounded-full text-gray-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">&times;</button>
          </div>

          <!-- Barra de Pestañas Principal -->
          <div v-if="!isEditing" class="px-6 pt-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
            <div class="flex space-x-4">
              <button @click="activeTab = 'details'" :class="['py-2 px-3 text-sm font-semibold rounded-t-md', activeTab === 'details' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']">
                Detalles
              </button>
              <button @click="activeTab = 'evidence'" :class="['py-2 px-3 text-sm font-semibold rounded-t-md', activeTab === 'evidence' ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200']">
                Evidencias y Más
              </button>
            </div>
          </div>

          <!-- Cuerpo con Scroll -->
          <div v-if="formData" class="flex-grow p-6 overflow-y-auto">
            <!-- Pestaña/Vista de Detalles y Edición -->
            <div v-show="activeTab === 'details' || isEditing" class="space-y-8">
              <section class="space-y-4 text-sm">
                <!-- Datos de la Cirugía -->
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Datos de la Cirugía</h3>
                <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                  <EditableField v-if="isEditing" label="Paciente" v-model="formData.paciente" :is-editing="true" is-bold />
                  <EditableField v-else label="Paciente" :model-value="formData.paciente" :is-editing="false" is-bold />
                  <EditableField v-if="isEditing" label="Médico" v-model="formData.medico" :is-editing="true" />
                  <EditableField v-else label="Médico" :model-value="formData.medico" :is-editing="false" />
                  <EditableField v-if="isEditing" label="Tipo de Cirugía" v-model="formData.tipo_cirugia" :is-editing="true" />
                  <EditableField v-else label="Tipo de Cirugía" :model-value="formData.tipo_cirugia" :is-editing="false" />
                  <EditableField v-if="isEditing" label="Fecha" v-model="formData.fecha_cirugia" :is-editing="true" type="date" />
                  <EditableField v-else label="Fecha" :model-value="formData.fecha_cirugia" :is-editing="false" type="date" />
                  <EditableField v-if="isEditing" label="Lugar" v-model="formData.lugar_cirugia" :is-editing="true" />
                  <EditableField v-else label="Lugar" :model-value="formData.lugar_cirugia" :is-editing="false" />
                  <EditableField v-if="isEditing" label="ID Cirugía" v-model="formData.id_cirugia" :is-editing="true" />
                  <EditableField v-else label="ID Cirugía" :model-value="formData.id_cirugia" :is-editing="false" />
                </div>

                <!-- Informe del Instrumentador -->
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Informe del Instrumentador</h3>
                <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                  <EditableField label="Completado por" :model-value="formData.instrumentador_completado" :is-editing="false" is-bold />
                  <EditableField label="DNI" :model-value="formData.instrumentador_dni" :is-editing="false" />
                  <EditableField v-if="isEditing" label="Set Completo" v-model="formData.set_completo" :is-editing="true" type="boolean" />
                  <EditableField v-else label="Set Completo" :model-value="formData.set_completo" :is-editing="false" type="boolean" />
                  <template v-if="formData.set_completo === false || isEditing">
                    <EditableField v-if="isEditing" label="Informó Faltante" v-model="formData.informe_faltante" :is-editing="true" type="boolean" />
                    <EditableField v-else label="Informó Faltante" :model-value="formData.informe_faltante" :is-editing="false" type="boolean" />
                  </template>
                </div>

                <!-- Evaluación -->
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Evaluación</h3>
                <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                  <RatingRow label="Puntualidad" :rating="formData.rating_puntualidad" />
                  <RatingRow label="Condiciones" :rating="formData.rating_condiciones" />
                  <RatingRow label="Asesoramiento" :rating="formData.rating_asesoramiento" />
                  <RatingRow label="General" :rating="formData.rating_evaluacion_general" is-bold />
                </div>

                <!-- Datos Adicionales -->
                <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Datos Adicionales de Importancia</h3>
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-900/20 dark:border-blue-500/30">
                  <h4 class="text-lg font-bold text-blue-900 dark:text-blue-200 mb-2">Consumo Realizado</h4>
                  <EditableField v-if="isEditing" label="" v-model="formData.consumo_realizado" :is-editing="true" type="textarea" :show-label="false" />
                  <EditableField v-else label="" :model-value="formData.consumo_realizado" :is-editing="false" type="textarea" :show-label="false" />
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700">
                    <h4 class="font-bold text-slate-800 dark:text-slate-100 mb-2">Observaciones</h4>
                    <EditableField v-if="isEditing" label="" v-model="formData.observaciones" :is-editing="true" type="textarea" :show-label="false" />
                    <EditableField v-else label="" :model-value="formData.observaciones" :is-editing="false" type="textarea" :show-label="false" />
                  </div>
                  <div class="p-4 bg-slate-50 rounded-lg border dark:bg-slate-700/50 dark:border-slate-700 space-y-2">
                    <EditableField v-if="isEditing" label="Representante" v-model="formData.representante_ventas" :is-editing="true" simple />
                    <EditableField v-else label="Representante" :model-value="formData.representante_ventas" :is-editing="false" simple />
                    <EditableField v-if="isEditing" label="Duración Cirugía" v-model="formData.duracion_cirugia" :is-editing="true" simple />
                    <EditableField v-else label="Duración Cirugía" :model-value="formData.duracion_cirugia" :is-editing="false" simple />
                    <EditableField v-if="isEditing" label="Logística" v-model="formData.tipo_logistica" :is-editing="true" simple />
                    <EditableField v-else label="Logística" :model-value="formData.tipo_logistica" :is-editing="false" simple />
                    <EditableField v-if="isEditing" label="Transporte" v-model="formData.transporte_utilizado" :is-editing="true" simple />
                    <EditableField v-else label="Transporte" :model-value="formData.transporte_utilizado" :is-editing="false" simple />
                  </div>
                </div>

                <!-- Firma -->
                <section v-if="formData.url_firma && !isEditing" class="space-y-4">
                  <h3 class="text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-slate-400">Firma</h3>
                  <div class="border rounded-lg p-4 bg-slate-100 dark:bg-slate-700 dark:border-slate-600">
                    <img :src="formData.url_firma" alt="Firma" class="mx-auto h-32 object-contain" />
                    <button @click="downloadSignature" class="mt-4 w-full text-center text-sm text-blue-600 hover:underline dark:text-blue-400">Descargar Firma</button>
                  </div>
                </section>
              </section>
            </div>

            <!-- Contenedor para las pestañas secundarias -->
            <div v-show="activeTab === 'evidence' && !isEditing">
              <ReportTabs 
                :report-id="formData.id"
                :owner-id="formData.instrumentador_dni"
              />
            </div>
          </div>

          <!-- Pie del Modal -->
          <div class="p-4 border-t flex justify-between items-center flex-shrink-0 dark:border-slate-700">
            <div class="flex items-center space-x-3">
              <button v-if="!isEditing" @click="isEditing = true" class="font-semibold px-4 py-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                Editar Reporte
              </button>
              <button v-else @click="cancelEdit" class="font-semibold px-4 py-2 rounded-md text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700">
                Cancelar Edición
              </button>

              <div v-if="!isEditing">
                <button v-if="!hasIntervention" @click="isInterventionModalOpen = true" class="font-semibold px-4 py-2 rounded-md text-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:hover:bg-purple-900/30">
                  🟣 Registrar Intervención Clave
                </button>
                <span v-else class="font-semibold px-4 py-2 rounded-md text-purple-400 dark:text-purple-500 text-sm cursor-default">
                  ✓ Intervención Registrada
                </span>
              </div>
            </div>
            
            <div class="flex items-center space-x-3">
              <button v-if="isEditing" @click="saveChanges" :disabled="isSaving" class="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:bg-slate-400 flex items-center">
                <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <span>{{ isSaving ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
              <button v-else @click="generatePDF" :disabled="isGeneratingPdf || reporte?.estado !== 'Enviado'" class="bg-slate-600 text-white font-semibold px-4 py-2 rounded-md text-sm hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center">
                <svg v-if="isGeneratingPdf" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <svg v-else class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>{{ isGeneratingPdf ? 'Generando...' : 'Descargar PDF' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="formData" :class="isGeneratingPdf ? 'fixed top-0 -left-[9999px]' : 'hidden'">
      <ReportPDF 
        :reporte="formData" 
        :instrumentador-dni="formData.instrumentador_dni" 
        :pdf-version="currentPdfVersion"
        ref="pdfComponentRef" />
    </div>

    <RegistrarIntervencionModal
      :show="isInterventionModalOpen"
      :reporte="formData"
      @close="isInterventionModalOpen = false"
      @confirm="handleRegisterIntervention"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineAsyncComponent } from 'vue';
import { supabase } from '../services/supabase.js';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// --- CAMBIO: Se importa nuestro composable de toasts en lugar del hook directo ---
import { useToasts } from '../composables/useToasts';

import ReportTabs from './report-details/ReportTabs.vue';
import RegistrarIntervencionModal from './admin/RegistrarIntervencionModal.vue';

const EditableField = defineAsyncComponent(() => import('./EditableField.vue'));
const RatingRow = defineAsyncComponent(() => import('./RatingRow.vue'));
const ReportPDF = defineAsyncComponent(() => import('./ReportPDF.vue'));

const props = defineProps({ show: Boolean, reporte: Object });
const emit = defineEmits(['close', 'updated']);

// --- CAMBIO: Se instancia nuestro composable ---
const { showSuccessToast, showErrorToast } = useToasts();
const activeTab = ref('details');
const isEditing = ref(false);
const isSaving = ref(false);
const formData = ref(null);
const currentPdfVersion = ref(null);
const isInterventionModalOpen = ref(false);
const hasIntervention = ref(false);

const checkExistingIntervention = async (reporteId) => {
  if (!reporteId) {
    hasIntervention.value = false;
    return;
  }
  try {
    const { data, error } = await supabase
      .from('intervenciones_clave')
      .select('id')
      .eq('reporte_id', reporteId)
      .maybeSingle();
    
    hasIntervention.value = !!data && !error;
  } catch (err) {
    hasIntervention.value = false;
  }
};

watch(() => props.show, (isVisible) => {
  if (isVisible && props.reporte) {
    activeTab.value = 'details';
    currentPdfVersion.value = null;
    checkExistingIntervention(props.reporte.id);
  }
});

watch(() => props.reporte, (newReporte) => {
  if (newReporte) {
    formData.value = JSON.parse(JSON.stringify(newReporte));
    checkExistingIntervention(newReporte.id);
  } else {
    formData.value = null;
    hasIntervention.value = false;
  }
}, { deep: true, immediate: true });

const handleRegisterIntervention = async () => {
  if (!formData.value) return;
  
  // --- CAMBIO: Se usa el composable para notificaciones ---
  // (Aunque esta parte ya usaba un sistema de update, lo dejamos por consistencia)
  const toast = useToast(); // Se mantiene para el update, que es un caso especial
  const loadingToastId = toast.info("Registrando intervención...", { timeout: false });
  try {
    const { data, error } = await supabase.rpc('registrar_intervencion_clave', {
      p_reporte_id: formData.value.id,
      p_instrumentador_dni: formData.value.instrumentador_dni
    });

    if (error) throw error;

    if (data) {
      toast.update(loadingToastId, { content: "¡Intervención Clave registrada con éxito!", options: { type: 'success', timeout: 4000 } });
      hasIntervention.value = true;
    } else {
      toast.update(loadingToastId, { content: "Esta cirugía ya tenía una intervención registrada.", options: { type: 'info', timeout: 4000 } });
      hasIntervention.value = true;
    }

  } catch (err) {
    toast.update(loadingToastId, { content: `Error al registrar: ${err.message}`, options: { type: 'error', timeout: 5000 } });
  } finally {
    isInterventionModalOpen.value = false;
  }
};

const close = () => {
  isEditing.value = false;
  activeTab.value = 'details';
  emit('close');
};

const cancelEdit = () => {
  if (isEditing.value) {
    formData.value = JSON.parse(JSON.stringify(props.reporte));
    isEditing.value = false;
  } else {
    close();
  }
};

const saveChanges = async () => {
  if (!formData.value) return;
  isSaving.value = true;
  try {
    const updateData = { ...formData.value };
    delete updateData.total_count;
    delete updateData.short_links;
    delete updateData.instrumentador_nombre;
    const { id, created_at, token, url_firma, instrumentadores, ...finalUpdateData } = updateData;
    const { error } = await supabase.from('reportes').update(finalUpdateData).eq('id', id);
    if (error) throw error;
    // --- CAMBIO: Se usa el composable para notificaciones ---
    showSuccessToast('Reporte actualizado con éxito.');
    emit('updated');
    close();
  } catch (err) {
    // --- CAMBIO: Se usa el composable para notificaciones de error ---
    showErrorToast(err, 'Error al actualizar el reporte.');
  } finally {
    isSaving.value = false;
  }
};

const isGeneratingPdf = ref(false);
const pdfComponentRef = ref(null);

const generatePDF = async () => {
  if (!props.reporte) return;
  isGeneratingPdf.value = true;
  try {
    const { data: version, error: rpcError } = await supabase.rpc('log_pdf_generation', {
      p_reporte_id: props.reporte.id
    });
    if (rpcError) throw rpcError;
    currentPdfVersion.value = version;
    // --- CAMBIO: Se usa el composable para notificaciones ---
    showSuccessToast(`Generando PDF Versión ${version}...`);
    await new Promise(resolve => setTimeout(resolve, 50));
    const pdfElement = pdfComponentRef.value?.pdfTemplateRef;
    if (!pdfElement) throw new Error("Elemento de PDF no encontrado.");
    const canvas = await html2canvas(pdfElement, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    let imgHeight = pdfWidth / ratio;
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, imgHeight);
    pdf.save(`Reporte-${props.reporte.id_cirugia || props.reporte.id}-V${version}.pdf`);
  } catch (error) {
    console.error("Error al generar el PDF:", error);
    // --- CAMBIO: Se usa el composable para notificaciones de error ---
    showErrorToast(error, 'Hubo un error al generar el PDF.');
  } finally {
    isGeneratingPdf.value = false;
  }
};

const downloadSignature = () => {
  if (!formData.value?.url_firma) return;
  fetch(formData.value.url_firma)
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `firma-${formData.value.id_cirugia || formData.value.id}.webp`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    })
    // --- CAMBIO: Se usa el composable para notificaciones de error ---
    .catch(() => showErrorToast('No se pudo descargar la firma.'));
};

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' hs';
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