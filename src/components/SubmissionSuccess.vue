<!-- src/components/SubmissionSuccess.vue -->
<template>
  <div class="w-full max-w-lg mx-auto text-center">
    <div class="bg-white p-8 sm:p-12 rounded-2xl shadow-lg dark:bg-slate-800">
      <div class="flex flex-col items-center space-y-6">
        
        <img src="/2.svg" alt="Districorr" class="h-12 opacity-80">
        
        <div class="w-20 h-20 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10">
          <svg class="w-12 h-12 text-green-500" viewBox="0 0 52 52">
            <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        
        <h2 class="text-3xl font-bold text-slate-800 dark:text-slate-100">
          ¡Ficha Enviada con Éxito!
        </h2>

        <p class="text-base text-slate-600 dark:text-slate-300">
          Gracias por tu compromiso. Tu ficha fue registrada en nuestro sistema.
        </p>

        <!-- Enlace al Resumen de Actividad -->
        <div v-if="activityToken" class="text-center">
          <router-link
            :to="{ name: 'ActivitySummary', params: { token: activityToken } }"
            class="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Accedé a tu Resumen de Actividad
          </router-link>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
            (Este enlace es personal y válido por 72 hs)
          </p>
        </div>

        <!-- Guía de Siguientes Pasos -->
        <div class="w-full text-left space-y-4 mt-5 border-t border-slate-200 dark:border-slate-700 pt-6">
          
          <!-- Paso 1: Alerta Roja (Stickers) -->
          <div class="p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <div>
                <h3 class="font-bold text-red-800 dark:text-red-300">Paso 1: ¡Importante!</h3>
                <p class="text-sm text-red-700 dark:text-red-200 mt-1">
                  Para finalizar, Recordá enviar las fotos de la caja <strong>de implantes/instrumental, los stickers del material utilizado y toda la documentación asociada</strong> (remito, protocolo, etc.). Esto es crucial para la trazabilidad.
                </p>
              </div>
            </div>
          </div>

          <!-- Paso 2: Advertencia (Inconvenientes) -->
          <div class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-yellow-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 22s8-4 8-10V7l-8-4-8 4v5c0 6 8 10 8 10zM9 12l2 2 4-4" /></svg>
              <div>
                <h3 class="font-bold text-yellow-800 dark:text-yellow-300">Paso 2: Tu Respaldo</h3>
                <p class="text-sm text-yellow-700 dark:text-yellow-200 mt-1">
                  ¿Tuviste dificultades con el instrumental o los implantes? Enviarnos <strong>fotos y videos del caso</strong> para dejar constancia te da un respaldo y acelera nuestra respuesta.
                </p>
              </div>
            </div>
          </div>

          <!-- Paso 3: Tip Profesional (Video) -->
          <div class="p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
            <div class="flex items-start gap-3">
              <svg class="w-6 h-6 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4-2v8l-4-2M3 8h10a2 2 0 012 2v4a2 2 0 01-2 2H3a2 2 0 01-2-2v-4a2 2 0 012-2z" /></svg>
              <div>
                <h3 class="font-bold text-blue-800 dark:text-blue-300">Tip Profesional</h3>
                <p class="text-sm text-blue-700 dark:text-blue-200 mt-1">
                  Un <strong>video corto (10-20s)</strong> mostrando la caja  y los implantes es la mejor constancia visual del estado del material.
                </p>
              </div>
            </div>
          </div>
          
          <!-- Bloque de Información de Pago -->
          <div class="p-4 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500">
            <div class="flex items-start gap-3">
              <BanknotesIcon class="w-6 h-6 text-green-500 shrink-0" />
              <div>
                <h3 class="font-bold text-green-800 dark:text-green-300">Información de Pago</h3>
                <p class="text-sm text-green-700 dark:text-green-200 mt-1">
                  Tu pago se procesará dentro de los <strong>7 días hábiles</strong> siguientes a la recepción y control del material en nuestro depósito. ¡Gracias por tu excelente trabajo!
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Botón de WhatsApp -->
        <div class="w-full pt-6">
          <a
            :href="whatsappUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center justify-center gap-2 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 4.315 1.731 6.086l.001.004-1.035 3.787 3.864-1.025z" /></svg>
            WhatsApp del Area de Depósito
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { BanknotesIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  pacienteNombre: { type: String, required: true },
  activityToken: { type: String, default: null }
});

const whatsappUrl = computed(() => {
  const numero = '543794043788';
  const mensaje = `Hola, comparto evidencia del material del paciente ${props.pacienteNombre}.`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
});
</script>

<style scoped>
.checkmark-circle {
  stroke-dasharray: 166;
  stroke-dashoffset: 166;
  stroke-width: 3;
  stroke-miterlimit: 10;
  stroke: #22c55e;
  animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
}
.checkmark-check {
  transform-origin: 50% 50%;
  stroke-dasharray: 48;
  stroke-dashoffset: 48;
  stroke-width: 4;
  stroke: #22c55e;
  stroke-linecap: round;
  stroke-linejoin: round;
  animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
}
@keyframes stroke { 100% { stroke-dashoffset: 0; } }
</style>