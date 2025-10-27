<!-- src/components/NotificationBell.vue -->
<template>
  <div class="relative" ref="container">
    <button @click="togglePanel" class="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
      <svg class="w-6 h-6 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
      <span v-if="unreadCount > 0" class="absolute top-0 right-0 flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500 justify-center items-center text-[10px] text-white">{{ unreadCount }}</span>
      </span>
    </button>

    <Transition name="fade">
      <div v-if="isOpen" class="absolute right-0 mt-2 w-96 bg-white dark:bg-slate-800 rounded-lg shadow-xl border dark:border-slate-700 flex flex-col">
        <div class="p-3 flex justify-between items-center border-b dark:border-slate-700">
          <h3 class="font-semibold text-gray-800 dark:text-slate-100">Notificaciones</h3>
          <button @click="$emit('clear')" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Limpiar todo
          </button>
        </div>
        
        <div v-if="notifications.length === 0" class="p-10 text-center text-sm text-gray-500 dark:text-slate-400">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-slate-200">Todo al día</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-slate-400">No hay notificaciones nuevas.</p>
        </div>

        <ul v-else class="max-h-[70vh] overflow-y-auto divide-y dark:divide-slate-700">
          <!-- Agrupación (ejemplo simple) -->
          <template v-for="(notification, index) in notifications" :key="notification.id">
            <li>
              <router-link :to="notification.link || '/admin'" @click="isOpen = false" class="flex items-start p-4 gap-3 hover:bg-gray-50 dark:hover:bg-slate-700/50">
                <div class="relative shrink-0">
                  <span v-if="!notification.read" class="absolute -top-1 -left-1 block h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-white dark:ring-slate-800"></span>
                  <div class="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                    <svg class="h-6 w-6 text-indigo-600 dark:text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6-4l-6.5 6.5L12 16.5l-2.5-2.5L3 10.5" /></svg>
                  </div>
                </div>
                <div class="flex-1">
                  <p class="text-sm text-gray-800 dark:text-slate-200" v-html="notification.message"></p>
                  <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">{{ formatTimeAgo(notification.time) }}</p>
                </div>
              </router-link>
            </li>
          </template>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { onClickOutside } from '@vueuse/core';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const props = defineProps({
  notifications: { type: Array, default: () => [] }
});
const emit = defineEmits(['clear', 'mark-all-as-read']);

const isOpen = ref(false);
const container = ref(null);

// Calculamos el contador de no leídas desde la lista
const unreadCount = computed(() => props.notifications.filter(n => !n.read).length);

const togglePanel = () => {
  isOpen.value = !isOpen.value;
  // Si abrimos el panel y hay notificaciones no leídas, avisamos al padre para que las marque.
  if (isOpen.value && unreadCount.value > 0) {
    emit('mark-all-as-read');
  }
};

// Función para formatear el tiempo
const formatTimeAgo = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
};

onClickOutside(container, () => isOpen.value = false);
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>