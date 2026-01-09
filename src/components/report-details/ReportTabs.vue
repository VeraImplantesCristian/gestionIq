<!-- src/components/report-details/ReportTabs.vue -->
<template>
  <div class="report-tabs-container">
    <!-- 1. Navegación de Pestañas -->
    <div class="tabs-nav">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        @click="setActiveTab(tab.name)"
        :class="['tab-button', { 'active': activeTab === tab.name }]"
      >
        {{ tab.name }}
      </button>
    </div>

    <!-- 2. Contenido de la Pestaña Activa -->
    <div class="tab-content">
      <keep-alive>
        <component
          :is="activeComponent.component"
          v-bind="activeComponent.props"
          :report-id="reportId"
          :owner-id="ownerId"
        />
      </keep-alive>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw } from 'vue';

// Importamos los componentes que se usarán como contenido de las pestañas.
import ReportEventsAndPdfs from './ReportEventsAndPdfs.vue';
import PhotosGallery from './PhotosGallery.vue';
import LogisticaTimeline from './LogisticaTimeline.vue'; 

const props = defineProps({
  reportId: { type: [String, Number], required: true },
  
  // --- CAMBIO: Se ajusta la definición de la prop 'ownerId' ---
  ownerId: {
    // Se permite que el tipo sea String, Number u Object (para aceptar null).
    type: [String, Number, Object],
    // Ya no es requerida, ya que un reporte puede no tener owner.
    required: false,
    // Se establece 'null' como valor por defecto si no se proporciona.
    default: null
  },
});

// --- ESTRUCTURA DE LAS PESTAÑAS ---
// Este array define el orden, nombre y componente de cada pestaña,
// junto con las props específicas que cada uno necesita para funcionar.
const tabs = [
  { 
    name: 'Fotos Instrumentadores', 
    component: markRaw(PhotosGallery), 
    props: { 
      area: 'instrumentadores',
      title: 'Evidencia del Instrumentador',
      showUploader: false 
    } 
  },
  { 
    name: 'Logística Interna', 
    component: markRaw(LogisticaTimeline), 
    props: {}
  },
  { 
    name: 'Eventos & PDFs', 
    component: markRaw(ReportEventsAndPdfs), 
    props: {}
  },
];

// --- ESTADO Y MÉTODOS DE NAVEGACIÓN ---
const activeTab = ref(tabs[0].name);

const setActiveTab = (tabName) => {
  activeTab.value = tabName;
};

const activeComponent = computed(() => {
  return tabs.find(tab => tab.name === activeTab.value);
});
</script>

<style scoped>
.report-tabs-container { width: 100%; }
.tabs-nav { display: flex; border-bottom: 1px solid #e2e8f0; margin-bottom: 1rem; }
.tab-button { padding: 0.75rem 1rem; border: none; background-color: transparent; cursor: pointer; font-size: 0.9rem; font-weight: 500; color: #64748b; border-bottom: 2px solid transparent; transition: all 0.2s ease-in-out; }
.tab-button:hover { color: #334155; }
.tab-button.active { color: #2563eb; border-bottom-color: #2563eb; }
.tab-content { padding: 0.5rem 0; }
</style>