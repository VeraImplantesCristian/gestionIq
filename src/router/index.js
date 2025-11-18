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
    path: '/reclamo',
    name: 'Reclamo',
    component: ReclamoView
  },

  // ========= INICIO DE LA SOLUCIÓN: RUTAS PROTEGIDAS ANIDADAS =========
  // Creamos una ruta "padre" que usa AdminLayout como su componente.
  // Todas las rutas que pongamos dentro de 'children' se renderizarán
  // dentro del <router-view> de AdminLayout.
  {
    path: '/',
    component: AdminLayout,
    meta: { requiresAuth: true }, // Protegemos todo el grupo
    children: [
      {
        path: '', // Redirige de la raíz ('/') a '/admin'
        redirect: '/admin'
      },
      {
        path: 'admin', // Se accede con /admin
        name: 'Admin',
        component: AdminView,
      },
      {
        path: 'estadisticas', // Se accede con /estadisticas
        name: 'Estadisticas',
        component: StatsView,
      },
      {
        path: 'instrumentadores', // Se accede con /instrumentadores
        name: 'Instrumentadores',
        component: InstrumentadoresView,
      },
      {
        path: 'incidencias', // Se accede con /incidencias
        name: 'Incidencias',
        component: IncidenciasView,
      },
      {
        path: 'ranking', // Se accede con /ranking
        name: 'Ranking',
        component: RankingView,
      },
      {
        path: 'quejas', // Se accede con /quejas
        name: 'Quejas',
        component: QuejasView,
      }
    ]
  }
  // ========= FIN DE LA SOLUCIÓN =========
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// El guardia de navegación sigue funcionando perfectamente con esta nueva estructura.
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