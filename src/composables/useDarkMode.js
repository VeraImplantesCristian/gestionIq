// src/composables/useDarkMode.js
import { ref, watchEffect } from 'vue';

// Estado reactivo para el modo oscuro
const isDarkMode = ref(false);

// Comprobamos si el navegador es compatible con localStorage
const hasLocalStorage = typeof localStorage !== 'undefined';

// Función para aplicar la clase 'dark' o quitarla del elemento <html>
const applyDarkMode = (value) => {
  if (value) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Función para inicializar el estado del modo oscuro
const initializeDarkMode = () => {
  if (hasLocalStorage) {
    const preference = localStorage.getItem('darkMode');
    if (preference) {
      // Si hay una preferencia guardada, la usamos
      isDarkMode.value = JSON.parse(preference);
    } else {
      // Si no hay preferencia, usamos la del sistema operativo
      isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
  } else {
    // Fallback si no hay localStorage (raro en navegadores modernos)
    isDarkMode.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyDarkMode(isDarkMode.value);
};

// Llama a la inicialización la primera vez que se importa el composable
initializeDarkMode();

export function useDarkMode() {
  // Función para alternar el modo oscuro
  const toggleDarkMode = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  // Observador que reacciona a los cambios en isDarkMode
  watchEffect(() => {
    applyDarkMode(isDarkMode.value);
    // Guarda la preferencia en localStorage cada vez que cambia
    if (hasLocalStorage) {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode.value));
    }
  });

  // Exportamos el estado y la función para que los componentes los usen
  return {
    isDarkMode,
    toggleDarkMode,
  };
}