<!-- src/views/LoginView.vue -->
<template>
  <div class="flex items-center justify-center min-h-screen px-4 bg-gray-50">
    <div class="w-full max-w-sm p-8 space-y-6 bg-white rounded-xl shadow-lg">
      <div class="text-center">
        <!-- **MEJORA: Usamos tu logo desde la carpeta /public** -->
        <!-- La ruta '/logo.png' funciona porque el archivo está en la carpeta 'public' -->
        <img class="w-auto h-16 mx-auto" src="/logo.png" alt="Logo de Districorr">

        <h2 class="mt-5 text-3xl font-bold tracking-tight text-gray-900">
          Acceso Administrador
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Ingresa tus credenciales para gestionar los reportes
        </p>
      </div>

      <div v-if="errorMessage" class="p-3 text-sm text-center text-red-800 bg-red-100 rounded-lg" role="alert">
        {{ errorMessage }}
      </div>

      <form class="space-y-6" @submit.prevent="handleLogin">
        <!-- Campo de Email -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <div class="mt-1">
            <input v-model="email" id="email" type="email" autocomplete="email" required class="w-full px-3 py-2 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
        </div>

        <!-- Campo de Contraseña -->
        <div>
          <div class="flex items-center justify-between">
            <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
            <!-- **MEJORA: Enlace para recuperar contraseña** -->
            <div class="text-sm">
              <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste?
              </a>
            </div>
          </div>
          <div class="relative mt-1">
            <input v-model="password" id="password" :type="passwordVisible ? 'text' : 'password'" autocomplete="current-password" required class="w-full px-3 py-2 pr-10 placeholder-gray-400 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
            <button type="button" @click="togglePasswordVisibility" class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
              <svg v-if="!passwordVisible" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.243 4.243L6.228 6.228" /></svg>
              <svg v-else class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </button>
          </div>
        </div>

        <!-- Botón de envío -->
        <div>
          <button type="submit" :disabled="loading" class="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
            <!-- **MEJORA: Ícono de spinner animado durante la carga** -->
            <svg v-if="loading" class="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span v-else>Ingresar</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { supabase } from '../services/supabase';

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const passwordVisible = ref(false);
const router = useRouter();

const togglePasswordVisibility = () => {
  passwordVisible.value = !passwordVisible.value;
};

const handleLogin = async () => {
  try {
    loading.value = true;
    errorMessage.value = '';
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    router.push('/admin');
  } catch (error) {
    errorMessage.value = error.message || 'Email o contraseña incorrectos.';
  } finally {
    loading.value = false;
  }
};
</script>