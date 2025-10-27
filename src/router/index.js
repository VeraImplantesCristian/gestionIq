// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabase';

// Importamos los componentes de las vistas.
import AdminView from '../views/AdminView.vue'
import FichaView from '../views/FichaView.vue'
import LoginView from '../views/LoginView.vue';
import StatsView from '../views/StatsView.vue';
import InstrumentadoresView from '../views/InstrumentadoresView.vue';
import IncidenciasView from '../views/IncidenciasView.vue';
import RankingView from '../views/RankingView.vue';

const routes = [
  {
    path: '/',
    redirect: '/admin'
  },
  {
    path: '/admin',
    name: 'Admin',
    component: AdminView,
    meta: { requiresAuth: true }
  },
  {
    path: '/estadisticas',
    name: 'Estadisticas',
    component: StatsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/instrumentadores',
    name: 'Instrumentadores',
    component: InstrumentadoresView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/incidencias',
    name: 'Incidencias',
    component: IncidenciasView,
    meta: { requiresAuth: true }
  },
  {
    path: '/ranking',
    name: 'Ranking',
    component: RankingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/ficha/:token',
    name: 'Ficha',
    component: FichaView,
    props: true
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

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

export default router