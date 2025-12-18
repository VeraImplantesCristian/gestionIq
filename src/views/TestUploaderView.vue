<!-- src/views/TestUploaderView.vue -->
<template>
  <div class="test-page">
    <h1>Página de Pruebas para Uploader</h1>
    <p>
      Esta página sirve para probar el flujo completo de subida de imágenes a Backblaze B2.
    </p>
    <div class="uploader-wrapper">
      <!-- Usamos el componente pasándole props de prueba -->
      <ImageUploader area="logistica" owner-id="test-user-001" />
    </div>
  </div>
</template>

<script setup>
// Importamos el componente que queremos probar
import ImageUploader from '../components/uploader/ImageUploader.vue'; // Ojo a la nueva ruta
</script>

<style scoped>
.test-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  font-family: sans-serif;
}
.uploader-wrapper {
  margin-top: 2rem;
  padding: 2rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f9f9f9;
}
</style>