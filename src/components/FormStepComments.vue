<!-- src/components/FormStepComments.vue -->
<template>
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
        
        <!-- ========= INICIO DE LA SOLUCIÓN: LEYENDA GUÍA ========= -->
        <!--
          Este párrafo sirve como una guía clara para el usuario.
          - 'text-xs': Tamaño de letra pequeño.
          - 'text-slate-500': Color de texto sutil para no ser intrusivo.
          - 'dark:text-slate-400': Adapta el color para el modo oscuro.
          - 'mt-1.5': Añade un pequeño margen superior para separarlo del campo.
        -->
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
          Por favor, detallar cada ítem en una línea nueva. Ej: "1 x Placa de tibia proximal", "6 x Tornillos corticales 5mm".
        </p>
        <!-- ========= FIN DE LA SOLUCIÓN ========= -->

        <p v-if="errors.consumo_realizado" class="text-sm text-red-500 mt-1">{{ errors.consumo_realizado }}</p>
      </div>
      <div>
        <label for="observaciones" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Comentarios / Observaciones a mejorar</label>
        <textarea 
          id="observaciones" 
          :value="formData.observaciones"
          @input="updateFormData({ observaciones: $event.target.value })"
          rows="4" 
          class="form-input mt-2"
          placeholder="Cualquier comentario es importante para nosotros..."
        ></textarea>
      </div>
    </div>

    <!-- Logística y Datos Adicionales -->
    <div class="space-y-6 pt-6 border-t border-slate-200/70 dark:border-slate-700/60">
      <h3 class="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100">Datos de Cierre</h3>
      
      <div>
        <label class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">
          Logística <span class="text-red-500">*</span>
        </label>
        <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button 
            type="button"
            @click="updateFormData({ tipo_logistica: 'con_logistica' })"
            :class="['segmented-button-large', { 'active': formData.tipo_logistica === 'con_logistica' }]"
            :aria-pressed="formData.tipo_logistica === 'con_logistica'"
          >
            <TruckIcon class="h-5 w-5 mr-2" />
            CON Logística
          </button>
          <button 
            type="button"
            @click="updateFormData({ tipo_logistica: 'sin_logistica' })"
            :class="['segmented-button-large', { 'active': formData.tipo_logistica === 'sin_logistica' }]"
            :aria-pressed="formData.tipo_logistica === 'sin_logistica'"
          >
            <BuildingStorefrontIcon class="h-5 w-5 mr-2" />
            SIN Logística
          </button>
        </div>
        <p v-if="errors.tipo_logistica" class="text-sm text-red-500 mt-1">{{ errors.tipo_logistica }}</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label for="transporte" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Transporte utilizado</label>
          <input 
            type="text" 
            id="transporte" 
            :value="formData.transporte_utilizado"
            @input="updateFormData({ transporte_utilizado: $event.target.value })"
            class="form-input mt-2"
            placeholder="Ej: Correo, Moto, etc."
          >
        </div>
        <div>
          <label for="duracion_cirugia" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Duración de la Cirugía</label>
          <input 
            type="text" 
            id="duracion_cirugia" 
            :value="formData.duracion_cirugia"
            @input="updateFormData({ duracion_cirugia: $event.target.value })"
            class="form-input mt-2" 
            placeholder="Ej: 2hs 30min"
          >
        </div>
      </div>
       <div>
        <label for="representante" class="block text-[15px] md:text-base font-medium text-slate-800 dark:text-slate-200">Representante de ventas</label>
        <input 
          type="text" 
          id="representante" 
          :value="formData.representante_ventas"
          @input="updateFormData({ representante_ventas: $event.target.value })"
          class="form-input mt-2"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { TruckIcon, BuildingStorefrontIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  formData: { type: Object, required: true },
  errors: { type: Object, default: () => ({}) }
});
const emit = defineEmits(['update:form-data']);

const updateFormData = (payload) => {
  emit('update:form-data', payload);
};
</script>

<style scoped>
.form-input {
  @apply block w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-300/70 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500;
}
textarea.form-input {
  @apply h-auto py-2;
}
.segmented-button-large {
  @apply w-full md:w-auto flex items-center justify-center h-11 px-4 rounded-xl text-sm font-semibold ring-1 ring-inset transition-colors;
  @apply ring-slate-300 dark:ring-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800;
}
.segmented-button-large.active {
  @apply bg-blue-600 text-white ring-blue-600;
}
</style>