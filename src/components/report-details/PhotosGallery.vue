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
        @delete="requestDeletePhoto"
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

    <Transition name="modal-fade">
      <div v-if="photoPendingDelete" class="confirm-backdrop" @click.self="cancelDeletePhoto">
        <div class="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-photo-title">
          <div class="confirm-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <div class="confirm-content">
            <h4 id="delete-photo-title">Eliminar evidencia</h4>
            <p>
              Se eliminara <strong>{{ photoPendingDelete.caption }}</strong>. Esta accion no se puede deshacer.
            </p>
          </div>
          <div class="confirm-actions">
            <button type="button" class="cancel-button" @click="cancelDeletePhoto">Cancelar</button>
            <button
              type="button"
              class="delete-button"
              :disabled="deleteCountdown > 0"
              @click="confirmDeletePhoto"
            >
              {{ deleteCountdown > 0 ? `Eliminar en ${deleteCountdown}s` : 'Eliminar' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
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
const photoPendingDelete = ref(null);
const deleteCountdown = ref(0);
let deleteTimer = null;
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
onUnmounted(() => {
  clearDeleteTimer();
});

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

const clearDeleteTimer = () => {
  if (deleteTimer) {
    clearInterval(deleteTimer);
    deleteTimer = null;
  }
};

const requestDeletePhoto = (photoId) => {
  const selectedPhoto = photos.value.find(p => p.id === photoId);
  if (!selectedPhoto) return;

  clearDeleteTimer();
  photoPendingDelete.value = selectedPhoto;
  deleteCountdown.value = 2;

  deleteTimer = setInterval(() => {
    if (deleteCountdown.value <= 1) {
      deleteCountdown.value = 0;
      clearDeleteTimer();
      return;
    }

    deleteCountdown.value -= 1;
  }, 1000);
};

const cancelDeletePhoto = () => {
  clearDeleteTimer();
  photoPendingDelete.value = null;
  deleteCountdown.value = 0;
};

const confirmDeletePhoto = () => {
  if (!photoPendingDelete.value || deleteCountdown.value > 0) return;

  handleDeletePhoto(photoPendingDelete.value.id);
  cancelDeletePhoto();
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
.confirm-backdrop { position: fixed; inset: 0; z-index: 60; display: flex; align-items: center; justify-content: center; padding: 1rem; background-color: rgba(15, 23, 42, 0.45); }
.confirm-dialog { width: min(100%, 420px); border-radius: 8px; background-color: #ffffff; box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25); padding: 1.25rem; display: grid; grid-template-columns: auto 1fr; gap: 1rem; }
.confirm-icon { width: 40px; height: 40px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; color: #dc2626; background-color: #fee2e2; }
.confirm-icon svg { width: 24px; height: 24px; }
.confirm-content h4 { margin: 0; font-size: 1rem; font-weight: 700; color: #0f172a; }
.confirm-content p { margin: 0.375rem 0 0; font-size: 0.875rem; line-height: 1.45; color: #475569; }
.confirm-actions { grid-column: 1 / -1; display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.25rem; }
.cancel-button, .delete-button { min-height: 38px; border-radius: 6px; border: 1px solid transparent; padding: 0 1rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s, border-color 0.2s, color 0.2s, opacity 0.2s; }
.cancel-button { background-color: #ffffff; border-color: #cbd5e1; color: #334155; }
.cancel-button:hover { background-color: #f8fafc; }
.delete-button { background-color: #dc2626; color: #ffffff; }
.delete-button:hover:not(:disabled) { background-color: #b91c1c; }
.delete-button:disabled { cursor: not-allowed; opacity: 0.65; }
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.18s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
@media (max-width: 480px) {
  .confirm-dialog { grid-template-columns: 1fr; }
  .confirm-actions { flex-direction: column-reverse; }
  .cancel-button, .delete-button { width: 100%; }
}
</style>
