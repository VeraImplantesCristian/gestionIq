<!-- src/views/FichaView.vue -->
<template>
  <div class="min-h-screen w-full bg-gradient-to-b from-blue-50 to-white flex flex-col items-center p-4 sm:p-8 lg:p-12 dark:bg-slate-900">
    
    <div class="w-full max-w-4xl">
      <Transition name="fade" mode="out-in">
        
        <div v-if="viewState === 'loading'" class="text-center mt-16">
          <svg class="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <p class="text-lg text-gray-600 mt-4 dark:text-slate-400">Cargando datos...</p>
        </div>
        
        <div v-else-if="viewState === 'error'" class="max-w-lg mx-auto bg-red-50 border-l-4 border-red-400 text-red-700 p-4 rounded-md shadow-md flex items-center space-x-4">
          <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path></svg>
          <p>{{ error }}</p>
        </div>
        
        <SubmissionSuccess 
          v-else-if="viewState === 'submitted' && reporte"
          :paciente-nombre="reporte.paciente" 
        />
        
        <!-- **VISTA DE IDENTIFICACIÓN REDISEÑADA** -->
        <div v-else-if="viewState === 'identification'" class="bg-white p-8 rounded-2xl shadow-md w-full max-w-lg mx-auto dark:bg-slate-800">
           <div class="text-center mb-6">
             <img src="/1.svg" alt="Logo Districorr" class="h-12 mx-auto mb-2">
             <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Identificación del Profesional</h2>
             <p class="text-slate-500 mt-1 dark:text-slate-400">Por favor, ingrese su DNI para continuar.</p>
           </div>
          
           <!-- Formulario de DNI -->
           <div class="space-y-4">
            <div>
              <label for="dni" class="block text-sm font-medium text-slate-700 dark:text-slate-300">DNI</label>
              <div class="relative mt-1">
                <!-- **CAMBIO:** Eliminado el @blur, deshabilitado si ya se verificó -->
                <input type="text" id="dni" v-model="dni" placeholder="Ej: 25.123.456" required 
                       class="w-full p-3 border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" 
                       :class="dniError ? 'border-red-500' : ''"
                       :disabled="instrumentadorFound !== null">
              </div>
              <p v-if="dniError" class="text-red-500 text-sm mt-1">{{ dniError }}</p>
            </div>

            <!-- **NUEVO:** Botón de verificación que aparece si el DNI no ha sido verificado -->
            <button v-if="instrumentadorFound === null" @click="checkDni" :disabled="isCheckingDni || dni.length < 7" 
                    class="w-full bg-slate-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center">
              <svg v-if="isCheckingDni" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span>{{ isCheckingDni ? 'Verificando...' : 'Verificar DNI' }}</span>
            </button>

            <!-- Contenido dinámico que aparece DESPUÉS de la verificación -->
            <Transition name="fade">
              <div v-if="instrumentadorFound !== null" class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                <div v-if="!instrumentadorFound">
                  <label for="nombre" class="block text-sm font-medium text-slate-700 dark:text-slate-300">Nombre y Apellido</label>
                  <p class="text-xs text-slate-500 mb-1 dark:text-slate-400">Es tu primera vez. Por favor, registra tu nombre completo.</p>
                  <input type="text" id="nombre" v-model="nombreCompleto" placeholder="Ej: Juan Pérez" required class="w-full p-3 border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
                </div>
                <div v-else class="p-3 bg-emerald-50 border border-emerald-200 rounded-md dark:bg-emerald-500/10 dark:border-emerald-500/20">
                  <p class="text-lg text-emerald-800 dark:text-emerald-300">¡Bienvenido/a, <strong class="font-bold">{{ instrumentador.nombre_completo }}</strong>!</p>
                </div>
                <button @click="proceedToForm" :disabled="!isIdentificationComplete || isSaving" 
                        class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center">
                  <span>{{ isSaving ? 'Guardando...' : (instrumentadorFound ? 'Comenzar Ficha' : 'Registrar y Comenzar') }}</span>
                </button>
              </div>
            </Transition>
          </div>
        </div>
        
        <FichaForm v-else-if="viewState === 'form_display' && reporte && instrumentador" :reporte="reporte" :instrumentador-nombre="instrumentador.nombre_completo" @submit-success="handleSuccess" />
        
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { supabase } from '../services/supabase.js';
import FichaForm from '../components/FichaForm.vue';
import SubmissionSuccess from '../components/SubmissionSuccess.vue';

const props = defineProps({ token: String });
const viewState = ref('loading');
const reporte = ref(null);
const error = ref(null);
const dni = ref('');
const nombreCompleto = ref('');
const instrumentador = ref(null);
const instrumentadorFound = ref(null);
const isCheckingDni = ref(false);
const isSaving = ref(false);
const dniError = ref('');

watch(dni, (newValue, oldValue) => {
  const digits = newValue.replace(/\D/g, '');
  if (digits.length > 8) {
    dni.value = oldValue;
    return;
  }
  let formatted = '';
  if (digits.length > 2) {
    formatted += digits.substring(0, 2) + '.';
    if (digits.length > 5) {
      formatted += digits.substring(2, 5) + '.' + digits.substring(5, 8);
    } else {
      formatted += digits.substring(2);
    }
  } else {
    formatted = digits;
  }
  if (newValue !== formatted) {
    dni.value = formatted;
  }
});

const isIdentificationComplete = computed(() => {
  if (instrumentadorFound.value === true) return true;
  if (instrumentadorFound.value === false && nombreCompleto.value.trim()) return true;
  return false;
});

const handleSuccess = () => {
  viewState.value = 'submitted';
};

const checkDni = async () => {
  dniError.value = '';
  const cleanDni = dni.value.replace(/\D/g, '');
  if (cleanDni.length < 7) {
    dniError.value = 'Por favor, ingrese un DNI válido.';
    return;
  }
  isCheckingDni.value = true;
  try {
    const { data, error } = await supabase.from('instrumentadores').select('dni, nombre_completo').eq('dni', cleanDni).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      instrumentador.value = data;
      instrumentadorFound.value = true;
    } else {
      instrumentadorFound.value = false;
    }
  } catch (err) {
    dniError.value = 'Error al verificar DNI.';
  } finally {
    isCheckingDni.value = false;
  }
};

const proceedToForm = async () => {
  isSaving.value = true;
  try {
    if (!instrumentadorFound.value) {
      const cleanDni = dni.value.replace(/\D/g, '');
      const newInstrumentador = { dni: cleanDni, nombre_completo: nombreCompleto.value.trim() };
      const { data, error } = await supabase.from('instrumentadores').insert(newInstrumentador).select().single();
      if (error) throw error;
      instrumentador.value = data;
    }
    viewState.value = 'form_display';
  } catch (err) {
    error.value = 'No se pudo guardar la información. Inténtelo de nuevo.';
    viewState.value = 'error';
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase.from('reportes').select('*').eq('token', props.token).single();
    if (fetchError) {
      if (fetchError.code === 'PGRST116') throw new Error("El enlace no es válido o ha expirado.");
      throw fetchError;
    }
    if (data) {
      reporte.value = data;
      if (data.estado === 'Enviado') {
        viewState.value = 'submitted';
      } else {
        viewState.value = 'identification';
      }
    } else {
      throw new Error("No se encontró la cirugía asociada a este enlace.");
    }
  } catch (err) {
    error.value = err.message;
    viewState.value = 'error';
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }
</style>