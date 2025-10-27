<!-- src/App.vue -->
<template>
  <div id="app">
    <!-- 
      Verificamos si la ruta actual tiene una meta-propiedad 'requiresAuth'.
      Esta es nuestra señal para usar el layout de administración.
      Si no la tiene (como en /login o /ficha/:token), simplemente renderiza la vista.
    -->
    <AdminLayout v-if="$route.meta.requiresAuth">
      <router-view />
    </AdminLayout>
    
    <router-view v-else />
  </div>
</template>

<script setup>
// Importamos el nuevo layout que vamos a crear.
// Vue y Vite son lo suficientemente inteligentes para manejar esto aunque el archivo aún no exista.
import AdminLayout from './layouts/AdminLayout.vue';

// No se necesita más lógica aquí. La magia ocurre en el <template>.
</script>