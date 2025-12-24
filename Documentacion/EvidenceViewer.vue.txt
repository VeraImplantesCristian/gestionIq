<!-- src/components/shared/EvidenceViewer.vue (CSS Corregido) -->
<template>
  <div class="evidence-viewer-container">
    <h4 class="viewer-title">Archivos Adjuntos:</h4>
    
    <div v-if="!files || files.length === 0" class="empty-state">
      <p>Aún no se han subido archivos.</p>
    </div>

    <div v-else class="thumbnails-gallery">
      <div v-for="file in files" :key="file.id || file.object_key" class="thumbnail-card">
        
        <a :href="getPublicUrl(file.object_key)" target="_blank" rel="noopener noreferrer">
          <img
            v-if="isImage(file)"
            :src="getPublicUrl(file.object_key)"
            :alt="file.file_name"
            class="thumbnail-image"
          />
          <div v-else class="thumbnail-generic">
            <span>📄</span>
            <p class="file-extension">{{ getFileExtension(file.file_name) }}</p>
          </div>
        </a>

        <p class="thumbnail-caption">{{ file.file_name }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  files: {
    type: Array,
    required: true,
    default: () => []
  }
});

const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

const getPublicUrl = (objectKey) => {
  if (!R2_PUBLIC_URL || !objectKey) return '';
  return `${R2_PUBLIC_URL}/${objectKey}`;
};

const isImage = (file) => {
  return file.content_type && file.content_type.startsWith('image/');
};

const getFileExtension = (fileName) => {
  if (!fileName) return '';
  return fileName.split('.').pop().toUpperCase();
};
</script>

<style scoped>
.evidence-viewer-container {
  width: 100%;
  margin-top: 1rem;
}
.viewer-title {
  font-size: 0.875rem; /* 14px */
  font-weight: 600;
  margin-bottom: 0.75rem;
  /* Estilo por defecto (light mode) */
  color: #4a5568;
}
/* ***** INICIO DE LA CORRECCIÓN ***** */
/* Estilo para modo oscuro */
.dark .viewer-title {
  color: #cbd5e0;
}

.empty-state {
  font-size: 0.875rem;
  padding: 1rem;
  border-radius: 8px;
  text-align: center;
  /* Estilos por defecto (light mode) */
  color: #718096;
  border: 1px dashed #e2e8f0;
}
/* Estilos para modo oscuro */
.dark .empty-state {
  color: #a0aec0;
  border-color: #4a5568;
}

.thumbnails-gallery {
  display: flex;
  gap: 0.75rem; /* 12px */
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
.thumbnail-card a {
  display: block;
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Estilos por defecto (light mode) */
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
}
/* Estilos para modo oscuro */
.dark .thumbnail-card a {
  background-color: #2d3748;
  border-color: #4a5568;
}

.thumbnail-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumbnail-generic {
  font-size: 2rem;
  text-align: center;
}
.file-extension {
  font-size: 0.75rem;
  font-weight: bold;
  color: #718096;
  margin-top: -0.5rem;
}
.thumbnail-caption {
  font-size: 0.75rem; /* 12px */
  margin-top: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Estilo por defecto (light mode) */
  color: #4a5568;
}
/* Estilo para modo oscuro */
.dark .thumbnail-caption {
  color: #cbd5e0;
}
/* ***** FIN DE LA CORRECCIÓN ***** */
</style>