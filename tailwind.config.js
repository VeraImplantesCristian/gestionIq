// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // **ASEGÚRATE DE QUE ESTA LÍNEA ESTÉ ASÍ:**
  // Esto le dice a Tailwind que use la estrategia de clase para el modo oscuro.
  darkMode: 'class',

  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}