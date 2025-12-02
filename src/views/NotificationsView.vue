<!-- src/views/NotificationsView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <div class="max-w-4xl mx-auto">
      <!-- Cabecera de la Página -->
      <div class="pb-4 border-b border-gray-200 dark:border-slate-700">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-slate-100">
          Historial de Notificaciones
        </h1>
        <p class="mt-1 text-sm text-gray-600 dark:text-slate-400">
          Aquí puedes ver todas las notificaciones generadas en el sistema.
        </p>
      </div>

      <!-- Estado de Carga -->
      <div v-if="loading" class="mt-8 space-y-4">
        <!-- Usamos un esqueleto simple para el feedback de carga -->
        <div v-for="n in 5" :key="n" class="h-16 bg-gray-200 dark:bg-slate-800 rounded-lg animate-pulse"></div>
      </div>

      <!-- Estado de Error -->
      <div v-else-if="error" class="mt-8 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error:</strong>
        <span class="block sm:inline">{{ error }}</span>
      </div>

      <!-- Contenido Principal -->
      <div v-else class="mt-8">
        <!-- Mensaje para cuando no hay notificaciones -->
        <div v-if="notifications.length === 0" class="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
          <p class="text-gray-500 dark:text-slate-400">No se han encontrado notificaciones.</p>
        </div>
        
        <!-- Lista de Notificaciones -->
        <div v-else class="bg-white dark:bg-slate-800 shadow-md rounded-lg overflow-hidden">
          <ul class="divide-y divide-gray-200 dark:divide-slate-700">
            <li
              v-for="notification in notifications"
              :key="notification.id"
              class="notification-item"
              :class="{ 'unread-highlight': !notification.is_read }"
            >
              <div class="flex-shrink-0 self-start">
                <InformationCircleIcon class="h-6 w-6 text-blue-500" />
              </div>
              <div class="flex-grow">
                <p v-html="notification.message" class="text-sm text-gray-900 dark:text-slate-200"></p>
                <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ formatTimeAgo(notification.created_at) }}</p>
              </div>
            </li>
          </ul>
          
          <!-- Controles de Paginación -->
          <PaginationControls 
            v-if="totalNotifications > itemsPerPage" 
            :current-page="currentPage" 
            :total-items="totalNotifications" 
            :items-per-page="itemsPerPage" 
            @page-changed="goToPage" 
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
import PaginationControls from '../components/PaginationControls.vue';

const toast = useToast();

// Estado reactivo para la vista
const notifications = ref([]);
const loading = ref(true);
const error = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(20); // Mostramos 20 notificaciones por página
const totalNotifications = ref(0);

// Función para obtener los datos paginados desde la RPC
const fetchPaginatedNotifications = async () => {
  loading.value = true;
  error.value = null;
  try {
    const params = {
      p_page: currentPage.value,
      p_items_per_page: itemsPerPage.value
    };

    const { data, error: rpcError } = await supabase.rpc('get_all_notifications_paginated', params);

    if (rpcError) throw rpcError;

    if (data && data.length > 0) {
      notifications.value = data;
      totalNotifications.value = data[0].total_count;
    } else {
      notifications.value = [];
      totalNotifications.value = 0;
    }
  } catch (err) {
    error.value = err.message;
    toast.error("Error al cargar el historial: " + err.message);
  } finally {
    loading.value = false;
  }
};

// Se llama a la función al montar el componente para la carga inicial.
onMounted(fetchPaginatedNotifications);

// Función para cambiar de página
const goToPage = (page) => {
  currentPage.value = page;
  fetchPaginatedNotifications();
};

// Función helper para formatear la fecha
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
};
</script>

<style scoped>
.notification-item {
  @apply flex items-start gap-3 px-4 py-4;
}
.unread-highlight {
  @apply bg-blue-50 dark:bg-blue-900/20;
}
:deep(strong) {
  @apply font-semibold text-gray-900 dark:text-slate-100;
}
</style>