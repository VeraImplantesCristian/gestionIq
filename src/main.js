// src/main.js

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toastification' // <-- 1. Importa la librería
import 'vue-toastification/dist/index.css' // <-- 2. Importa los estilos CSS
import './assets/css/tailwind.css'

const app = createApp(App)

app.use(router)
app.use(Toast) // <-- 3. Registra el plugin

app.mount('#app')