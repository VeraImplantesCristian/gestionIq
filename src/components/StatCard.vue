<!-- src/components/StatCard.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md flex items-start space-x-4">
    <div class="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center" :class="iconBgColor">
      <component :is="icon" class="h-6 w-6 text-white" />
    </div>
    <div>
      <p class="text-sm font-medium text-gray-500 dark:text-slate-400 truncate">{{ title }}</p>
      <p class="mt-1 text-3xl font-semibold text-gray-900 dark:text-slate-100">{{ value }}</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  value: { type: [String, Number], required: true },
  // **CAMBIO CLAVE:** Usamos un array de tipos para permitir tanto Objetos como Funciones.
  // Esto hace que la validación de la prop sea más flexible y robusta.
  icon: { type: [Object, Function], required: true },
  iconBgColor: { type: String, default: 'bg-blue-500' }
});
</script>