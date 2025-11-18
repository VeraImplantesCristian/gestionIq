<!-- src/components/reclamos/FormularioMedicoReclamo.vue -->
<template>
  <div class="w-full max-w-2xl mx-auto">
    <form @submit.prevent="handleSubmit" class="space-y-8">

      <!-- Bloque 1: Tus Datos -->
      <div class="form-section">
        <h3 class="section-title">1. Tus datos</h3>
        <div class="space-y-4">
          <div>
            <label for="nombre_medico" class="form-label">Nombre Completo <span class="text-blue-500">*</span></label>
            <input type="text" id="nombre_medico" v-model="formData.nombre_medico" class="form-input mt-1" />
            <p v-if="errors.nombre_medico" class="form-error">{{ errors.nombre_medico }}</p>
          </div>
          <div>
            <label for="especialidad" class="form-label">Especialidad (opcional)</label>
            <input type="text" id="especialidad" v-model="formData.especialidad" class="form-input mt-1" />
          </div>
          <div>
            <label for="institucion" class="form-label">Institución donde ocurrió (opcional)</label>
            <input type="text" id="institucion" v-model="formData.institucion" class="form-input mt-1" />
          </div>
        </div>
      </div>

      <!-- Bloque 2: Tipo de Inconveniente y Urgencia -->
      <div class="form-section">
        <h3 class="section-title">2. Tipo de inconveniente</h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label for="tipo_reclamo" class="form-label">Categoría <span class="text-blue-500">*</span></label>
            <select id="tipo_reclamo" v-model="formData.tipo_reclamo" class="form-input mt-1">
              <option disabled value="">Seleccione...</option>
              <option v-for="tipo in tiposInconveniente" :key="tipo" :value="tipo">{{ tipo }}</option>
            </select>
            <p v-if="errors.tipo_reclamo" class="form-error">{{ errors.tipo_reclamo }}</p>
          </div>
          <div>
            <label for="urgencia" class="form-label">Urgencia (opcional)</label>
            <select id="urgencia" v-model="formData.severidad" class="form-input mt-1">
              <option v-for="urg in urgencias" :key="urg" :value="urg">{{ urg }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Bloque 3: Descripción -->
      <div class="form-section">
        <h3 class="section-title">3. ¿Qué ocurrió?</h3>
        <div>
          <label for="descripcion_reclamo" class="form-label sr-only">Detalle del inconveniente</label>
          <textarea id="descripcion_reclamo" v-model="formData.descripcion_reclamo" rows="5" class="form-input" placeholder="Cuanto más detalle, mejor podremos ayudarte..."></textarea>
          <p v-if="errors.descripcion_reclamo" class="form-error">{{ errors.descripcion_reclamo }}</p>
        </div>
      </div>

      <!-- Bloque 4: Contacto -->
      <div class="form-section">
        <h3 class="section-title">4. ¿Cómo preferís que te contactemos?</h3>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          <label v-for="option in contactoOptions" :key="option.value" class="contact-option" :class="{'active': formData.contacto_preferido === option.value}">
            <input type="radio" :value="option.value" v-model="formData.contacto_preferido" class="sr-only">
            <span>{{ option.label }}</span>
          </label>
        </div>
      </div>
      
      <!-- Bloque 5: Confirmación y Firma -->
      <div class="form-section">
        <h3 class="section-title">5. Confirmación</h3>
         <div class="mt-1 p-3 border-2 border-dashed rounded-md bg-white dark:bg-slate-900/50 dark:border-slate-700">
          <div v-if="signaturePreviewUrl" class="flex flex-col items-center">
            <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">Firma registrada:</p>
            <img :src="signaturePreviewUrl" alt="Previsualización de la firma" class="h-20 object-contain" />
            <button type="button" @click="$emit('open-signature-modal')" class="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Firmar de nuevo
            </button>
          </div>
          <div v-else class="text-center py-4">
            <button type="button" @click="$emit('open-signature-modal')" class="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 flex items-center gap-2 mx-auto">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" /></svg>
              Tocar aquí para firmar y confirmar
            </button>
          </div>
        </div>
        <p v-if="errors.signature" class="form-error">{{ errors.signature }}</p>
      </div>

      <!-- Botón de Envío -->
      <div class="pt-2">
        <button type="submit" :disabled="isSubmitting" class="submit-button">
          <svg v-if="isSubmitting" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          <span>{{ isSubmitting ? 'Enviando...' : 'Enviar Reporte' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

const props = defineProps({
  isSubmitting: { type: Boolean, default: false },
  signaturePreviewUrl: { type: String, default: null }
});

const emit = defineEmits(['submit', 'open-signature-modal']);

const formData = reactive({
  nombre_medico: '',
  especialidad: '',
  institucion: '',
  tipo_reclamo: '',
  severidad: 'Baja',
  descripcion_reclamo: '',
  contacto_preferido: 'Sin contacto',
});

const errors = reactive({});

const tiposInconveniente = ['Logística', 'Instrumental / Caja', 'Comunicación', 'Administración', 'Otro'];
const urgencias = ['Baja', 'Media', 'Alta'];
const contactoOptions = [
  { label: 'WhatsApp', value: 'WhatsApp' },
  { label: 'Llamada', value: 'Llamada' },
  { label: 'Email', value: 'Email' },
  { label: 'No necesito contacto', value: 'Sin contacto' }
];

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  if (!formData.nombre_medico.trim()) errors.nombre_medico = 'El nombre es requerido.';
  if (!formData.tipo_reclamo) errors.tipo_reclamo = 'Debe seleccionar un tipo de inconveniente.';
  if (!formData.descripcion_reclamo.trim()) errors.descripcion_reclamo = 'La descripción es requerida.';
  return Object.keys(errors).length === 0;
};

const handleSubmit = () => {
  const isFormValid = validateForm();
  // El padre se encargará de validar la firma.
  emit('submit', { formData: { ...formData }, isFormValid, errors });
};
</script>

<style scoped>
.form-section { @apply p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border dark:border-slate-700; }
.section-title { @apply text-base font-semibold text-slate-800 dark:text-slate-200 mb-4; }
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
.form-input { @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white; }
.contact-option { @apply flex items-center justify-center text-center px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-600; }
.contact-option.active { @apply bg-blue-600 text-white border-blue-600 ring-2 ring-blue-500; }
.form-error { @apply mt-2 text-sm text-red-500; }
.submit-button { @apply w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-slate-400 disabled:cursor-not-allowed; }
</style>