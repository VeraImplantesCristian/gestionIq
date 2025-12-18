<!-- src/components/report-details/PhotoLightbox.vue -->
<template>
  <!-- 
    Usamos <Teleport> para renderizar el modal directamente en el <body> del HTML.
    Esto es una buena práctica para modales, ya que evita problemas de estilos
    y apilamiento (z-index) con otros componentes.
  -->
  <Teleport to="body">
    <!-- 
      El overlay oscuro que cubre toda la pantalla.
      - @click.self="close": Cierra el modal solo si se hace clic en el fondo oscuro, no en la imagen.
      - @keydown.esc="close": Cierra el modal si se presiona la tecla Escape.
      - tabindex="0": Permite que el div reciba foco para capturar eventos de teclado.
    -->
    <div class="lightbox-overlay" @click.self="close" @keydown.esc="close" tabindex="0" ref="lightboxRef">
      
      <!-- Botón para cerrar el visor (esquina superior derecha) -->
      <button @click="close" class="close-button" aria-label="Cerrar visor">×</button>

      <!-- Controles de Navegación (Flechas) -->
      <button @click.stop="prevPhoto" class="nav-button prev" aria-label="Foto anterior">‹</button>
      <button @click.stop="nextPhoto" class="nav-button next" aria-label="Foto siguiente">›</button>

      <!-- Contenedor principal de la imagen y sus acciones -->
      <div class="image-container" @click.stop>
        <!-- La imagen grande, cuya URL cambia dinámicamente -->
        <img :src="activePhoto.url" :alt="activePhoto.caption" class="main-image" />

        <!-- Barra de acciones debajo de la imagen -->
        <div class="actions-bar">
          <p class="photo-info">{{ activePhoto.caption }} ({{ currentIndex + 1 }} / {{ photos.length }})</p>
          <a :href="activePhoto.url" download class="download-button">
            <!-- Icono de Descarga -->
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
            Descargar
          </a>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// --- DEFINICIÓN DE PROPS Y EVENTOS ---
const props = defineProps({
  // La lista completa de objetos de fotos para navegar.
  photos: { type: Array, required: true },
  // El índice de la foto en la que se hizo clic para empezar.
  startIndex: { type: Number, default: 0 }
});

// Evento para notificar al padre que el modal debe cerrarse.
const emit = defineEmits(['close']);

// --- ESTADO INTERNO ---
// El índice actual de la foto que se está mostrando.
const currentIndex = ref(props.startIndex);
// Referencia al contenedor principal para poder hacerle foco.
const lightboxRef = ref(null);

// --- PROPIEDADES COMPUTADAS ---
// Devuelve el objeto de la foto activa basado en el currentIndex.
// Es reactivo, así que cuando currentIndex cambia, activePhoto también lo hace.
const activePhoto = computed(() => props.photos[currentIndex.value]);

// --- MÉTODOS ---
const close = () => {
  emit('close');
};

const nextPhoto = () => {
  // Usa el operador de módulo (%) para crear un bucle. Si llega al final, vuelve al principio.
  currentIndex.value = (currentIndex.value + 1) % props.photos.length;
};

const prevPhoto = () => {
  // Lógica similar para retroceder, asegurando que el índice nunca sea negativo.
  currentIndex.value = (currentIndex.value - 1 + props.photos.length) % props.photos.length;
};

// --- MANEJO DE EVENTOS DEL CICLO DE VIDA Y TECLADO ---
const handleKeydown = (e) => {
  if (e.key === 'ArrowRight') {
    nextPhoto();
  } else if (e.key === 'ArrowLeft') {
    prevPhoto();
  }
};

// Se ejecuta cuando el componente se monta en el DOM.
onMounted(() => {
  // Hacemos foco en el contenedor para que escuche las teclas.
  lightboxRef.value?.focus();
  // Añadimos un listener global para las teclas.
  window.addEventListener('keydown', handleKeydown);
});

// Se ejecuta justo antes de que el componente se desmonte.
onUnmounted(() => {
  // Limpiamos el listener para evitar fugas de memoria.
  window.removeEventListener('keydown', handleKeydown);
});
</script>

<style scoped>
.lightbox-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0, 0, 0, 0.85); display: flex; align-items: center; justify-content: center; z-index: 2000; outline: none; }
.image-container { position: relative; max-width: 90vw; max-height: 90vh; }
.main-image { display: block; max-width: 100%; max-height: 85vh; border-radius: 4px; }
.close-button { position: absolute; top: 1rem; right: 1rem; font-size: 2.5rem; color: white; background: none; border: none; cursor: pointer; line-height: 1; }
.nav-button { position: absolute; top: 50%; transform: translateY(-50%); font-size: 3rem; color: white; background-color: rgba(0, 0, 0, 0.3); border: none; cursor: pointer; padding: 0 1rem; height: 100px; transition: background-color 0.2s; }
.nav-button:hover { background-color: rgba(0, 0, 0, 0.6); }
.prev { left: 1rem; }
.next { right: 1rem; }
.actions-bar { display: flex; justify-content: space-between; align-items: center; color: white; padding: 0.75rem 0; font-size: 0.9rem; }
.photo-info { text-shadow: 1px 1px 2px rgba(0,0,0,0.5); }
.download-button { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: rgba(255, 255, 255, 0.2); color: white; border-radius: 4px; text-decoration: none; transition: background-color 0.2s; }
.download-button:hover { background-color: rgba(255, 255, 255, 0.4); }
.download-button svg { width: 1.25rem; height: 1.25rem; }
</style>