<!-- src/views/FichaView.vue -->
<template>
  <div class="min-h-screen w-full bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-8">
    <div class="w-full max-w-4xl">
      <Transition name="fade" mode="out-in">
        
        <div v-if="viewState === 'loading'" class="text-center">
          <svg class="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-lg text-slate-400 mt-4">Validando enlace y buscando información del caso...</p>
        </div>
        
        <div v-else-if="viewState === 'error'" class="max-w-lg mx-auto bg-red-500/10 border-l-4 border-red-500 text-red-300 p-4 rounded-md shadow-md flex flex-col items-center space-y-4">
          <div class="flex items-center space-x-3">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
            <p>{{ error }}</p>
          </div>
          <button @click="retryFetch" class="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700">Reintentar</button>
        </div>
        
        <SubmissionSuccess v-else-if="viewState === 'submitted'" :paciente-nombre="reporte.paciente" @view-summary="viewState = 'summary_display'"/>
        <SubmittedSummary v-else-if="viewState === 'summary_display'" :reporte="reporte" />
        <IdentificationWizard v-else-if="viewState === 'identification'" @identification-complete="handleIdentificationComplete" @request-update="requestUpdate"/>
        <FichaForm v-else-if="viewState === 'form_display' && reporte && instrumentador" :reporte="reporte" :instrumentador="instrumentador" @submit-success="handleSuccess" />
        
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';
import IdentificationWizard from '../components/IdentificationWizard.vue';
import FichaForm from '../components/FichaForm.vue';
import SubmissionSuccess from '../components/SubmissionSuccess.vue';
import SubmittedSummary from '../components/SubmittedSummary.vue';

// ========= INICIO DE LA SOLUCIÓN: ACEPTAR AMBOS TIPOS DE PARÁMETROS =========
const props = defineProps({ 
  // El token largo del formato antiguo (opcional).
  token: { type: String, default: null },
  // El código corto del nuevo formato (opcional).
  short_code: { type: String, default: null }
});
// ========= FIN DE LA SOLUCIÓN =========

const viewState = ref('loading');
const reporte = ref(null);
const error = ref(null);
const instrumentador = ref(null);

// ========= INICIO DE LA SOLUCIÓN: LÓGICA DE CARGA "BILINGÜE" =========
const fetchReporte = async () => {
  viewState.value = 'loading';
  error.value = null;
  
  try {
    let reporteData;

    if (props.short_code) {
      // Flujo Nuevo: Link Corto
      // 1. Traducir el short_code a reporte_id.
      const { data: linkData, error: linkError } = await supabase
        .from('short_links')
        .select('reporte_id')
        .eq('short_code', props.short_code)
        .single();

      if (linkError || !linkData) {
        throw new Error("El enlace corto no es válido o ha expirado.");
      }

      // 2. Buscar el reporte usando el reporte_id obtenido.
      const { data, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('id', linkData.reporte_id)
        .single();
      
      if (fetchError) throw new Error("No se pudo encontrar la cirugía asociada al enlace.");
      reporteData = data;

    } else if (props.token) {
      // Flujo Antiguo: Token Largo (se mantiene la lógica original)
      const { data, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('token', props.token)
        .single();
      
      if (fetchError) {
        if (fetchError.code === 'PGRST116') throw new Error("El enlace no es válido o ha expirado.");
        throw new Error("No se pudo conectar con la base de datos.");
      }
      reporteData = data;
    } else {
      // Si no se proporciona ni token ni short_code.
      throw new Error("Enlace inválido. No se proporcionó un identificador.");
    }

    reporte.value = reporteData;
    
    // La lógica de estados se mantiene igual una vez que tenemos los datos del reporte.
    if (reporteData.estado === 'Enviado') {
      viewState.value = 'submitted';
    } else {
      const cachedInstrumentador = sessionStorage.getItem('iq_instrumentador');
      if (cachedInstrumentador) {
        instrumentador.value = JSON.parse(cachedInstrumentador);
        viewState.value = 'form_display';
      } else {
        viewState.value = 'identification';
      }
    }
  } catch (err) {
    error.value = err.message;
    viewState.value = 'error';
  }
};
// ========= FIN DE LA SOLUCIÓN =========

const handleIdentificationComplete = (identifiedInstrumentador) => {
  instrumentador.value = identifiedInstrumentador;
  sessionStorage.setItem('iq_instrumentador', JSON.stringify(identifiedInstrumentador));
  viewState.value = 'form_display';
};

const handleSuccess = () => {
  sessionStorage.removeItem('iq_instrumentador');
  viewState.value = 'submitted';
};

const retryFetch = () => {
  fetchReporte();
};

const requestUpdate = () => {
  window.open('https://wa.me/543794316450', '_blank');
};

// Se ejecuta una sola vez cuando el componente se monta.
onMounted(() => {
  sessionStorage.removeItem('iq_instrumentador');
  fetchReporte();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>