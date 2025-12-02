<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="flex h-screen bg-gray-100 dark:bg-slate-900">
    <Sidebar :is-open="isSidebarOpen" @toggle-sidebar="toggleSidebar" />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="flex justify-between items-center p-4 bg-white dark:bg-slate-800 border-b dark:border-slate-700 shadow-sm">
        <div class="flex items-center">
          <button @click="toggleSidebar" class="text-gray-500 dark:text-slate-400 focus:outline-none lg:hidden">
            <svg class="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <h1 class="text-xl font-semibold text-gray-800 dark:text-slate-200 ml-4">{{ headerConfig.title }}</h1>
        </div>
        <div class="flex items-center space-x-4">
          <component v-for="(button, index) in headerConfig.buttons" :key="index" :is="'button'" @click="button.action" :class="button.class">
            <component v-if="button.icon" :is="button.icon" />
            <span>{{ button.text }}</span>
          </component>
          
          <div class="relative" ref="notificationMenuRef">
            <button @click="toggleDropdown" class="p-2 rounded-full text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none">
              <BellIcon class="h-6 w-6" />
              <span v-if="unreadCount > 0" class="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
            
            <!-- El dropdown ahora escucha los nuevos eventos -->
            <NotificationDropdown
              :show="isDropdownOpen"
              :notifications="notifications"
              @notification-click="handleNotificationClick"
              @mark-all-read="handleMarkAllRead"
              @view-all="goToAllNotifications"
            />
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <router-view />
      </main>
    </div>
    
    <ReportDrawer 
      :show="isDrawerVisible" 
      :reporte="selectedReporteForDrawer" 
      @close="closeDrawer"
      @updated="handleDrawerUpdate"
    />
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // <-- AÑADIR IMPORT
import { useToast } from 'vue-toastification';
import { supabase } from '../services/supabase.js';
import { onClickOutside } from '@vueuse/core';
import Sidebar from '../components/Sidebar.vue';
import ReportDrawer from '../components/ReportDrawer.vue';
import { BellIcon } from '@heroicons/vue/24/outline';
import NotificationDropdown from '../components/NotificationDropdown.vue';

const toast = useToast();
const router = useRouter(); // <-- INICIALIZAR ROUTER
const isSidebarOpen = ref(false);
const toggleSidebar = () => { isSidebarOpen.value = !isSidebarOpen.value; };

const headerConfig = ref({ title: '', buttons: [] });
provide('header-config', headerConfig);

const notifications = ref([]);
const isDropdownOpen = ref(false);
const notificationMenuRef = ref(null);
let notificationChannel = null;

const unreadCount = computed(() => notifications.value.filter(n => !n.is_read).length);

const fetchNotifications = async () => {
  const { data, error } = await supabase.rpc('get_notifications');
  if (error) {
    toast.error('No se pudieron cargar las notificaciones.');
  } else {
    notifications.value = data;
  }
};

// ========= INICIO DE LA MEJORA: FUNCIÓN PARA MARCAR COMO LEÍDAS =========
const handleMarkAllRead = async () => {
  // Actualización optimista de la UI
  notifications.value.forEach(n => n.is_read = true);
  // Llamada a la RPC para persistir el cambio
  const { error } = await supabase.rpc('mark_notifications_as_read');
  if (error) {
    toast.error("Error al marcar las notificaciones.");
    // Si hay un error, podríamos revertir el cambio en la UI, pero por ahora lo dejamos así.
  }
};
// ========= FIN DE LA MEJORA =========

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
  if (isDropdownOpen.value && unreadCount.value > 0) {
    // Usamos un pequeño delay para que el usuario vea el cambio de estado
    setTimeout(handleMarkAllRead, 1000);
  }
};

onClickOutside(notificationMenuRef, () => { isDropdownOpen.value = false; });

const handleNotificationClick = (notification) => {
  isDropdownOpen.value = false;
  supabase.from('reportes').select('*').eq('id', notification.reporte_id).single()
    .then(({ data, error }) => {
      if (error) throw error;
      openDrawer(data);
    })
    .catch(err => toast.error('No se pudo encontrar el reporte asociado.'));
};

// ========= INICIO DE LA MEJORA: FUNCIÓN PARA NAVEGAR =========
const goToAllNotifications = () => {
  isDropdownOpen.value = false;
  router.push({ name: 'Notificaciones' });
};
// ========= FIN DE LA MEJORA =========

onMounted(() => {
  fetchNotifications();
  notificationChannel = supabase
    .channel('public:notifications')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
      notifications.value.unshift(payload.new);
      toast.success(payload.new.message);
    })
    .subscribe();
});

onUnmounted(() => {
  if (notificationChannel) {
    supabase.removeChannel(notificationChannel);
  }
});

const isDrawerVisible = ref(false);
const selectedReporteForDrawer = ref(null);
const openDrawer = (reporte) => {
  selectedReporteForDrawer.value = reporte;
  isDrawerVisible.value = true;
};
const closeDrawer = () => {
  isDrawerVisible.value = false;
};
const handleDrawerUpdate = () => {};
</script>