<!-- src/components/shared/SurgerySelector.vue -->
<template>
  <div class="surgery-selector-container" ref="selectorRef">
    <label for="surgery-search" class="form-label">Asociar a Cirugía</label>
    <!-- 
      El input de texto donde el usuario escribe para buscar.
      - @input: Llama a la función de búsqueda cada vez que el usuario teclea.
      - @focus: Muestra la lista de resultados cuando el usuario hace clic en el input.
    -->
    <input
      id="surgery-search"
      type="text"
      v-model="searchTerm"
      @input="debouncedSearch"
      @focus="showResults = true"
      placeholder="Buscar por nombre de paciente..."
      class="form-input"
      autocomplete="off"
    />

    <!-- 
      Contenedor de resultados que aparece debajo del input.
      - v-if="showResults && (results.length > 0 || isLoading)": Se muestra si el usuario
        ha hecho foco, y si hay resultados o si estamos esperando una respuesta del servidor.
    -->
    <div v-if="showResults && (results.length > 0 || isLoading)" class="results-dropdown">
      <!-- Mensaje de "Cargando..." -->
      <div v-if="isLoading" class="result-item">Buscando...</div>
      
      <!-- 
        Lista de resultados.
        - @mousedown.prevent: Usamos mousedown en lugar de click para que se ejecute
          antes que el evento 'blur' del input, evitando que el menú se cierre antes de la selección.
      -->
      <div
        v-for="surgery in results"
        :key="surgery.id"
        class="result-item"
        @mousedown.prevent="selectSurgery(surgery)"
      >
        {{ surgery.display_text }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { supabase } from '../../services/supabase';
import { onClickOutside } from '@vueuse/core';
import { useDebounceFn } from '@vueuse/core';

// --- DEFINICIÓN DE EVENTOS ---
// El componente notificará al padre cuando una cirugía sea seleccionada.
const emit = defineEmits(['surgery-selected']);

// --- ESTADO INTERNO ---
const searchTerm = ref(''); // El texto que el usuario escribe.
const results = ref([]); // La lista de cirugías devuelta por la RPC.
const isLoading = ref(false); // Para mostrar el estado de "Cargando...".
const showResults = ref(false); // Controla la visibilidad del menú desplegable.
const selectorRef = ref(null); // Referencia al contenedor principal para el onClickOutside.

// --- LÓGICA DE BÚSQUEDA ---

/**
 * Llama a la función RPC de Supabase para buscar cirugías.
 */
const searchSurgeries = async () => {
  if (searchTerm.value.length < 3) {
    results.value = [];
    return;
  }
  isLoading.value = true;
  try {
    const { data, error } = await supabase.rpc('search_reportes_for_selector', {
      search_term: searchTerm.value,
    });
    if (error) throw error;
    results.value = data;
  } catch (error) {
    console.error('Error buscando cirugías:', error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
};

/**
 * Función "debounced": Espera 300ms después de que el usuario deja de teclear
 * antes de ejecutar la búsqueda. Esto evita hacer llamadas a la API con cada letra.
 */
const debouncedSearch = useDebounceFn(searchSurgeries, 300);

// --- LÓGICA DE INTERACCIÓN ---

/**
 * Se ejecuta cuando el usuario selecciona una cirugía de la lista.
 * @param {object} surgery - El objeto de la cirugía seleccionada.
 */
const selectSurgery = (surgery) => {
  // Actualizamos el input para que muestre el texto de la cirugía seleccionada.
  searchTerm.value = surgery.display_text;
  // Ocultamos la lista de resultados.
  showResults.value = false;
  // ¡LO MÁS IMPORTANTE! Emitimos el evento al componente padre con el objeto completo.
  emit('surgery-selected', surgery);
};

/**
 * Cierra el menú de resultados si el usuario hace clic fuera del componente.
 */
onClickOutside(selectorRef, () => {
  showResults.value = false;
});

// --- FUNCIÓN EXPUESTA ---
/**
 * Limpia el estado interno del componente.
 * Puede ser llamada desde el componente padre a través de una referencia (ref).
 */
const clear = () => {
  searchTerm.value = '';
  results.value = [];
  showResults.value = false;
};

// Exponemos la función 'clear' para que sea accesible.
defineExpose({ clear });
</script>

<style scoped>
.surgery-selector-container {
  position: relative;
  width: 100%;
}
.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}
.results-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 10;
}
.result-item {
  padding: 0.75rem;
  cursor: pointer;
}
.result-item:hover {
  background-color: #f0f0f0;
}
</style>