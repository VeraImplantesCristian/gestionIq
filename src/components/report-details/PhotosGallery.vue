<!-- src/components/report-details/PhotosGallery.vue -->
<template>
  <div class="photos-gallery-container">
    <!-- 
      Encabezado de la Galería.
      - No se realizan cambios en esta sección.
    -->
    <div v-if="!compact" class="gallery-header">
      <div class="header-info">
        <h3 class="gallery-title">{{ title }}</h3>
        <span class="photo-count">{{ photos.length }} fotos</span>
      </div>
      <PhotoUploader v-if="showUploader" @photos-uploaded="handlePhotosUploaded" />
    </div>

    <!-- Mensaje de carga (sin cambios) -->
    <div v-if="isLoading" class="loading-state">Cargando fotos...</div>
    
    <!-- Grilla de fotos (sin cambios) -->
    <div v-else-if="photos.length > 0" class="gallery-grid">
      <PhotoCard
        v-for="(photo, index) in photos"
        :key="photo.id"
        :photo="photo"
        @view="openLightbox(index)"
        @delete="handleDeletePhoto"
      />
    </div>
    
    <!-- Mensaje si no hay fotos (sin cambios) -->
    <div v-else class="empty-gallery">
      <p>No hay fotos en esta galería todavía.</p>
      <PhotoUploader v-if="showUploader" @photos-uploaded="handlePhotosUploaded" class="mt-4" />
    </div>

    <!-- 
      NUEVO Visor de Fotos Interactivo (Lightbox).
      - Reemplaza al antiguo componente <PhotoLightbox>.
      - :visible: Controla si el visor está abierto o cerrado, vinculado a nuestra variable 'isLightboxOpen'.
      - :imgs: Es la lista de URLs de las imágenes a mostrar. Usamos una propiedad computada para esto.
      - :index: Es el índice de la imagen que se debe mostrar al abrir, vinculado a 'activePhotoIndex'.
      - @hide: Es el evento que se dispara cuando el usuario cierra el visor. Llama a nuestra función 'closeLightbox'.
    -->
    <VueEasyLightbox
      :visible="isLightboxOpen"
      :imgs="lightboxImages"
      :index="activePhotoIndex"
      @hide="closeLightbox"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../../services/supabase';
import PhotoCard from './PhotoCard.vue';
// --- CAMBIO: Se elimina la importación del visor antiguo ---
// import PhotoLightbox from './PhotoLightbox.vue'; 
import PhotoUploader from './PhotoUploader.vue';

// --- CAMBIO: Se importa la nueva biblioteca y sus estilos CSS necesarios ---
import VueEasyLightbox from 'vue-easy-lightbox';
import 'vue-easy-lightbox/dist/external-css/vue-easy-lightbox.css';


const props = defineProps({
  // ID del reporte principal, siempre requerido.
  reportId: { type: [String, Number], required: true },
  // El 'area' para filtrar ('instrumentadores' o 'logistica').
  area: { type: String, required: true },
  // ID opcional para filtrar por un control de logística específico.
  logisticaControlId: { type: [String, Number], default: null },
  // Controla si se muestra el botón de subida.
  showUploader: { type: Boolean, default: true },
  // Título personalizado para la galería.
  title: { type: String, default: '' },
  // Modo compacto para vistas anidadas (como en el timeline).
  compact: { type: Boolean, default: false },
});

// --- ESTADO INTERNO (sin cambios en las variables, se reutilizan) ---
const isLoading = ref(true);
const photos = ref([]); 
const isLightboxOpen = ref(false);
const activePhotoIndex = ref(0);
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// --- CAMBIO: Propiedad computada para adaptar los datos al nuevo visor ---
// La biblioteca 'vue-easy-lightbox' necesita un array simple de strings (las URLs de las imágenes).
// Esta propiedad computada transforma nuestro array de objetos 'photos' a ese formato de forma reactiva.
const lightboxImages = computed(() => photos.value.map(p => p.url));

// --- LÓGICA DE CARGA DE DATOS (sin cambios) ---
const fetchPhotos = async () => {
  isLoading.value = true;
  try {
    let query = supabase
      .from('reporte_evidencias')
      .select('id, object_key, file_name, created_at, content_type')
      .eq('reporte_id', props.reportId)
      .eq('area', props.area)
      .like('content_type', 'image/%');

    if (props.logisticaControlId) {
      query = query.eq('logistica_control_id', props.logisticaControlId);
    }

    const { data, error } = await query;
    if (error) throw error;

    photos.value = data.map(file => ({
      id: file.id,
      url: `${R2_PUBLIC_URL}/${file.object_key}`, 
      caption: file.file_name || 'Evidencia', 
      date: new Date(file.created_at).toLocaleDateString('es-ES'),
    }));
  } catch (error) {
    console.error(`Error al cargar las fotos del área ${props.area}:`, error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchPhotos);

// --- MÉTODOS Y FUNCIONES "GANCHO" ---

// --- CAMBIO: Se corrige y adapta la lógica para abrir el nuevo visor ---
const openLightbox = (index) => {
  // 1. Establece el índice de la foto en la que se hizo clic.
  activePhotoIndex.value = index;
  // 2. Pone la variable de visibilidad en 'true' para mostrar el visor.
  isLightboxOpen.value = true;
};

// --- CAMBIO: Nueva función para manejar el cierre del visor ---
// Esta función es llamada por el evento @hide del componente VueEasyLightbox.
const closeLightbox = () => {
  isLightboxOpen.value = false;
};

const handlePhotosUploaded = (newPhotos) => {
  // TODO: Implementar la lógica de subida real.
  console.log(`Nuevas fotos recibidas para el área ${props.area}:`, newPhotos);
  // Después de subir, se debería llamar a fetchPhotos() para refrescar.
  // fetchPhotos(); 
  alert(`${newPhotos.length} fotos listas para ser subidas (simulación).`);
};

const handleDeletePhoto = (photoId) => {
  // TODO: Implementar la lógica de borrado real.
  console.log(`Eliminar foto ID: ${photoId} del área ${props.area}`);
  photos.value = photos.value.filter(p => p.id !== photoId);
  alert(`Foto ${photoId} eliminada (simulación).`);
};
</script>

<style scoped>
/* Los estilos existentes del componente no necesitan cambios */
.photos-gallery-container { width: 100%; }
.gallery-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
.header-info { display: flex; align-items: baseline; gap: 0.75rem; }
.gallery-title { font-size: 1rem; font-weight: 600; color: #1e293b; }
.photo-count { font-size: 0.875rem; color: #64748b; background-color: #f1f5f9; padding: 0.25rem 0.5rem; border-radius: 9999px; }
.loading-state { text-align: center; padding: 2rem; color: #64748b; }
.gallery-grid { display: grid; gap: 1rem; grid-template-columns: repeat(1, 1fr); }
@media (min-width: 640px) { .gallery-grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .gallery-grid { grid-template-columns: repeat(4, 1fr); } }
.empty-gallery { text-align: center; padding: 2rem; border: 1px dashed #cbd5e1; border-radius: 8px; color: #94a3b8; }
.empty-gallery .mt-4 { margin-top: 1rem; }
</style>