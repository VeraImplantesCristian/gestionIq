// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../services/supabase';

// Importamos los componentes de las vistas.
import AdminView from '../views/AdminView.vue'
import FichaView from '../views/FichaView.vue'
import LoginView from '../views/LoginView.vue';
// **NUEVO:** Importamos la vista de estadísticas
import StatsView from '../views/StatsView.vue';

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
    // **NUEVA RUTA:** Creamos la ruta para la página de estadísticas
    path: '/estadisticas',
    name: 'Estadisticas',
    component: StatsView,
    meta: { requiresAuth: true } // La protegemos para que solo accedan admins
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

// La guarda de navegación global no necesita cambios, protegerá automáticamente
// cualquier ruta que tenga meta: { requiresAuth: true }.
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