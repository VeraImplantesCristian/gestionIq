<!-- src/components/NotificationDropdown.vue -->
<template>
  <Transition
    enter-active-class="transition ease-out duration-100"
    enter-from-class="transform opacity-0 scale-95"
    enter-to-class="transform opacity-100 scale-100"
    leave-active-class="transition ease-in duration-75"
    leave-from-class="transform opacity-100 scale-100"
    leave-to-class="transform opacity-0 scale-95"
  >
    <div 
      v-if="show"
      ref="dropdownRef"
      tabindex="-1"
      @keydown="handleKeydown"
      class="absolute top-full right-0 mt-2 w-80 sm:w-96 origin-top-right rounded-lg bg-white dark:bg-slate-800 shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none z-20 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-title"
    >
      <header class="sticky top-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
        <h3 id="notifications-title" class="text-sm font-semibold text-gray-900 dark:text-slate-100">
          Notificaciones <span v-if="unreadCount > 0" class="unread-counter">{{ unreadCount }}</span>
        </h3>
        <!-- El botón ahora emite 'mark-all-read' -->
        <button v-if="notifications.length > 0" @click="$emit('mark-all-read')" class="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
          Marcar todas como leídas
        </button>
      </header>

      <div class="flex-grow overflow-y-auto max-h-[60vh]">
        <div v-if="notifications.length === 0" class="px-4 py-12 text-center flex flex-col items-center">
          <div class="animated-icon-wrapper">
            <svg class="w-12 h-12 text-green-500" viewBox="0 0 52 52">
              <circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <p class="text-sm font-semibold text-gray-700 dark:text-slate-300 mt-4">Todo al día</p>
          <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">No tienes notificaciones pendientes.</p>
        </div>
        
        <TransitionGroup v-else tag="ul" name="list" class="divide-y divide-gray-200 dark:divide-slate-700" role="listbox" aria-label="Lista de notificaciones">
          <li
            v-for="(notification, index) in notifications"
            :key="notification.id"
            role="option"
            :aria-selected="index === focusedIndex"
            :class="['notification-item', { 'unread-highlight': !notification.is_read, 'focused-item': index === focusedIndex }]"
            @click="$emit('notification-click', notification)"
            @mouseenter="focusedIndex = index"
          >
            <div class="flex-shrink-0 self-start">
              <component :is="getIconForType(notification.type)" :class="['h-6 w-6', getIconColor(notification.type)]" />
            </div>
            <div class="flex-grow">
              <p v-html="notification.message" class="text-sm text-gray-900 dark:text-slate-200"></p>
              <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{{ formatTimeAgo(notification.created_at) }}</p>
            </div>
          </li>
        </TransitionGroup>
      </div>

      <footer class="sticky bottom-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
        <!-- El botón ahora emite 'view-all' -->
        <button @click="$emit('view-all')" class="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">Ver todas</button>
        <!-- El botón ahora emite 'open-preferences' -->
        <button @click="showPreferencesToast" class="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-slate-300">
          <Cog6ToothIcon class="h-5 w-5" />
        </button>
      </footer>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { useToast } from 'vue-toastification'; // <-- AÑADIR IMPORT
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircleIcon, InformationCircleIcon, ExclamationTriangleIcon, XCircleIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  show: { type: Boolean, default: false },
  notifications: { type: Array, default: () => [] }
});

// Se actualiza la lista de emits
const emit = defineEmits(['close', 'mark-all-read', 'notification-click', 'view-all']);

const toast = useToast(); // <-- INICIALIZAR TOAST

const unreadCount = computed(() => props.notifications.filter(n => !n.is_read).length);

const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: es });
};

const getIconForType = (type = 'info') => {
  const icons = { success: CheckCircleIcon, info: InformationCircleIcon, warning: ExclamationTriangleIcon, error: XCircleIcon };
  return icons[type] || InformationCircleIcon;
};
const getIconColor = (type = 'info') => {
  const colors = { success: 'text-green-500', info: 'text-blue-500', warning: 'text-yellow-500', error: 'text-red-500' };
  return colors[type] || 'text-blue-500';
};

// ========= INICIO DE LA MEJORA: FUNCIÓN PARA PREFERENCIAS =========
const showPreferencesToast = () => {
  toast.info("La configuración de notificaciones estará disponible próximamente.");
};
// ========= FIN DE LA MEJORA =========

const dropdownRef = ref(null);
const focusedIndex = ref(-1);

watch(() => props.show, (isShown) => {
  if (isShown) {
    nextTick(() => { dropdownRef.value?.focus(); });
  } else {
    focusedIndex.value = -1;
  }
});

const handleKeydown = (event) => {
  const itemsCount = props.notifications.length;
  if (itemsCount === 0) return;
  switch (event.key) {
    case 'ArrowDown': event.preventDefault(); focusedIndex.value = (focusedIndex.value + 1) % itemsCount; break;
    case 'ArrowUp': event.preventDefault(); focusedIndex.value = (focusedIndex.value - 1 + itemsCount) % itemsCount; break;
    case 'Enter': if (focusedIndex.value !== -1) { event.preventDefault(); emit('notification-click', props.notifications[focusedIndex.value]); } break;
    case 'Escape': emit('close'); break;
  }
};
</script>

<style scoped>
.unread-counter { @apply ml-1.5 inline-block py-0.5 px-1.5 text-xs font-bold leading-none text-center whitespace-nowrap align-baseline bg-blue-500 text-white rounded-full; }
.notification-item { @apply flex items-start gap-3 px-4 py-3 text-left transition-colors duration-150 cursor-pointer; }
.unread-highlight { @apply bg-blue-50 dark:bg-blue-900/20; }
.focused-item { @apply bg-gray-100 dark:bg-slate-700; }
:deep(strong) { @apply font-semibold text-gray-900 dark:text-slate-100; }
.list-enter-active, .list-leave-active { @apply transition-all duration-300 ease-out; }
.list-enter-from, .list-leave-to { @apply opacity-0 -translate-y-2; }
.list-move { @apply transition-transform duration-300; }
.animated-icon-wrapper { @apply w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-500/10; }
.checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 3; stroke-miterlimit: 10; stroke: #22c55e; animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
.checkmark-check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 4; stroke: #22c55e; stroke-linecap: round; stroke-linejoin: round; animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
@keyframes stroke { 100% { stroke-dashoffset: 0; } }
</style>