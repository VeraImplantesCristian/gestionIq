<!-- src/components/IdentificationWizard.vue -->
<template>
  <div class="bg-slate-800 p-8 rounded-2xl shadow-lg w-full max-w-lg mx-auto border border-slate-700">
    <!-- Indicador de Pasos (Wizard) -->
    <div class="flex justify-between items-center mb-8">
      <div class="step active"><span>1</span> Identificación</div>
      <div class="step-separator"></div>
      <div class="step"><span>2</span> Ficha</div>
      <div class="step-separator"></div>
      <div class="step"><span>3</span> Confirmación</div>
    </div>

    <div class="text-center mb-6">
      <img src="/1.svg" alt="Logo Districorr" class="h-12 mx-auto mb-2">
      <h2 class="text-2xl font-bold text-slate-100">Identificación del Profesional</h2>
      <p class="text-slate-400 mt-1">Por favor, ingrese su DNI para continuar.</p>
    </div>
    
    <div class="space-y-4">
      <div>
        <label for="dni" class="block text-sm font-medium text-slate-300">DNI</label>
        <div class="relative mt-1">
          <input type="text" id="dni" v-model="dni" placeholder="Ej: 25.123.456" required 
                 @keyup.enter="checkDni"
                 class="w-full p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-lg text-slate-100 focus:ring-blue-500 focus:border-blue-500" 
                 :class="{ 'border-red-500': dniError, 'border-green-500': instrumentadorFound }">
          
          <div v-if="isCheckingDni || dniError || instrumentadorFound !== null" class="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button v-if="instrumentadorFound !== null" @click="resetIdentification" class="mr-2 text-slate-400 hover:text-white">
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <svg v-if="isCheckingDni" class="animate-spin h-5 w-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            <svg v-else-if="dniError" class="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" /></svg>
            <svg v-else-if="instrumentadorFound" class="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          </div>
        </div>
        <p v-if="dniError" class="text-red-500 text-sm mt-1">{{ dniError }}</p>
      </div>

      <button v-if="instrumentadorFound === null" @click="checkDni" :disabled="isCheckingDni || dni.length < 7" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-blue-700 disabled:bg-slate-400 flex items-center justify-center">
        <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        <span>Identificar</span>
      </button>

      <Transition name="fade">
        <div v-if="instrumentadorFound !== null" class="space-y-6 pt-6 border-t border-slate-700">
          <!-- Caso: Instrumentador Nuevo -->
          <div v-if="!instrumentadorFound" class="space-y-4">
            <label for="nombre" class="block text-sm font-medium text-slate-300">Nombre y Apellido</label>
            <p class="text-xs text-slate-400 -mt-3">Es tu primera vez. Por favor, registra tu nombre completo.</p>
            <input type="text" id="nombre" v-model="nombreCompleto" placeholder="Ej: Juan Pérez" required class="w-full p-3 bg-slate-700 border-slate-600 rounded-md shadow-sm text-lg text-slate-100 focus:ring-blue-500 focus:border-blue-500">
            <button @click="registerAndProceed" :disabled="!nombreCompleto.trim() || isSaving" class="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-green-700 disabled:bg-slate-400 flex items-center justify-center">
              <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>Guardar y Continuar</span>
            </button>
          </div>
          
          <!-- Caso: Instrumentador Encontrado -->
          <div v-else class="space-y-6">
            <div class="p-3 bg-emerald-500/10 rounded-md text-center">
              <p class="text-lg text-emerald-300">¡Bienvenido/a, <strong class="font-bold">{{ instrumentador.nombre_completo }}</strong>! 👋</p>
            </div>

            <div class="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <h3 class="text-sm font-semibold text-white mb-3 text-center">Confirmación de Datos Bancarios</h3>
              <div class="space-y-2 text-xs">
                <div class="flex justify-between items-center border-b border-slate-600 py-1.5"><span class="font-semibold text-slate-300">CUIT:</span><span class="font-mono text-white">{{ instrumentador.cuil || 'No cargado' }}</span></div>
                <div class="flex justify-between items-center border-b border-slate-600 py-1.5"><span class="font-semibold text-slate-300">CBU:</span><span class="font-mono text-white">{{ instrumentador.cbu || 'No cargado' }}</span></div>
                <div class="flex justify-between items-center border-b border-slate-600 py-1.5"><span class="font-semibold text-slate-300">Alias:</span><span class="font-mono text-white">{{ instrumentador.alias_bancario || 'No cargado' }}</span></div>
                <div class="flex justify-between items-center py-1.5"><span class="font-semibold text-slate-300">Banco:</span><span class="font-mono text-white">{{ instrumentador.banco || 'No cargado' }}</span></div>
              </div>
            </div>

            <div class="text-center">
              <p class="text-md font-semibold text-green-400 mb-3">¿Estos datos son correctos?</p>
              <div class="flex flex-col sm:flex-row gap-4 justify-center">
                <button @click="proceed" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-blue-700">✅ Sí, continuar</button>
                <button @click="requestUpdate" class="w-full bg-red-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-red-700">❌ No, solicitar actualización</button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { supabase } from '../services/supabase.js';

