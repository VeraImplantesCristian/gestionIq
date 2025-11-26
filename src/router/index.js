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

// ========= INICIO DE LA SOLUCIÓN: IMPORTAR LA NUEVA VISTA =========
import PedidosEspecialesView from '../views/PedidosEspecialesView.vue';
// ========= FIN DE LA SOLUCIÓN =========


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
  // La ruta del short link '/f/' debería estar aquí si la tienes
  // { path: '/f/:short_code', ... }
  {
    path: '/reclamo',
    name: 'Reclamo',
    component: ReclamoView
  },

  // Rutas protegidas que usan AdminLayout
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/admin'
      },
      {
        path: 'admin',
        name: 'Admin',
        component: AdminView,
      },
      {
        path: 'estadisticas',
        name: 'Estadisticas',
        component: StatsView,
      },
      {
        path: 'instrumentadores',
        name: 'Instrumentadores',
        component: InstrumentadoresView,
      },
      {
        path: 'incidencias',
        name: 'Incidencias',
        component: IncidenciasView,
      },
      {
        path: 'ranking',
        name: 'Ranking',
        component: RankingView,
      },
      {
        path: 'quejas',
        name: 'Quejas',
        component: QuejasView,
      },
      // ========= INICIO DE LA SOLUCIÓN: AÑADIR LA NUEVA RUTA ANIDADA =========
      {
        path: 'pedidos-especiales', // Se accede con /pedidos-especiales
        name: 'PedidosEspeciales',
        component: PedidosEspecialesView,
      }
      // ========= FIN DE LA SOLUCIÓN =========
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// El guardia de navegación protege todas las rutas anidadas automáticamente.
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