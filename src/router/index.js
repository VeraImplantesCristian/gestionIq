// src/router/index.js

// Importamos las dependencias necesarias de Vue Router y Supabase
import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../services/supabase';

// --- Vistas y Layouts ---
import AdminLayout from '../layouts/AdminLayout.vue';
import AdminView from '../views/AdminView.vue';
import FichaView from '../views/FichaView.vue';
import LoginView from '../views/LoginView.vue';
import StatsView from '../views/StatsView.vue';
import InstrumentadoresView from '../views/InstrumentadoresView.vue';
import IncidenciasView from '../views/IncidenciasView.vue';
import RankingView from '../views/RankingView.vue';
import ReclamoView from '../views/ReclamoView.vue';
import QuejasView from '../views/QuejasView.vue';
import PedidosEspecialesView from '../views/PedidosEspecialesView.vue';
import NotificationsView from '../views/NotificationsView.vue';
import ActivitySummaryView from '../views/ActivitySummaryView.vue';

// Importamos las vistas de los componentes de subida
import LogisticaControl from '../views/logistica/LogisticaControl.vue';
import InstrumentadorUpload from '../views/instrumentadores/InstrumentadorUpload.vue';
// ***** NUEVO: Importamos la nueva vista de control de consumo *****
import ConsumoView from '../views/logistica/ConsumoView.vue';


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
    component: AdminLayout, // Usamos el layout que tiene la barra lateral y la cabecera
    meta: { requiresAuth: true }, // Esta meta-información indica que todas las rutas hijas requieren login
    children: [
      { path: '', redirect: '/admin' }, // Redirige la raíz a /admin
      { path: 'admin', name: 'Admin', component: AdminView },
      { path: 'estadisticas', name: 'Estadisticas', component: StatsView },
      { path: 'instrumentadores', name: 'Instrumentadores', component: InstrumentadoresView },
      { path: 'incidencias', name: 'Incidencias', component: IncidenciasView },
      { path: 'ranking', name: 'Ranking', component: RankingView },
      { path: 'quejas', name: 'Quejas', component: QuejasView },
      { path: 'pedidos-especiales', name: 'PedidosEspeciales', component: PedidosEspecialesView },
      { path: 'notificaciones', name: 'Notificaciones', component: NotificationsView },

      // Rutas de prueba para los uploaders
      { 
        path: 'logistica-control', 
        name: 'LogisticaControl', 
        component: LogisticaControl 
      },
      { 
        path: 'instrumentador-upload', 
        name: 'InstrumentadorUpload', 
        component: InstrumentadorUpload 
      },
      
      // ***** NUEVO: Ruta para la herramienta de control de consumo *****
      { 
        path: 'control-consumo', 
        name: 'ControlConsumo', 
        component: ConsumoView 
      },
    ]
  }
];

// Creamos la instancia del router
const router = createRouter({
  history: createWebHistory(), // Usamos el historial del navegador para URLs limpias
  routes,
});

// --- Guardia de Navegación Global (Navigation Guard) ---
// Se ejecuta antes de cada cambio de ruta
router.beforeEach(async (to, from, next) => {
  // Verificamos si la ruta a la que se intenta acceder requiere autenticación
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    // Si requiere autenticación, obtenemos la sesión actual de Supabase
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      // Si no hay sesión, redirigimos al usuario a la página de Login
      next({ name: 'Login' });
    } else {
      // Si hay sesión, permitimos el acceso
      next();
    }
  } else {
    // Si no requiere autenticación, permitimos el acceso directamente
    next();
  }
});

// Exportamos el router para que sea usado en main.js
export default router;