const emit = defineEmits(['identification-complete', 'request-update']);

const dni = ref('');
const nombreCompleto = ref('');
const instrumentador = ref(null);
const instrumentadorFound = ref(null);
const isCheckingDni = ref(false);
const isSaving = ref(false);
const dniError = ref('');

const DNI_STORAGE_KEY = 'gestion-iq-dni';

onMounted(() => {
  const savedDni = localStorage.getItem(DNI_STORAGE_KEY);
  if (savedDni) {
    dni.value = savedDni;
  }
});

const saveDniToStorage = (dniToSave) => {
  localStorage.setItem(DNI_STORAGE_KEY, dniToSave);
};

const resetIdentification = () => {
  dni.value = '';
  instrumentador.value = null;
  instrumentadorFound.value = null;
  dniError.value = '';
  localStorage.removeItem(DNI_STORAGE_KEY);
};

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

const checkDni = async () => {
  dniError.value = '';
  instrumentadorFound.value = null;
  const cleanDni = dni.value.replace(/\D/g, '');
  if (cleanDni.length < 7) {
    dniError.value = 'Por favor, ingrese un DNI válido.';
    return;
  }
  isCheckingDni.value = true;
  try {
    const { data, error } = await supabase.from('instrumentadores').select('*').eq('dni', cleanDni).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      instrumentador.value = data;
      instrumentadorFound.value = true;
      saveDniToStorage(dni.value);
    } else {
      instrumentadorFound.value = false;
    }
  } catch (err) {
    dniError.value = 'Error al verificar DNI. Intente de nuevo.';
  } finally {
    isCheckingDni.value = false;
  }
};

const registerAndProceed = async () => {
  isSaving.value = true;
  try {
    const cleanDni = dni.value.replace(/\D/g, '');
    const newInstrumentador = { dni: cleanDni, nombre_completo: nombreCompleto.value.trim() };
    const { data, error } = await supabase.from('instrumentadores').insert(newInstrumentador).select().single();
    if (error) throw error;
    saveDniToStorage(dni.value);
    emit('identification-complete', data);
  } catch (err) {
    dniError.value = 'No se pudo registrar. Inténtelo de nuevo.';
  } finally {
    isSaving.value = false;
  }
};

const proceed = () => {
  emit('identification-complete', instrumentador.value);
};

const requestUpdate = () => {
  emit('request-update');
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(10px); }

.step { @apply flex items-center text-slate-500 transition-colors duration-300; }
.step.active { @apply font-bold text-blue-400; }
.step span { @apply h-6 w-6 rounded-full bg-slate-700 text-slate-400 flex items-center justify-center text-xs font-bold mr-2 transition-colors duration-300; }
.step.active span { @apply bg-blue-500 text-white; }
.step-separator { @apply flex-grow h-px bg-slate-700 mx-4; }
</style>