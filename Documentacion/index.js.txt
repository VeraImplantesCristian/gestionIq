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
// --- INICIO DE LA MODIFICACIÓN ---
// Se elimina la importación de RankingView, ya que el archivo fue movido y renombrado.
// import RankingView from '../views/RankingView.vue';
// --- FIN DE LA MODIFICACIÓN ---
import ReclamoView from '../views/ReclamoView.vue';
import QuejasView from '../views/QuejasView.vue';
import PedidosEspecialesView from '../views/PedidosEspecialesView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import ActivitySummaryView from '../views/ActivitySummaryView.vue';
import LogisticaControl from '../views/logistica/LogisticaControl.vue';
import InstrumentadorUpload from '../views/instrumentadores/InstrumentadorUpload.vue';
import ConsumoView from '../views/logistica/ConsumoView.vue';
import GestionPagosView from '../views/admin/GestionPagosView.vue';
import PagosDashboardView from '../views/admin/PagosDashboardView.vue';
import CrearOrdenDePagoView from '../views/admin/CrearOrdenDePagoView.vue';
import HistorialPagosView from '../views/admin/HistorialPagosView.vue';


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
      // --- INICIO DE LA MODIFICACIÓN ---
      // Se elimina la definición de la ruta 'ranking', ya que ahora es una pestaña
      // dentro de 'instrumentadores' y no una página independiente.
      // { path: 'ranking', name: 'Ranking', component: RankingView },
      // --- FIN DE LA MODIFICACIÓN ---
      { path: 'quejas', name: 'Quejas', component: QuejasView },
      { path: 'pedidos-especiales', name: 'PedidosEspeciales', component: PedidosEspecialesView },
      { path: 'notificaciones', name: 'Notificaciones', component: NotificationsView },
      { path: 'logistica-control', name: 'LogisticaControl', component: LogisticaControl },
      { path: 'instrumentador-upload', name: 'InstrumentadorUpload', component: InstrumentadorUpload },
      { path: 'control-consumo', name: 'ControlConsumo', component: ConsumoView },
      
      { 
        path: 'gestion-pagos', 
        name: 'GestionPagos', 
        component: GestionPagosView,
        meta: { requiredRole: 'admin' }
      },
      {
        path: 'pagos',
        name: 'PagosDashboard',
        component: PagosDashboardView,
        meta: { requiredRole: 'admin' }
      },
      {
        path: 'crear-orden-pago',
        name: 'CrearOrdenDePago',
        component: CrearOrdenDePagoView,
        meta: { requiredRole: 'admin' }
      },
      {
        path: 'historial-pagos',
        name: 'HistorialPagos',
        component: HistorialPagosView,
        meta: { requiredRole: 'admin' }
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// --- Guardia de Navegación Global (con verificación de rol) ---
// Esta función se ejecuta antes de cada cambio de ruta.
router.beforeEach(async (to, from, next) => {
  // Obtiene la sesión actual del usuario desde Supabase.
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  // Verifica si la ruta destino requiere autenticación.
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  // Obtiene el rol requerido para la ruta, si lo tiene.
  const requiredRole = to.meta.requiredRole;

  // Si la ruta requiere autenticación y no hay usuario, redirige al Login.
  if (requiresAuth && !user) {
    return next({ name: 'Login' });
  }
  
  // Si la ruta requiere un rol específico...
  if (requiredRole) {
    // ...y el rol del usuario no coincide, se deniega el acceso.
    if (user?.app_metadata?.role !== requiredRole) {
      console.warn(`Acceso denegado a '${to.path}'. Rol requerido: '${requiredRole}', Rol del usuario: '${user?.app_metadata?.role}'.`);
      // Redirige a una página segura, como el dashboard principal.
      return next({ name: 'Admin' });
    }
  }

  // Si todas las comprobaciones pasan, permite la navegación.
  next();
});

export default router;