import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // **ESTA ES LA LÍNEA CLAVE QUE SOLUCIONA EL ERROR**
      // Le decimos a Vite que cuando vea una importación de 'vue',
      // en realidad debe usar el archivo que incluye el compilador.
      vue: 'vue/dist/vue.esm-bundler.js',
    },
  },
})