<!-- src/components/EditableField.vue -->
<template>
  <div :class="simple ? 'grid grid-cols-2 items-center' : 'grid grid-cols-3 gap-4 py-2 border-b border-slate-200/50 last:border-b-0 dark:border-slate-600/50 items-start'">
    <!-- Etiqueta (Label) -->
    <label v-if="showLabel" :for="label" class="font-semibold text-gray-600 dark:text-slate-300 text-sm pt-1">{{ label }}</label>

    <!-- Contenido (Editable o Solo Lectura) -->
    <div :class="showLabel ? (simple ? 'text-right' : 'col-span-2') : 'col-span-3'">
      <!-- MODO EDICIÓN -->
      <template v-if="isEditing">
        <!-- Campo de Texto Largo (Textarea) -->
        <textarea 
          v-if="type === 'textarea'"
          :id="label"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          rows="4"
          class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-900 dark:border-slate-600 dark:text-white sm:text-sm"
        ></textarea>
        
        <!-- Selector Booleano (Sí/No) -->
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

        <!-- Campo de Fecha o Texto Normal -->
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
        <p class="text-gray-800 dark:text-slate-100 text-sm whitespace-pre-wrap" :class="{'font-bold': isBold}">
          {{ formatDisplayValue(modelValue) }}
        </p>
      </template>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  label: String,
  modelValue: [String, Number, Boolean, Date],
  isEditing: Boolean,
  type: {
    type: String,
    default: 'text' // text, textarea, boolean, date
  },
  showLabel: {
    type: Boolean,
    default: true
  },
  simple: Boolean,
  isBold: Boolean
});

defineEmits(['update:modelValue']);

// Formatea el valor para mostrarlo en modo de solo lectura.
const formatDisplayValue = (value) => {
  if (value === null || value === undefined || value === '') return 'N/A';
  if (props.type === 'boolean') return value ? '✅ Sí' : '❌ No';
  if (props.type === 'date') {
    const date = new Date(value);
    // Sumamos un día para corregir el problema de zona horaria al mostrar.
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }
  return value;
};

// Formatea la fecha para que el <input type="date"> la entienda.
const formatDateForInput = (value) => {
  if (!value) return '';
  const date = new Date(value);
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  return adjustedDate.toISOString().split('T')[0];
};
</script>