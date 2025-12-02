<!-- src/components/SalesRepresentativeModal.vue -->
<template>
  <!-- 
    Usamos el componente <Transition> de Vue para animar la entrada y salida del modal.
    'ease-out' y 'duration-300' son clases de Tailwind para suavizar la animación.
  -->
  <Transition
    enter-active-class="transition ease-out duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <!-- 
      El contenedor principal del modal. 'v-if="show"' controla su visibilidad.
      'fixed inset-0' lo expande a toda la pantalla.
      'z-50' asegura que esté por encima de todo lo demás.
      '@click.self' permite cerrar el modal al hacer clic en el fondo oscuro (overlay), pero no en el panel central.
    -->
    <div v-if="show" @click.self="close" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      
      <!-- Panel del Modal -->
      <div class="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 ring-1 ring-slate-200/70 dark:ring-slate-700/60 shadow-xl p-6">
        
        <!-- Cabecera del Modal -->
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">Seleccionar Representante</h3>
          <button @click="close" class="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <XMarkIcon class="h-6 w-6 text-slate-500" />
          </button>
        </div>

        <!-- Lista de Opciones -->
        <div class="space-y-2">
          <!-- Iteramos sobre la lista de representantes para crear un botón para cada uno. -->
          <button
            v-for="rep in representatives"
            :key="rep"
            @click="select(rep)"
            class="modal-option-button"
          >
            {{ rep }}
          </button>

          <!-- Botón para la opción "Otro" -->
          <button @click="showCustomInput = true" class="modal-option-button">
            Otro
          </button>
        </div>

        <!-- Campo de texto para "Otro", se muestra condicionalmente -->
        <div v-if="showCustomInput" class="mt-4 flex items-center gap-3">
          <input
            type="text"
            v-model="customRepresentative"
            placeholder="Nombre del representante"
            class="form-input flex-grow"
            ref="customInputRef"
          >
          <button @click="selectCustom" class="px-4 h-11 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            OK
          </button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { XMarkIcon } from '@heroicons/vue/24/outline';
import { onKeyStroke } from '@vueuse/core';

// El componente recibe una prop 'show' para saber si debe mostrarse.
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
});

// Define los eventos que este componente puede emitir hacia el padre.
const emit = defineEmits(['close', 'select']);

// Lista de representantes de ventas. Se puede mover a un archivo de configuración si crece.
const representatives = [
  'Nelson Gonzales',
  'Leticia Torres',
  'Ezequiel Dominguez',
  'Cristian Vera'
];

// Estado local para manejar la visibilidad del campo de texto "Otro".
const showCustomInput = ref(false);
// Estado local para almacenar el valor del campo de texto "Otro".
const customRepresentative = ref('');
// Referencia al elemento input para poder hacerle focus automáticamente.
const customInputRef = ref(null);

// Función para emitir el evento 'close' y notificar al padre que debe cerrar el modal.
const close = () => {
  // Reseteamos el estado del input "Otro" al cerrar.
  showCustomInput.value = false;
  customRepresentative.value = '';
  emit('close');
};

// Función para emitir el evento 'select' con el nombre seleccionado.
const select = (name) => {
  emit('select', name);
};

// Función para confirmar y emitir el nombre personalizado.
const selectCustom = () => {
  if (customRepresentative.value.trim()) {
    emit('select', customRepresentative.value.trim());
  }
};

// Observador: cuando 'showCustomInput' se vuelve verdadero, esperamos que el DOM se actualice
// y luego hacemos focus automáticamente en el campo de texto para mejorar la UX.
watch(showCustomInput, (isShown) => {
  if (isShown) {
    nextTick(() => {
      customInputRef.value?.focus();
    });
  }
});

// Hook de @vueuse/core para cerrar el modal al presionar la tecla "Escape".
onKeyStroke('Escape', (e) => {
  if (props.show) {
    e.preventDefault();
    close();
  }
});
</script>

<style scoped>
/* Estilos compartidos con el formulario principal para consistencia */
.form-input {
  @apply block w-full h-11 px-4 rounded-xl bg-white dark:bg-slate-800 ring-1 ring-slate-300/70 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500;
}

/* Estilo para los botones de opción dentro del modal */
.modal-option-button {
  @apply w-full text-left h-12 px-4 rounded-lg font-medium transition-colors;
  @apply text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800;
}
</style>