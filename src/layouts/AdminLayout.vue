<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="relative min-h-screen md:flex bg-gray-100 dark:bg-slate-900">
    
    <Sidebar 
      :is-open="isSidebarOpen" 
      user-role="admin" 
      @close-sidebar="isSidebarOpen = false"
      @open-share-reclamo-modal="openShareReclamoModal"
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      <header class="p-4 bg-white dark:bg-slate-800 shadow-md flex justify-between items-center shrink-0">
        <div class="flex items-center gap-4">
          <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 md:hidden">
            <svg v-if="!isSidebarOpen" class="w-6 h-6 text-gray-800 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg v-else class="w-6 h-6 text-gray-800 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <h1 v-if="headerConfig.title" class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">{{ headerConfig.title }}</h1>
        </div>

        <div class="flex items-center gap-3">
          <div v-if="headerConfig.buttons && headerConfig.buttons.length > 0" class="hidden md:flex items-center gap-3">
            <button v-for="button in headerConfig.buttons" :key="button.text" @click="button.action" :class="button.class">
              <component v-if="button.icon" :is="button.icon" class="w-5 h-5" />
              <span>{{ button.text }}</span>
            </button>
          </div>
          
          <!-- El componente NotificationBell ahora está conectado a la nueva lógica -->
          <NotificationBell 
            :notifications="notifications"
            @clear="markAllAsRead"
            @mark-all-as-read="markAllAsRead"
          />
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <router-view />
      </main>
    </div>

    <ShareReclamoLinkModal 
      :show="isShareReclamoModalVisible" 
      @close="closeShareReclamoModal" 
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, provide } from 'vue';
import { supabase } from '../services/supabase.js';
import Sidebar from '../components/Sidebar.vue';
import NotificationBell from '../components/NotificationBell.vue';
import ShareReclamoLinkModal from '../components/reclamos/ShareReclamoLinkModal.vue';

// --- ESTADO Y LÓGICA DEL MODAL ---
const isShareReclamoModalVisible = ref(false);
const openShareReclamoModal = () => { isShareReclamoModalVisible.value = true; };
const closeShareReclamoModal = () => { isShareReclamoModalVisible.value = false; };

// --- ESTADO DEL SIDEBAR ---
const isSidebarOpen = ref(false);

// --- LÓGICA DE CABECERA DINÁMICA (PROVIDE) ---
const headerConfig = ref({
  title: '',
  buttons: []
});
provide('header-config', headerConfig);
provide('open-share-reclamo-modal-fn', openShareReclamoModal);


// ========= INICIO DE LA NUEVA LÓGICA DE NOTIFICACIONES =========
const notifications = ref([]);
let notificationChannel = null;

// Función para formatear los datos de la BD al formato que espera el componente.
const formatNotification = (dbNotification) => {
  return {
    id: dbNotification.id,
    message: dbNotification.message,
    // Construimos el enlace para redirigir al admin y resaltar la fila.
    link: `/admin?highlight=${dbNotification.reporte_id}`,
    time: dbNotification.created_at,
    read: dbNotification.is_read,
  };
};

// Función para obtener las notificaciones iniciales no leídas.
const fetchInitialNotifications = async () => {
  const { data, error } = await supabase.rpc('get_unread_notifications');
  if (error) {
    console.error('Error al obtener notificaciones:', error);
  } else {
    notifications.value = data.map(formatNotification);
  }
};

// Función para marcar todas las notificaciones como leídas.
const markAllAsRead = async () => {
  // Actualiza el estado local inmediatamente para una UX fluida.
  notifications.value.forEach(n => n.read = true);
  // Llama a la RPC en segundo plano para persistir el cambio en la BD.
  const { error } = await supabase.rpc('mark_all_notifications_as_read');
  if (error) console.error('Error al marcar notificaciones como leídas:', error);
};

// Configuración del listener de Supabase Realtime.
const setupRealtimeListener = () => {
  // Ahora escuchamos la tabla 'notifications', no 'reportes'.
  notificationChannel = supabase
    .channel('public:notifications')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications' },
      (payload) => {
        console.log('Nueva notificación recibida en tiempo real:', payload.new);
        // Añade la nueva notificación al principio de la lista, ya formateada.
        notifications.value.unshift(formatNotification(payload.new));
      }
    )
    .subscribe();
};

// Ciclo de vida del componente: iniciar todo al montar.
onMounted(() => {
  fetchInitialNotifications();
  setupRealtimeListener();
});

// Limpiar la suscripción al desmontar para evitar fugas de memoria.
onUnmounted(() => {
  if (notificationChannel) {
    supabase.removeChannel(notificationChannel);
  }
});
// ========= FIN DE LA NUEVA LÓGICA DE NOTIFICACIONES =========
</script>