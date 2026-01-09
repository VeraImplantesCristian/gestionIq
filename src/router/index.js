// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
// Importa el cliente de Supabase para la lógica de autenticación.
import { supabase } from '../services/supabase';

// --- Vistas y Layouts ---
import AdminLayout from '../layouts/AdminLayout.vue';
import AdminView from '../views/AdminView.vue';
import FichaView from '../views/FichaView.vue';
import LoginView from '../views/LoginView.vue';
import StatsView from '../views/StatsView.vue';
import InstrumentadoresView from '../views/InstrumentadoresView.vue';
import IncidenciasView from '../views/IncidenciasView.vue';
import ReclamoView from '../views/ReclamoView.vue';
import QuejasView from '../views/QuejasView.vue';
import PedidosEspecialesView from '../views/PedidosEspecialesView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import ActivitySummaryView from '../views/ActivitySummaryView.vue';
import LogisticaControl from '../views/logistica/LogisticaControl.vue';
import InstrumentadorUpload from '../views/instrumentadores/InstrumentadorUpload.vue';
import ConsumoView from '../views/logistica/ConsumoView.vue';
import PagosDashboardView from '../views/admin/PagosDashboardView.vue';
import HistorialPagosView from '../views/admin/HistorialPagosView.vue';
// --- INICIO DE LA MODIFICACIÓN ---
// Se importa la nueva vista de configuración.
import ConfigView from '../views/ConfigView.vue';
// --- FIN DE LA MODIFICACIÓN ---


// --- Definición de Rutas ---
const routes = [
  // --- Rutas Públicas (accesibles sin iniciar sesión) ---
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/ficha/:token',
    name: 'Ficha',
    component: FichaView,
    props: true
  },
  {
    path: '/f/:short_code',
    name: 'FichaCorta',
    component: FichaView,
    props: true
  },
  {
    path: '/reclamo',
    name: 'Reclamo',
    component: ReclamoView
  },
  {
    path: '/resumen/:token',
    name: 'ActivitySummary',
    component: ActivitySummaryView,
    props: true,
  },

  // --- Rutas Protegidas (requieren autenticación) ---
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: '/admin' },
      { path: 'admin', name: 'Admin', component: AdminView },
      { path: 'estadisticas', name: 'Estadisticas', component: StatsView },
      { path: 'instrumentadores', name: 'Instrumentadores', component: InstrumentadoresView },
      { path: 'incidencias', name: 'Incidencias', component: IncidenciasView },
      { path: 'quejas', name: 'Quejas', component: QuejasView },
      { path: 'pedidos-especiales', name: 'PedidosEspeciales', component: PedidosEspecialesView },
      { path: 'notificaciones', name: 'Notificaciones', component: NotificationsView },
      { path: 'logistica-control', name: 'LogisticaControl', component: LogisticaControl },
      { path: 'instrumentador-upload', name: 'InstrumentadorUpload', component: InstrumentadorUpload },
      { path: 'control-consumo', name: 'ControlConsumo', component: ConsumoView },
      
      {
        path: 'pagos',
        name: 'PagosDashboard',
        component: PagosDashboardView,
        meta: { requiredRole: 'admin' }
      },
      {
        path: 'historial-pagos',
        name: 'HistorialPagos',
        component: HistorialPagosView,
        meta: { requiredRole: 'admin' }
      },
      // --- INICIO DE LA MODIFICACIÓN ---
      // Se añade la nueva ruta para la vista de configuración.
      // Se protege para que solo los administradores puedan acceder.
      {
        path: 'configuracion',
        name: 'Configuracion',
        component: ConfigView,
        meta: { requiredRole: 'admin' }
      }
      // --- FIN DE LA MODIFICACIÓN ---
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- Guardia de Navegación Global (con verificación de rol) ---
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiredRole = to.meta.requiredRole;

  if (requiresAuth && !user) {
    return next({ name: 'Login' });
  }
  
  if (requiredRole) {
    // Aseguramos que el usuario y sus metadatos existan antes de comprobar el rol.
    if (!user || user.app_metadata?.role !== requiredRole) {
      console.warn(`Acceso denegado a '${to.path}'. Rol requerido: '${requiredRole}', Rol del usuario: '${user?.app_metadata?.role || 'ninguno'}'.`);
      // Redirige a la página principal de admin si el rol no es el correcto.
      return next({ name: 'Admin' });
    }
  }

  next();
});

export default router;