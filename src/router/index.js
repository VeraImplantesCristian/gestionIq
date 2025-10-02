// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabase';

// Importamos los componentes de las vistas.
import AdminView from '../views/AdminView.vue'
import FichaView from '../views/FichaView.vue'
import LoginView from '../views/LoginView.vue';
import StatsView from '../views/StatsView.vue';
// NUEVO: Importamos la vista de instrumentadores que vamos a crear.
import InstrumentadoresView from '../views/InstrumentadoresView.vue';

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
  // NUEVA RUTA: Creamos la ruta para la página de gestión de instrumentadores.
  {
    path: '/instrumentadores',
    name: 'Instrumentadores',
    component: InstrumentadoresView,
    meta: { requiresAuth: true } // La protegemos para que solo accedan admins.
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