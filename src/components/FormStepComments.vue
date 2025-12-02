<!-- src/components/FormStepComments.vue -->
<template>
  <div>
    <div class="space-y-8">
      <!-- Título de la Sección -->
      <div>
        <h2 class="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Consumo y Observaciones</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Detalle el material utilizado y cualquier otra información relevante.</p>
      </div>

      <!-- Campos de Texto -->
      <div class="space-y-6">
        <div>
          <label for="consumo_realizado" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">
            Consumo realizado en la cirugía <span class="text-red-500">*</span>
          </label>
          <textarea 
            id="consumo_realizado" 
            :value="formData.consumo_realizado"
            @input="updateFormData({ consumo_realizado: $event.target.value })"
            rows="4" 
            class="form-input mt-2"
            placeholder="Ej: 2 tornillos de 4.5mm, 1 placa de titanio..."
          ></textarea>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
            Por favor, detallar cada ítem en una línea nueva. Ej: "1 x Placa de tibia proximal", "6 x Tornillos corticales 5mm".
          </p>
          <p v-if="errors.consumo_realizado" class="text-sm text-red-500 mt-1">{{ errors.consumo_realizado }}</p>
        </div>
        
        <div>
          <label for="observaciones" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">
            ¿Cómo podemos mejorar? Tu feedback es clave
          </label>
          <textarea 
            id="observaciones" 
            :value="formData.observaciones"
            @input="updateFormData({ observaciones: $event.target.value })"
            rows="4" 
            class="form-input mt-2"
            placeholder="Ej: El set de placas llegó sin la guía. / La caja de tornillos estaba abierta. / Sería útil tener una pinza adicional para..."
          ></textarea>
        </div>
      </div>

      <!-- Logística y Datos Adicionales -->
      <div class="space-y-6 pt-6 border-t border-slate-200/70 dark:border-slate-700/60">
        <h3 class="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Datos de Cierre</h3>
        
        <fieldset>
          <legend class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">
            Logística <span class="text-red-500">*</span>
          </legend>
          <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input type="radio" id="con_logistica" name="tipo_logistica" value="con_logistica" :checked="formData.tipo_logistica === 'con_logistica'" @change="updateFormData({ tipo_logistica: 'con_logistica' })" class="sr-only">
              <label for="con_logistica" class="segmented-button-large"><TruckIcon class="h-5 w-5 mr-2" />CON Logística</label>
            </div>
            <div>
              <input type="radio" id="sin_logistica" name="tipo_logistica" value="sin_logistica" :checked="formData.tipo_logistica === 'sin_logistica'" @change="updateFormData({ tipo_logistica: 'sin_logistica' })" class="sr-only">
              <label for="sin_logistica" class="segmented-button-large"><BuildingStorefrontIcon class="h-5 w-5 mr-2" />SIN Logística</label>
            </div>
          </div>
          <p v-if="errors.tipo_logistica" class="text-sm text-red-500 mt-1">{{ errors.tipo_logistica }}</p>
        </fieldset>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label for="transporte" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Transporte utilizado</label>
            <input type="text" id="transporte" :value="formData.transporte_utilizado" @input="updateFormData({ transporte_utilizado: $event.target.value })" class="form-input mt-2" placeholder="Ej: Moto, Correo Andreani, etc.">
          </div>
          <div>
            <label for="duracion_cirugia" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Duración de la Cirugía</label>
            <input type="text" id="duracion_cirugia" :value="formData.duracion_cirugia" @input="updateFormData({ duracion_cirugia: $event.target.value })" class="form-input mt-2" placeholder="Ej: 2 horas 30 minutos">
          </div>
        </div>
        
        <div>
          <label for="representante" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Representante de ventas</label>
          <button 
            type="button"
            id="representante"
            @click="isRepModalOpen = true"
            class="form-input mt-2 text-left w-full flex items-center justify-between"
          >
            <span :class="{ 'text-slate-400 dark:text-slate-500': !formData.representante_ventas }">
              {{ formData.representante_ventas || 'Seleccionar un representante...' }}
            </span>
            <ChevronUpDownIcon class="h-5 w-5 text-slate-400" />
          </button>
        </div>
      </div>
    </div>

    <SalesRepresentativeModal 
      :show="isRepModalOpen" 
      @close="isRepModalOpen = false"
      @select="handleRepresentativeSelect"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { TruckIcon, BuildingStorefrontIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline';
import SalesRepresentativeModal from './SalesRepresentativeModal.vue';

const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['update:form-data']);

const updateFormData = (payload) => {
  emit('update:form-data', payload);
};

const isRepModalOpen = ref(false);

const handleRepresentativeSelect = (name) => {
  updateFormData({ representante_ventas: name });
  isRepModalOpen.value = false;
};
</script>

<style scoped>
/* ========= INICIO DE LA CORRECCIÓN DE SINTAXIS ========= */
.form-input {
  /* La clase 'dark:placeholder-text-slate-500' fue corregida a 'dark:placeholder:text-slate-500' */
  @apply block w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-300/70 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500;
}
/* ========= FIN DE LA CORRECCIÓN DE SINTAXIS ========= */

textarea.form-input {
  @apply h-auto py-2;
}
.segmented-button-large {
  @apply w-full flex items-center justify-center h-11 px-4 rounded-xl text-sm font-semibold ring-1 ring-inset transition-colors cursor-pointer;
  @apply ring-slate-300 dark:ring-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800;
}
input[type="radio"]:checked + label.segmented-button-large {
  @apply bg-blue-600 text-white ring-blue-600;
}
input[type="radio"]:focus-visible + label.segmented-button-large {
  @apply ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-900;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>