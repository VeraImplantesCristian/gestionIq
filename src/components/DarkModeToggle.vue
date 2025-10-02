<!-- src/components/DarkModeToggle.vue -->
<template>
  <button
    @click="toggleDarkMode"
    class="p-2 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white transition-colors duration-200"
    :aria-label="isDarkMode ? 'Activar modo claro' : 'Activar modo oscuro'"
  >
    <transition name="fade" mode="out-in">
      <!-- Muestra el ícono del sol si el modo oscuro está activo -->
      <svg v-if="isDarkMode" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <!-- Muestra el ícono de la luna si el modo claro está activo -->
      <svg v-else class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
      </svg>
    </transition>
  </button>
</template>

<script setup>
import { useDarkMode } from '../composables/useDarkMode.js';

// Usamos el composable para obtener el estado y la función de toggle
const { isDarkMode, toggleDarkMode } = useDarkMode();
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>