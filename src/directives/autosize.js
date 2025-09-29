// src/directives/autosize.js

// Función para ajustar la altura del textarea
const resize = (el) => {
  el.style.height = 'auto'; // Resetea la altura para recalcular el scrollHeight
  el.style.height = `${el.scrollHeight}px`; // Ajusta la altura al contenido
};

// Definición de la directiva v-autosize
const autosize = {
  // Se llama cuando el elemento se inserta en el DOM
  mounted(el) {
    // Añade un event listener para ajustar la altura cada vez que se escribe
    el.addEventListener('input', () => resize(el));
    // Ajusta la altura inicial por si el textarea ya tiene contenido
    resize(el); 
  },
  // Se llama cuando el elemento se elimina del DOM
  unmounted(el) {
    // Limpia el event listener para evitar memory leaks
    el.removeEventListener('input', () => resize(el));
  },
};

export default autosize;