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
        
        <SubmissionSuccess 
          v-else-if="viewState === 'submitted'" 
          :paciente-nombre="reporte.paciente"
          :activity-token="activityToken"
        />

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

const props = defineProps({ 
  token: { type: String, default: null },
  short_code: { type: String, default: null }
});

const viewState = ref('loading');
const reporte = ref(null);
const error = ref(null);
const instrumentador = ref(null);
const activityToken = ref(null);

const fetchReporte = async () => {
  viewState.value = 'loading';
  error.value = null;
  
  try {
    let reporteData;

    if (props.short_code) {
      const { data: linkData, error: linkError } = await supabase
        .from('short_links')
        .select('reporte_id')
        .eq('short_code', props.short_code)
        .single();

      if (linkError || !linkData) {
        throw new Error("El enlace corto no es válido o ha expirado.");
      }

      const { data, error: fetchError } = await supabase
        .from('reportes')
        .select('*')
        .eq('id', linkData.reporte_id)
        .single();
      
      if (fetchError) throw new Error("No se pudo encontrar la cirugía asociada al enlace.");
      reporteData = data;

    } else if (props.token) {
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
      throw new Error("Enlace inválido. No se proporcionó un identificador.");
    }

    reporte.value = reporteData;
    
    if (reporteData.estado === 'Enviado') {
      // Si la ficha ya fue enviada, intentamos generar un token para que el usuario
      // pueda acceder a su historial de todos modos.
      if (reporteData.instrumentador_dni) {
        // Usamos un try/catch separado para que un fallo aquí no rompa la vista.
        try {
          const { data: token } = await supabase.rpc('create_instrumentador_token', {
            p_instrumentador_dni: reporteData.instrumentador_dni
          });
          if (token) activityToken.value = token;
        } catch (e) {
          console.error("No se pudo generar el token para la ficha ya enviada:", e.message);
        }
      }
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

const handleIdentificationComplete = (identifiedInstrumentador) => {
  instrumentador.value = identifiedInstrumentador;
  sessionStorage.setItem('iq_instrumentador', JSON.stringify(identifiedInstrumentador));
  viewState.value = 'form_display';
};

const handleSuccess = async () => {
  sessionStorage.removeItem('iq_instrumentador');
  
  // La lógica de generación de token ahora está dentro de un try/catch.
  // Si falla, simplemente se loguea el error y la app continúa.
  try {
    const { data: token, error: tokenError } = await supabase.rpc('create_instrumentador_token', {
      p_instrumentador_dni: instrumentador.value.dni
    });

    if (tokenError) throw tokenError;
    
    activityToken.value = token;
    
  } catch (err) {
    console.error("Error al crear el token de actividad:", err.message);
    // No hacemos nada más, activityToken se quedará en null.
    // El v-if en SubmissionSuccess se encargará de no mostrar un enlace roto.
  }
  
  // El cambio de vista ocurre fuera del try/catch, asegurando que el usuario
  // siempre vea la pantalla de éxito, incluso si la generación del token falla.
  viewState.value = 'submitted';
};

const retryFetch = () => {
  fetchReporte();
};

const requestUpdate = () => {
  window.open('https://wa.me/543794316450', '_blank');
};

onMounted(() => {
  sessionStorage.removeItem('iq_instrumentador');
  fetchReporte();
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>