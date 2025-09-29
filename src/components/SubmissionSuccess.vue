<!-- src/components/SubmissionSuccess.vue -->
<template>
  <div class="w-full max-w-lg mx-auto text-center">
    <div class="bg-white p-8 sm:p-12 rounded-2xl shadow-lg dark:bg-slate-800">
      <div class="flex flex-col items-center space-y-6">
        
        <img src="/2.svg" alt="Districorr" class="h-16">
        
        <svg class="w-24 h-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
          <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
          <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
        </svg>
        
        <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
          ¡Ficha Enviada con Éxito!
        </h2>
        
        <p class="text-lg text-slate-600 dark:text-slate-300">
        ¡Gracias por tu tiempo y compromiso!
        Tu ficha fue enviada con éxito y ya quedó registrada en nuestro sistema.
        Valoramos mucho tu colaboración para seguir mejorando juntos cada día.
        </p>

        <!-- **NUEVO:** Sección de WhatsApp -->
        <div class="w-full pt-6 border-t border-slate-200 dark:border-slate-700">
          <p class="text-slate-500 dark:text-slate-400 mb-4">
            Recordá que podés completar con fotos de los materiales y stickers utilizados al siguiente número.
          </p>
          <a 
            :href="whatsappUrl" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center space-x-3 w-full sm:w-auto bg-emerald-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-emerald-700 transition-colors"
          >
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004l-1.035 3.787l3.864-1.025z"/></svg>
            <span>Contactar a Depósito (Léticia Torres)</span>
          </a>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// **NUEVO:** Definimos la nueva prop para recibir el nombre del paciente.
const props = defineProps({
  pacienteNombre: {
    type: String,
    required: true,
  }
});

// **NUEVO:** Creamos una propiedad computada para generar el link de WhatsApp dinámicamente.
const whatsappUrl = computed(() => {
  // El número de WhatsApp, incluyendo el código de país (54 para Argentina) y sin espacios ni símbolos.
  const numero = '543774404291';
  // El mensaje base, usando el nombre del paciente que recibimos por la prop.
  const mensajeBase = `Hola, comparto fotos del consumo y material del paciente ${props.pacienteNombre}.`;
  // Codificamos el mensaje para que sea seguro de usar en una URL.
  const mensajeCodificado = encodeURIComponent(mensajeBase);
  
  // Retornamos la URL completa.
  return `https://wa.me/${numero}?text=${mensajeCodificado}`;
});
</script>

<style scoped>
/* Estilos y animaciones para el checkmark (sin cambios) */
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #4ade80;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 4;
  stroke: #4ade80;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
@keyframes stroke {
  100% {
    stroke-dashoffset: 0;
  }
}
</style>