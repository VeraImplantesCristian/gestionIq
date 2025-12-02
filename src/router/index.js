// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../services/supabase';

// Importamos el Layout que actuará como padre
import AdminLayout from '../layouts/AdminLayout.vue';

// Importamos todas las vistas
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

// ========= INICIO DE LA MEJORA =========
// 1. Importamos el nuevo componente de vista que vamos a crear.
import ActivitySummaryView from '../views/ActivitySummaryView.vue';
// ========= FIN DE LA MEJORA =========

const routes = [
  // Rutas públicas (no usan AdminLayout)
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

  // ========= INICIO DE LA MEJORA =========
  // 2. Añadimos la nueva ruta para el resumen de actividad.
  // Es una ruta pública porque el acceso está protegido por el token en la URL.
  {
    // La ruta será, por ejemplo, /resumen/a1b2c3d4e5f6a7b8
    path: '/resumen/:token',
    name: 'ActivitySummary',
    component: ActivitySummaryView,
    // 'props: true' pasa el parámetro ':token' como una prop al componente.
    props: true,
  },
  // ========= FIN DE LA MEJORA =========

  // Rutas protegidas que usan AdminLayout
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
      { path: 'ranking', name: 'Ranking', component: RankingView },
      { path: 'quejas', name: 'Quejas', component: QuejasView },
      { path: 'pedidos-specials', name: 'PedidosEspeciales', component: PedidosEspecialesView }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// El guardia de navegación se mantiene sin cambios.
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  if (requiresAuth) {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      next({ name: 'Login' });
    } else {
      next();
    }
  } else {
    next();
  }
});

export default router;