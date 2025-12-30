<!-- src/components/ArchivoCard.vue -->
<template>
  <!-- El componente raíz es un enlace que abre el archivo en una nueva pestaña. -->
  <a 
    :href="fileUrl" 
    target="_blank" 
    rel="noopener noreferrer"
    class="group block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
  >
    <!-- Sección de la Vista Previa (Imagen o Ícono) -->
    <div class="aspect-video bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
      <!-- Si el archivo es una imagen, muestra la miniatura. -->
      <img 
        v-if="archivo.tipo_archivo === 'image'" 
        :src="fileUrl" 
        :alt="`Comprobante para ${patientList}`"
        class="w-full h-full object-cover"
        loading="lazy"
      >
      <!-- Si no, muestra un ícono SVG basado en el tipo de archivo. -->
      <div v-else class="p-4 text-slate-400 dark:text-slate-500">
        <!-- Ícono para PDF -->
        <svg v-if="archivo.tipo_archivo === 'pdf'" class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
        <!-- Ícono genérico para otros tipos de archivo -->
        <svg v-else class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
      </div>
    </div>
    
    <!-- Sección de Información -->
    <div class="p-3">
      <!-- Lista de pacientes asociados, truncada si es muy larga. -->
      <p class="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate" :title="patientList">
        {{ patientList }}
      </p>
      <!-- Fecha de creación del archivo, formateada. -->
      <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
        {{ formattedDate }}
      </p>
    </div>
  </a>
</template>

<script setup>
// --- INICIO DE LA MODIFICACIÓN ---
// Se eliminan todas las importaciones innecesarias que causaban el error de compilación.
// Este componente solo necesita `computed` de Vue para procesar las props que recibe.
import { computed } from 'vue';
// --- FIN DE LA MODIFICACIÓN ---

// El componente recibe el objeto 'archivo' como una prop obligatoria.
const props = defineProps({
  archivo: {
    type: Object,
    required: true,
  },
});

// Construye la URL completa y pública del archivo en Cloudflare R2.
const fileUrl = computed(() => {
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
  // Asegura que no haya dobles barras en la URL.
  return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${props.archivo.object_key}`;
});

// Formatea la fecha para que sea más legible (DD/MM/AAAA).
const formattedDate = computed(() => {
  if (!props.archivo.fecha_creacion) return 'Fecha no disponible';
  return new Date(props.archivo.fecha_creacion).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
});

// Une los nombres de los pacientes en una sola cadena de texto.
const patientList = computed(() => {
  if (!props.archivo.pacientes || props.archivo.pacientes.length === 0) {
    return 'Paciente no especificado';
  }
  return props.archivo.pacientes.join(', ');
});
</script>