<!-- src/components/EditableField.vue (ACTUALIZADO) -->
<template>
  <div :class="simple ? 'grid grid-cols-2 items-center' : 'grid grid-cols-3 gap-4 py-2 border-b border-slate-200/50 last:border-b-0 dark:border-slate-600/50 items-start'">
    <!-- Etiqueta (Label) -->
    <label v-if="showLabel" :for="label" class="font-semibold text-gray-600 dark:text-slate-300 text-sm pt-1">{{ label }}</label>

    <!-- Contenido (Editable o Solo Lectura) -->
    <div :class="showLabel ? (simple ? 'text-right' : 'col-span-2') : 'col-span-3'">
      <!-- MODO EDICIÓN (Sin cambios) -->
      <template v-if="isEditing">
        <textarea 
          v-if="type === 'textarea'"
          :id="label"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          rows="4"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white sm:text-sm"
        ></textarea>
        <select 
          v-else-if="type === 'boolean'"
          :id="label"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value === 'true')"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white sm:text-sm"
        >
          <option :value="true">Sí</option>
          <option :value="false">No</option>
          <option :value="null">N/A</option>
        </select>
        <input 
          v-else
          :id="label"
          :type="type"
          :value="type === 'date' ? formatDateForInput(modelValue) : modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white sm:text-sm"
        />
      </template>

      <!-- MODO SOLO LECTURA -->
      <template v-else>
        <!-- AHORA SIEMPRE USA displayValue, que es la única fuente de la verdad para formatear -->
        <p class="text-gray-800 dark:text-slate-100 text-sm whitespace-pre-wrap" :class="{'font-bold': isBold}">
          {{ displayValue }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// --- COMIENZO DE CAMBIOS ---

const props = defineProps({
  label: String,
  // 'modelValue' es ahora la única fuente de datos. El prop 'value' fue eliminado.
  modelValue: [String, Number, Boolean, Date, null],
  isEditing: Boolean,
  type: {
    type: String,
    default: 'text'
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  simple: Boolean,
  isBold: Boolean
});

defineEmits(['update:modelValue']);

// 'displayValue' ahora contiene TODA la lógica de formateo, basándose únicamente en modelValue y type.
const displayValue = computed(() => {
  const val = props.modelValue;

  // Manejo de casos vacíos o nulos primero.
  if (val === null || val === undefined || val === '') {
    return 'N/A';
  }

  // Lógica de formateo específica por tipo.
  if (props.type === 'boolean') {
    // Maneja tanto el booleano 'false' como el string 'false'.
    return val && String(val) !== 'false' ? '✅ Sí' : '❌ No';
  }

  if (props.type === 'date') {
    // Comprueba si la fecha es válida antes de intentar formatearla.
    const date = new Date(val);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    // Corrige el problema de zona horaria (timezone) para mostrar la fecha correcta.
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  // Si no es un tipo especial, devuelve el valor tal cual.
  return val;
});

// --- FIN DE CAMBIOS ---

const formatDateForInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toISOString().split('T')[0];
};
</script>