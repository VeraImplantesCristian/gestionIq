<!-- src/components/SubmissionSuccess.vue (con Carga de Evidencia Existente) -->
<template>
  <div class="w-full max-w-lg mx-auto text-center">
    <div class="bg-white p-8 sm:p-12 rounded-2xl shadow-lg dark:bg-slate-800">
      <div class="flex flex-col items-center space-y-6">
        
        <img src="/2.svg" alt="Districorr" class="h-12 opacity-80">
        
        <div class="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
          <svg class="w-12 h-12 text-green-500" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        
        <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
          ¡Ficha Enviada con Éxito!
        </h2>

        <p class="text-base text-slate-600 dark:text-slate-300">
          Gracias por tu compromiso. Tu ficha fue registrada en nuestro sistema.
        </p>

        <div v-if="activityToken" class="text-center">
          <router-link
            :to="{ name: 'ActivitySummary', params: { token: activityToken } }"
            class="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Accedé a tu Resumen de Actividad
          </router-link>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            (Este enlace es personal y válido por 72 hs)
          </p>
        </div>

        <div class="w-full text-left space-y-4 mt-5 border-t border-slate-200 dark:border-slate-700 pt-6">
          
          <div class="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
            <div class="flex items-start gap-3">
              <BanknotesIcon class="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <h3 class="font-bold text-green-800 dark:text-green-300">Información de Pago</h3>
                <p class="text-sm text-green-700 dark:text-green-200 mt-1">
                  Procesaremos tu pago <strong>dentro de los 7 días hábiles</strong> posterior a la recepción y control del material en nuestro depósito. Apreciamos mucho tu trabajo. ¡Gracias! 🤝
                </p>
              </div>
            </div>
          </div>

          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
            <div class="flex flex-col gap-4">
              <div class="flex items-start gap-3">
                <CloudArrowUpIcon class="w-6 h-6 text-blue-500 shrink-0" />
                <div>
                  <h3 class="font-bold text-blue-800 dark:text-blue-300">Importante: Adjuntá tu Evidencia</h3>
                  <p class="text-sm text-blue-700 dark:text-blue-200 mt-1">
                    Para finalizar, subí las fotos de los stickers, remitos y el estado del material. Es tu respaldo y agiliza el control.
                  </p>
                </div>
              </div>
              
              <div>
                <button v-if="!showUploader" @click="showUploader = true" class="inline-flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg">
                  <CloudArrowUpIcon class="w-5 h-5" />
                  <span>Subir Archivos desde la Web</span>
                </button>

                <div v-if="showUploader" class="mt-4">
                  <FileUpload
                    :area="'evidencias'"
                    :owner-id="String(reporteId)"
                    :accepted-file-types="'image/*,application/pdf'"
                    :enable-camera="true"
                    @upload-success="handleUploadSuccess"
                  />
                </div>

                <div v-if="uploadSuccessMessage" class="success-feedback">
                  <p>{{ uploadSuccessMessage }}</p>
                </div>

                <EvidenceViewer :files="uploadedFiles" class="mt-4" />
              </div>

              <div class="flex items-center text-center">
                <div class="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
                <span class="flex-shrink mx-4 text-xs text-slate-500 dark:text-slate-400">o si preferís</span>
                <div class="flex-grow border-t border-slate-300 dark:border-slate-600"></div>
              </div>

              <a
                :href="whatsappUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004-1.035 3.787 3.864-1.025z" /></svg>
                Enviar por WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// ***** CAMBIO 1: Importamos 'onMounted' de Vue *****
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { supabase } from '../services/supabase';
import FileUpload from './uploader/FileUpload.vue';
import EvidenceViewer from './shared/EvidenceViewer.vue';
import { BanknotesIcon, CloudArrowUpIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  pacienteNombre: { type: String, required: true },
  activityToken: { type: String, default: null },
  reporteId: { type: [String, Number], required: true }
});

const toast = useToast();
const showUploader = ref(false);
const uploadedFiles = ref([]);
let uploadSuccessTimer = null;
const uploadSuccessMessage = ref('');

// ***** CAMBIO 2: Nueva función para cargar datos existentes *****
/**
 * Busca en la base de datos si ya existen evidencias para este reporte
 * y las carga en el estado local.
 */
const fetchExistingEvidences = async () => {
  if (!props.reporteId) return;

  try {
    const { data, error } = await supabase
      .from('reporte_evidencias')
      .select('*')
      .eq('reporte_id', props.reporteId)
      .order('created_at', { ascending: true }); // Opcional: ordenar por fecha

    if (error) throw error;

    // Poblamos nuestro array con los archivos encontrados.
    uploadedFiles.value = data || [];
  } catch (error) {
    toast.error("No se pudo cargar la evidencia existente.");
  }
};

// ***** CAMBIO 3: Usamos el hook 'onMounted' *****
// Esta función se ejecutará automáticamente una vez que el componente se monte en la página.
onMounted(() => {
  fetchExistingEvidences();
});

const handleUploadSuccess = async (fileData) => {
  clearTimeout(uploadSuccessTimer);
  try {
    const recordToInsert = {
      reporte_id: props.reporteId,
      object_key: fileData.object_key,
      file_name: fileData.file_name,
      content_type: fileData.content_type,
      size_bytes: fileData.size_bytes,
    };
    const { data, error } = await supabase.from('reporte_evidencias').insert(recordToInsert).select().single();
    if (error) throw error;
    
    // La lógica de añadir el nuevo archivo al array se mantiene.
    uploadedFiles.value.push(data);
    
    uploadSuccessMessage.value = `¡Archivos subidos con éxito! Serán revisados por el equipo. Podés seguir agregando más si es necesario.`;

    uploadSuccessTimer = setTimeout(() => {
      uploadSuccessMessage.value = '';
    }, 5000);

  } catch (error) {
    toast.error(`Error al guardar la evidencia: ${error.message}`);
  }
};

const whatsappUrl = computed(() => {
  const numero = '543794043788';
  const mensaje = `Hola, comparto evidencia del material del paciente ${props.pacienteNombre}.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
});
</script>

<style scoped>
.checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 3; stroke-miterlimit: 10; stroke: #22c55e; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
.checkmark-check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 4; stroke: #22c55e; stroke-linecap: round; stroke-linejoin: round; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
@keyframes stroke { 100% { stroke-dashoffset: 0; } }

.success-feedback {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background-color: #d1fae5;
  border-left: 4px solid #10b981;
  color: #065f46;
  border-radius: 4px;
  font-size: 0.875rem;
}
</style>