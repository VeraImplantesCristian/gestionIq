<!-- src/components/shared/EvidenceViewer.vue (VERSIÓN FINAL Y OPTIMIZADA) -->
<template>
  <div class="evidence-viewer-container">
    <h4 class="viewer-title">Archivos Adjuntos:</h4>
    
    <div v-if="!files || files.length === 0" class="empty-state">
      <p>No se han subido archivos para este control.</p>
    </div>

    <div v-else class="thumbnails-gallery">
      <div v-for="(file, index) in imageFiles" :key="file.id || file.object_key" class="thumbnail-card">
        
        <button @click="openLightbox(index)" class="thumbnail-button">
          <img
            :src="getThumbnailUrl(file.object_key)"
            :alt="file.file_name"
            class="thumbnail-image"
            @error="handleImageError($event, getPublicUrl(file.object_key))"
          />
        </button>

        <p class="thumbnail-caption">{{ file.file_name }}</p>
      </div>
    </div>

    <VueEasyLightbox
      :visible="isLightboxVisible"
      :imgs="lightboxImages"
      :index="activePhotoIndex"
      @hide="closeLightbox"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';

const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  }
});

const activePhotoIndex = ref(0);
const isLightboxVisible = ref(false);

const openLightbox = (index) => {
  activePhotoIndex.value = index;
  isLightboxVisible.value = true;
};
const closeLightbox = () => {
  isLightboxVisible.value = false;
};

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const imageFiles = computed(() => 
  props.files
    .filter(file => file.content_type && file.content_type.startsWith('image/'))
    .map(file => ({
      ...file,
      url: getPublicUrl(file.object_key),
      caption: file.file_name
    }))
);

const lightboxImages = computed(() => imageFiles.value.map(file => file.url));

const getPublicUrl = (objectKey) => {
  if (!R2_PUBLIC_URL || !objectKey) return '';
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

// ** LA SOLUCIÓN CLAVE ESTÁ AQUÍ **
// La función ahora es más inteligente y solo intenta cargar miniaturas para formatos conocidos.
const getThumbnailUrl = (objectKey) => {
  if (!objectKey) return '';
  
  const lowerCaseKey = objectKey.toLowerCase();
  
  // Solo intentamos generar una URL de miniatura si el archivo es un JPG/JPEG.
  // Para otros formatos (PNG, etc.), cargamos el original directamente para evitar errores.
  if (!lowerCaseKey.endsWith('.jpg') && !lowerCaseKey.endsWith('.jpeg')) {
    return getPublicUrl(objectKey);
  }

  const lastDotIndex = objectKey.lastIndexOf('.');
  if (lastDotIndex === -1) {
    return getPublicUrl(objectKey); // Fallback por si no tiene extensión
  }

  const baseName = objectKey.substring(0, lastDotIndex);
  const thumbKey = `${baseName}_thumb.webp`;
  return `${R2_PUBLIC_URL}/${thumbKey}`;
};

const handleImageError = (event, originalUrl) => {
  if (event.target.src !== originalUrl) {
    console.warn(`[EvidenceViewer] Falló la carga de la miniatura. Intentando cargar original: ${originalUrl}`);
    event.target.src = originalUrl;
  }
};
</script>

<style scoped>
.thumbnail-button { display: block; width: 100px; height: 100px; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center; background-color: #f7fafc; border: 1px solid #e2e8f0; padding: 0; cursor: pointer; transition: transform 0.2s ease; }
.thumbnail-button:hover { transform: scale(1.05); }
.evidence-viewer-container { width: 100%; margin-top: 1rem; }
.viewer-title { font-size: 0.875rem; font-weight: 600; margin-bottom: 0.75rem; color: #4a5568; }
.empty-state { font-size: 0.875rem; padding: 1rem; border-radius: 8px; text-align: center; color: #718096; border: 1px dashed #e2e8f0; }
.thumbnails-gallery { display: flex; gap: 0.75rem; overflow-x: auto; padding: 0.5rem; scrollbar-width: thin; scrollbar-color: #a0aec0 #e2e8f0; }
.thumbnails-gallery::-webkit-scrollbar { height: 8px; }
.thumbnails-gallery::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; }
.thumbnails-gallery::-webkit-scrollbar-thumb { background-color: #a0aec0; border-radius: 10px; border: 2px solid #e2e8f0; }
.thumbnail-card { flex-shrink: 0; width: 100px; text-align: center; }
.thumbnail-image { width: 100%; height: 100%; object-fit: cover; }
.thumbnail-caption { font-size: 0.75rem; margin-top: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #4a5568; }
</style>