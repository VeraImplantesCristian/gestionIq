<!-- src/components/shared/EvidenceViewer.vue -->
<template>
  <div class="evidence-viewer-container">
    <h4 class="viewer-title">Archivos Adjuntos:</h4>
    
    <div v-if="!files || files.length === 0" class="empty-state">
      <p>No se han subido archivos para este control.</p>
    </div>

    <div v-else class="thumbnails-gallery">
      <div v-for="(file, index) in imageFiles" :key="file.id || file.object_key" class="thumbnail-card">
        
        <button @click="openLightbox(index)" class="thumbnail-button">
          <!-- Esta línea ahora usa la función corregida para obtener la miniatura -->
          <img
            :src="getThumbnailUrl(file.object_key)"
            :alt="file.file_name"
            class="thumbnail-image"
            @error="handleImageError"
          />
        </button>

        <p class="thumbnail-caption">{{ file.file_name }}</p>
      </div>
    </div>

    <!-- El lightbox para ver la imagen en grande -->
    <PhotoLightbox 
      v-if="isLightboxVisible"
      :photos="imageFiles"
      :start-index="activePhotoIndex"
      @close="closeLightbox"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
// Ruta corregida según tu estructura de carpetas
import PhotoLightbox from '../report-details/PhotoLightbox.vue';

const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  }
});

// --- ESTADO DEL LIGHTBOX ---
const activePhotoIndex = ref(null);
const isLightboxVisible = computed(() => activePhotoIndex.value !== null);

const openLightbox = (index) => {
  activePhotoIndex.value = index;
};
const closeLightbox = () => {
  activePhotoIndex.value = null;
};

// --- LÓGICA DE URLS ---
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// Filtra solo los archivos que son imágenes y les añade la URL completa para el lightbox
const imageFiles = computed(() => 
  props.files
    .filter(file => file.content_type && file.content_type.startsWith('image/'))
    .map(file => ({
      ...file,
      url: getPublicUrl(file.object_key),
      caption: file.file_name
    }))
);

// Devuelve la URL de la imagen ORIGINAL en alta calidad
const getPublicUrl = (objectKey) => {
  if (!R2_PUBLIC_URL || !objectKey) return '';
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

// Construye la URL de la miniatura de forma robusta.
const getThumbnailUrl = (objectKey) => {
  if (!objectKey) return '';
  
  // 1. Busca la posición del ÚLTIMO punto en la ruta del archivo.
  const lastDotIndex = objectKey.lastIndexOf('.');
  
  // 2. Si no hay punto, devuelve la URL original como medida de seguridad.
  if (lastDotIndex === -1) {
    return getPublicUrl(objectKey);
  }
  
  // 3. Extrae el nombre base (todo lo que está antes del último punto).
  const baseName = objectKey.substring(0, lastDotIndex);
  
  // 4. Construye la clave de la miniatura ('_thumb.webp') y la URL completa.
  const thumbKey = `${baseName}_thumb.webp`;
  const finalUrl = `${R2_PUBLIC_URL}/${thumbKey}`;

  // COMENTARIO: Log para ver la URL final que se está renderizando.
  console.log(`[EvidenceViewer] Intentando mostrar miniatura en URL: ${finalUrl}`);

  return finalUrl;
};

// Si la miniatura no carga por alguna razón, intenta cargar la imagen original en su lugar.
const handleImageError = (event) => {
  const originalSrc = event.target.src.replace('_thumb.webp', '');
  // Para evitar un bucle infinito si el original también falla, verificamos que no estemos intentando cargar lo mismo.
  if (event.target.src !== originalSrc) {
    console.warn(`[EvidenceViewer] Falló la carga de la miniatura. Intentando cargar original: ${originalSrc}`);
    event.target.src = originalSrc;
  }
};
</script>

<style scoped>
.thumbnail-button { 
  display: block; 
  width: 100px; 
  height: 100px; 
  border-radius: 8px; 
  overflow: hidden; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background-color: #f7fafc; 
  border: 1px solid #e2e8f0; 
  padding: 0; 
  cursor: pointer; 
  transition: transform 0.2s ease; 
}
.thumbnail-button:hover { 
  transform: scale(1.05); 
}
.evidence-viewer-container { 
  width: 100%; 
  margin-top: 1rem; 
}
.viewer-title { 
  font-size: 0.875rem; 
  font-weight: 600; 
  margin-bottom: 0.75rem; 
  color: #4a5568; 
}
.empty-state { 
  font-size: 0.875rem; 
  padding: 1rem; 
  border-radius: 8px; 
  text-align: center; 
  color: #718096; 
  border: 1px dashed #e2e8f0; 
}
.thumbnails-gallery { 
  display: flex; 
  gap: 0.75rem; 
  overflow-x: auto; 
  padding: 0.5rem; 
  scrollbar-width: thin; 
  scrollbar-color: #a0aec0 #e2e8f0; 
}
.thumbnails-gallery::-webkit-scrollbar { 
  height: 8px; 
}
.thumbnails-gallery::-webkit-scrollbar-track { 
  background: #e2e8f0; 
  border-radius: 10px; 
}
.thumbnails-gallery::-webkit-scrollbar-thumb { 
  background-color: #a0aec0; 
  border-radius: 10px; 
  border: 2px solid #e2e8f0; 
}
.thumbnail-card { 
  flex-shrink: 0; 
  width: 100px; 
  text-align: center; 
}
.thumbnail-image { 
  width: 100%; 
  height: 100%; 
  object-fit: cover; 
}
.thumbnail-caption { 
  font-size: 0.75rem; 
  margin-top: 0.25rem; 
  white-space: nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  color: #4a5568; 
}
</style>