<!-- src/components/FormStepComments.vue -->
<template>
  <div class="space-y-12">
    <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Paso 2: Comentarios y Datos Adicionales</h2>

    <!-- Grupo 1: Consumo y Observaciones -->
    <div class="space-y-8">
      <div>
        <!-- **MEJORA:** Añadido asterisco de campo obligatorio -->
        <label for="consumo_realizado" class="block text-lg font-medium text-slate-800 dark:text-slate-200">
          Consumo realizado en la cirugía <span class="text-red-500">*</span>
        </label>
        <textarea 
          id="consumo_realizado" 
          v-model="model.consumo_realizado" 
          rows="1" 
          v-autosize
          class="mt-2 block w-full p-3 border border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder="Ej: 2 tornillos de 4.5mm, 1 placa de titanio..."
        ></textarea>
        <p v-if="errors.consumo_realizado" class="text-red-500 text-sm mt-1">{{ errors.consumo_realizado }}</p>
      </div>
      <div>
        <label for="observaciones" class="block text-lg font-medium text-slate-800 dark:text-slate-200">Comentarios / Observaciones</label>
        <textarea 
          id="observaciones" 
          v-model="model.observaciones" 
          rows="1" 
          v-autosize
          class="mt-2 block w-full p-3 border border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 resize-none overflow-hidden dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-400"
          placeholder="Cualquier comentario adicional..."
        ></textarea>
      </div>
    </div>

    <!-- Grupo 2: Logística y Transporte -->
    <div class="space-y-8">
      <div>
        <!-- **MEJORA:** Añadido asterisco de campo obligatorio -->
        <label class="block text-lg font-medium text-slate-800 mb-3 dark:text-slate-200">
          Logística y Transporte <span class="text-red-500">*</span>
        </label>
        <div class="flex items-center space-x-4">
          <ToggleCard label="CON logística" value="con_logistica" v-model="model.tipo_logistica">
            <TruckIcon class="h-6 w-6" />
          </ToggleCard>
          <ToggleCard label="SIN logística" value="sin_logistica" v-model="model.tipo_logistica">
            <BuildingStorefrontIcon class="h-6 w-6" />
          </ToggleCard>
        </div>
        <p v-if="errors.tipo_logistica" class="text-red-500 text-sm mt-2">{{ errors.tipo_logistica }}</p>
      </div>
      <div>
        <label for="transporte" class="block text-lg font-medium text-slate-800 dark:text-slate-200">Transporte utilizado (si aplica)</label>
        <input type="text" id="transporte" v-model="model.transporte_utilizado" class="mt-2 block w-full p-3 border border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
      </div>
    </div>

     <!-- Grupo 3: Representante y Duración -->
    <div class="space-y-8">
       <div>
        <!-- **MEJORA:** Eliminado "(opcional)" -->
        <label for="representante" class="block text-lg font-medium text-slate-800 dark:text-slate-200">Representante de ventas que lo visitó</label>
        <input type="text" id="representante" v-model="model.representante_ventas" class="mt-2 block w-full p-3 border border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100">
      </div>
      <div>
        <!-- **NUEVO:** Campo de duración -->
        <label for="duracion_cirugia" class="block text-lg font-medium text-slate-800 dark:text-slate-200">Duración de la Cirugía (opcional)</label>
        <p class="text-sm text-slate-500 dark:text-slate-400 mb-2">Nos ayuda a comprender si hubo inconvenientes.</p>
        <input type="text" id="duracion_cirugia" v-model="model.duracion_cirugia" class="mt-1 block w-full p-3 border border-slate-300 rounded-md shadow-sm text-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100" placeholder="Ej: 2 horas 30 minutos">
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import vAutosize from '../directives/autosize.js';
import ToggleCard from './ToggleCard.vue';
import { TruckIcon, BuildingStorefrontIcon } from '@heroicons/vue/24/outline';

const props = defineProps({ modelValue: Object, errors: Object });
const emit = defineEmits(['update:modelValue']);
const model = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>