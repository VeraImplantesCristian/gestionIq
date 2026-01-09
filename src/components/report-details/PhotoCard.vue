<!-- src/components/report-details/PhotoCard.vue -->
<template>
  <!-- 
    El contenedor principal de la tarjeta.
    - @mouseover y @mouseleave controlan la visibilidad del menú de acciones.
  -->
  <div class="photo-card" @mouseover="showActions = true" @mouseleave="showActions = false">
    
    <!-- Contenedor de la imagen de miniatura -->
    <div class="thumbnail-wrapper">
      <img :src="photo.url" :alt="photo.caption" class="thumbnail-image" />
      
      <!-- 
        Menú de acciones que aparece al pasar el mouse.
        - Usamos <Transition> para un efecto de aparición suave.
      -->
      <Transition name="fade">
        <div v-if="showActions" class="actions-overlay">
          <button @click.stop="emit('view')" class="action-button" title="Ver en grande">
            <!-- Icono de Ojo -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
          <button @click.stop="handleCopyLink" class="action-button" title="Copiar enlace">
            <!-- Icono de Enlace -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>
          </button>
          <button @click.stop="emit('delete', photo.id)" class="action-button danger" title="Eliminar">
            <!-- Icono de Basura -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.067-2.09 1.02-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
          </button>
        </div>
      </Transition>
    </div>

    <!-- Información debajo de la imagen -->
    <div class="info-footer">
      <p class="photo-caption" :title="photo.caption">{{ photo.caption }}</p>
      <time class="photo-date">{{ photo.date }}</time>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Define las propiedades que el componente espera recibir.
const props = defineProps({
  // 'photo' es un objeto que contiene los datos de la imagen (url, caption, etc.).
  photo: { type: Object, required: true }
});

// Define los eventos que el componente puede emitir hacia su padre.
const emit = defineEmits(['view', 'delete']);

// Estado local para controlar la visibilidad de las acciones.
const showActions = ref(false);

// Función para copiar la URL de la imagen al portapapeles.
const handleCopyLink = () => {
  navigator.clipboard.writeText(props.photo.url);
  // Feedback para el usuario.
  alert('Enlace de la imagen copiado al portapapeles.');
};
</script>

<style scoped>
.photo-card { border-radius: 8px; overflow: hidden; background-color: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: box-shadow 0.2s ease-in-out; }
.photo-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
.thumbnail-wrapper { position: relative; width: 100%; padding-top: 100%; /* Aspect ratio 1:1 */ }
.thumbnail-image { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; }
.actions-overlay { position: absolute; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; gap: 0.75rem; }
.action-button { width: 36px; height: 36px; border-radius: 50%; background-color: rgba(255, 255, 255, 0.8); color: #334155; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background-color 0.2s; }
.action-button:hover { background-color: white; }
.action-button.danger { color: #dc2626; }
.action-button svg { width: 20px; height: 20px; }
.info-footer { padding: 0.75rem; }
.photo-caption { font-weight: 500; font-size: 0.875rem; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.photo-date { font-size: 0.75rem; color: #64748b; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>