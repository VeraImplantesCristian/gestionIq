<!-- src/layouts/AdminLayout.vue -->
<template>
  <div class="relative min-h-screen md:flex bg-gray-100 dark:bg-slate-900">
    
    <!-- El sidebar ahora tiene dos posibles eventos que este layout puede manejar -->
    <Sidebar 
      :is-open="isSidebarOpen" 
      user-role="admin" 
      @close-sidebar="isSidebarOpen = false"
      @open-share-reclamo-modal="openShareReclamoModal"
    />

    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Cabecera Inteligente -->
      <header class="p-4 bg-white dark:bg-slate-800 shadow-md flex justify-between items-center shrink-0">
        <div class="flex items-center gap-4">
          <!-- Botón de Menú para Móvil -->
          <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 md:hidden">
            <svg v-if="!isSidebarOpen" class="w-6 h-6 text-gray-800 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
            <svg v-else class="w-6 h-6 text-gray-800 dark:text-slate-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
          
          <!-- Título dinámico -->
          <h1 v-if="headerConfig.title" class="text-2xl md:text-3xl font-bold text-gray-900 dark:text-slate-100">{{ headerConfig.title }}</h1>
        </div>

        <div class="flex items-center gap-3">
          <!-- Botones de acción dinámicos -->
          <div v-if="headerConfig.buttons && headerConfig.buttons.length > 0" class="hidden md:flex items-center gap-3">
            <button v-for="button in headerConfig.buttons" :key="button.text" @click="button.action" :class="button.class">
              <component v-if="button.icon" :is="button.icon" class="w-5 h-5" />
              <span>{{ button.text }}</span>
            </button>
          </div>
          
          <NotificationBell 
            :notifications="notifications"
            @clear="clearAllNotifications"
            @mark-all-as-read="markAllAsRead"
          />
        </div>
      </header>

      <main class="flex-1 overflow-x-hidden overflow-y-auto">
        <router-view />
      </main>
    </div>

    <!-- Modal de Compartir Link de Reclamo -->
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

// Importamos el modal de compartir
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

// Proveemos el objeto de configuración a todas las vistas hijas.
provide('header-config', headerConfig);

// ========= INICIO DE LA SOLUCIÓN: PROVEER LA FUNCIÓN DEL MODAL =========
// Proveemos la función para abrir el modal a todas las vistas hijas.
// Usamos una clave única y descriptiva.
// Ahora, cualquier vista (como QuejasView) puede inyectar y llamar a esta función.
provide('open-share-reclamo-modal-fn', openShareReclamoModal);
// ========= FIN DE LA SOLUCIÓN =========


// --- LÓGICA DE NOTIFICACIONES ---
const notifications = ref([]);
let channel = null;
const markAllAsRead = () => notifications.value.forEach(n => n.read = true);
const clearAllNotifications = () => notifications.value = [];

onMounted(() => {
  channel = supabase.channel('reportes-updates');
  channel.on(
    'postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'reportes', filter: `estado=eq.Enviado` },
    (payload) => {
      if (payload.old.estado !== 'Enviado') {
        notifications.value.unshift({
          id: payload.new.id,
          message: `La ficha del paciente <strong>${payload.new.paciente}</strong> fue completada.`,
          time: new Date(),
          read: false,
          link: '/admin'
        });
      }
    }
  ).subscribe();
});

onUnmounted(() => {
  if (channel) supabase.removeChannel(channel);
});
</script>