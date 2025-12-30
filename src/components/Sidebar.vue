<!-- src/components/Sidebar.vue -->
<template>
  <!-- El overlay para cerrar el menú en móvil -->
  <div v-if="isOpen" class="fixed inset-0 z-20 bg-black/30 backdrop-blur-[1px] md:hidden" @click="$emit('toggle-sidebar')" />

  <aside ref="sideRef" :class="['w-64 bg-white dark:bg-slate-800 shadow-md flex flex-col fixed inset-y-0 left-0 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0', isOpen ? 'translate-x-0' : '-translate-x-full']" role="navigation" aria-label="Menú principal">
    <!-- Cabecera del Sidebar -->
    <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
      <div class="flex items-center gap-2">
        <span class="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500 text-white font-bold">IQ</span>
        <h1 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Gestión IQ</h1>
      </div>
    </div>

    <!-- Navegación Principal -->
    <nav class="flex-grow p-3 space-y-1">
      <div v-for="item in visibleItems" :key="item.label">
        <!-- Enlace simple -->
        <button v-if="!item.children" @click="handleNavigation(item)" class="nav-link group" :aria-current="isActive(item) ? 'page' : undefined">
          <component :is="item.icon" class="w-5 h-5 shrink-0"/>
          <span class="truncate">{{ item.label }}</span>
          <span v-if="item.badge" class="nav-badge">{{ item.badge }}</span>
        </button>
        <!-- Enlace con submenú -->
        <div v-else>
          <button @click="toggleSubmenu(item.label)" class="nav-link group w-full" :aria-current="isActive(item) ? 'page' : undefined">
            <component :is="item.icon" class="w-5 h-5 shrink-0"/>
            <span class="truncate">{{ item.label }}</span>
            <svg class="ml-auto h-4 w-4 transform transition-transform duration-200" :class="isSubmenuOpen(item.label) ? 'rotate-90' : ''" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
          </button>
          <div v-show="isSubmenuOpen(item.label)" class="pl-4 mt-1 space-y-1">
            <button v-for="child in item.children" :key="child.label" @click="handleNavigation(child)" class="nav-link group w-full" :aria-current="isActive(child) ? 'page' : undefined">
              <component :is="child.icon" class="w-5 h-5 shrink-0"/>
              <span class="truncate">{{ child.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Pie del Sidebar -->
    <div class="p-4 mt-auto border-t border-gray-200 dark:border-slate-700">
      <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg">
        <component :is="LogoutIcon" class="w-5 h-5"/>
        <span>{{ loggingOut ? 'Cerrando…' : 'Cerrar sesión' }}</span>
      </button>
      <p class="mt-2 text-[11px] text-slate-400 text-center select-none">v{{ appVersion }}</p>
    </div>
  </aside>

  <!-- Modal de Autorización -->
  <AuthorizationModal
    :show="isAuthorizationModalVisible"
    @authorized="onAuthorized"
    @cancelled="onCancelled"
  />
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, h } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import { useAuthorization } from '../composables/useAuthorization';
import AuthorizationModal from './admin/AuthorizationModal.vue';

const props = defineProps({ 
  isOpen: Boolean, 
  userRole: { type: String, default: 'admin' } 
});

const emit = defineEmits(['toggle-sidebar']);

const router = useRouter();
const route = useRoute();
const toast = useToast();
const { isAuthorizationModalVisible, requestAuthorization, onAuthorized, onCancelled } = useAuthorization();

const openSubmenus = ref([]);
const isSubmenuOpen = (label) => openSubmenus.value.includes(label);
const toggleSubmenu = (label) => {
  if (isSubmenuOpen(label)) {
    openSubmenus.value = openSubmenus.value.filter(item => item !== label);
  } else {
    openSubmenus.value.push(label);
  }
};

const sideRef = ref(null);
const onKey = (e) => { if (e.key === 'Escape' && props.isOpen) emit('toggle-sidebar'); };
onMounted(() => document.addEventListener('keydown', onKey));
onBeforeUnmount(() => document.removeEventListener('keydown', onKey));

// --- DEFINICIÓN DE ICONOS ---
const PanelIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', 'stroke-width':'2', d:'M4 6h16M4 12h16m-7 6h7' }) ]) };
const RankingIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', 'stroke-width':'2', d:'M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z' }), h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', 'stroke-width':'2', d:'M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z' }) ]) };
const StatsIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', 'stroke-width':'2', d:'M16 8v8m-4-5v5m-4-2v2M5 20h14a2 2 0 002-2V6a2 2 0 002-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }) ]) };
const InstrumentadoresIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', 'stroke-width':'2', d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.124-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.124-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' }) ]) };
const IncidenciasIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', 'stroke-width':'2', d:'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' }) ]) };
const HeartIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4.318 6.318a4.5 4.5 0 016.364 0L12 7.5l1.318-1.182a4.5 4.5 0 116.364 6.364L12 21l-7.682-7.318a4.5 4.5 0 010-6.364z' }) ]) };
const GiftIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7' }) ]) };
const LogoutIcon = { render: () => h('svg', { class: 'w-5 h-5', fill:'none', stroke:'currentColor', viewBox:'0 0 24 24' }, [ h('path', { 'stroke-linecap':'round','stroke-linejoin':'round','stroke-width':'2', d:'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1' }) ]) };
const UploadIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12' }) ]) };
const TruckIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M13 17H6V6h11v5l-4 4H9' }) ]) };
const DollarIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8v1m0 6v1m6-1a9 9 0 11-18 0 9 9 0 0118 0z' }) ]) };
const HistoryIcon = { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' }) ]) };

// --- ESTRUCTURA DE NAVEGACIÓN ---
const items = computed(() => ([
  { label: 'Panel de Cirugías', to: { name: 'Admin' }, icon: PanelIcon, roles: ['admin','coord','user'] },
  // --- INICIO DE LA MODIFICACIÓN ---
  // Se elimina el objeto que define el enlace a 'Ranking IQ'.
  // Esta ruta ya no es necesaria como un elemento principal del menú, ya que se integró como pestaña.
  // { label: 'Ranking IQ', to: { name: 'Ranking' }, icon: RankingIcon, roles: ['admin','coord'] },
  // --- FIN DE LA MODIFICACIÓN ---
  { label: 'Estadísticas', to: { name: 'Estadisticas' }, badge: 'Nuevo', icon: StatsIcon, roles: ['admin','coord'] },
  { label: 'Instrumentadores', to: { name: 'Instrumentadores' }, icon: InstrumentadoresIcon, roles: ['admin','coord','user'] },
  { label: 'Incidencias', to: { name: 'Incidencias' }, icon: IncidenciasIcon, roles: ['admin','coord'] },
  {
    label: 'Área Médicos',
    icon: HeartIcon,
    roles: ['admin', 'coord'],
    children: [
      { label: 'Gestión de Reclamos', to: { name: 'Quejas' }, icon: { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24'}, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' }) ]) } },
      { label: 'Pedidos Especiales', to: { name: 'PedidosEspeciales' }, icon: GiftIcon },
    ]
  },
  {
    label: 'Logística',
    icon: TruckIcon,
    roles: ['admin', 'coord'],
    children: [
      { 
        label: 'Control de Consumo', 
        to: { name: 'ControlConsumo' },
        icon: { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6-4a9 9 0 11-18 0 9 9 0 0118 0z' }) ]) }
      },
    ]
  },
  {
    label: 'Administración',
    icon: DollarIcon,
    roles: ['admin'],
    requiresAuth: true,
    children: [
      { 
        label: 'Pendientes de Pago', 
        to: { name: 'PagosDashboard' },
        icon: { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H4a3 3 0 00-3 3v8a3 3 0 003 3z' }) ]) }
      },
      { 
        label: 'Registrar Lote de Pago', 
        to: { name: 'GestionPagos' },
        icon: { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' }) ]) }
      },
      { 
        label: 'Historial de Pagos', 
        to: { name: 'HistorialPagos' },
        icon: HistoryIcon
      },
    ]
  },
  {
    label: 'Carga de Archivos',
    icon: UploadIcon,
    roles: ['admin', 'coord'],
    children: [
      { 
        label: 'Control Devolución', 
        to: { name: 'LogisticaControl' },
        icon: { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' }) ]) }
      },
      { 
        label: 'Comprobante IQ', 
        to: { name: 'InstrumentadorUpload' },
        icon: { render: () => h('svg', { class: 'w-5 h-5', fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24' }, [ h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z' }), h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M15 13a3 3 0 11-6 0 3 3 0 016 0z' }) ]) }
      },
    ]
  }
]));

const visibleItems = computed(() => items.value.filter(i => i.roles.includes(props.userRole)));

const isActive = (item) => {
  const currentRouteName = route.name;
  if (item.to && item.to.name === currentRouteName) return true;
  if (item.children) {
    return item.children.some(child => child.to && child.to.name === currentRouteName);
  }
  return false;
};

let pendingNavigation = null;

const handleNavigation = async (item) => {
  if (item.action) {
    item.action();
    return;
  }

  const requiresAuth = item.requiresAuth || items.value.find(parent => parent.children?.includes(item))?.requiresAuth;

  if (requiresAuth) {
    pendingNavigation = item.to;
    const authorized = await requestAuthorization();
    
    if (authorized) {
      go(pendingNavigation);
      pendingNavigation = null;
    }
  } else {
    go(item.to);
  }
};

const go = (to) => { 
  if (!to) return;
  router.push(to); 
  if (props.isOpen) {
    emit('toggle-sidebar'); 
  }
};

const loggingOut = ref(false);
const handleLogout = async () => {
  if (loggingOut.value) return;
  loggingOut.value = true;
  const { error } = await supabase.auth.signOut();
  if (error) { toast.error('Error al cerrar sesión: ' + error.message); loggingOut.value = false; }
  else { await router.replace('/login'); }
};

const appVersion = import.meta.env.VITE_APP_VERSION ?? '1.0.0';
</script>

<style scoped>
.nav-link { @apply w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500; }
.nav-link[aria-current="page"] { @apply bg-blue-500 text-white dark:bg-blue-600; }
.nav-badge { @apply ml-auto text-[10px] rounded-full px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-200; }
</style>