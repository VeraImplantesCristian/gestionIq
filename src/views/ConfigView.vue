<!-- src/views/ConfigView.vue -->
<template>
  <div class="p-4 sm:p-6 lg:p-8">
    <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Configuración Técnica</h1>
    <p class="text-slate-600 dark:text-slate-400 mt-1 mb-8">Panel de control para tareas administrativas de alto nivel.</p>

    <!-- Capa de Seguridad #1: Renderizado Condicional -->
    <!-- El contenido solo se muestra si el usuario es el superusuario definido. -->
    <div v-if="isSuperUser">
      
      <!-- Herramienta para Conceder Rol de Administrador -->
      <div class="max-w-2xl mx-auto">
        <div class="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">Conceder Rol de Administrador</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">Busque un usuario y asígnele permisos de administrador.</p>

          <!-- Fase de Búsqueda -->
          <div v-if="!selectedUser">
            <label for="searchUser" class="form-label">Buscar Usuario por Email</label>
            <input 
              id="searchUser"
              type="text" 
              v-model="searchTerm"
              placeholder="ejemplo@dominio.com"
              class="form-input"
            />
            <div v-if="isLoading" class="text-sm text-slate-500 mt-2">Cargando usuarios...</div>
            <div v-else-if="searchTerm && filteredUsers.length > 0" class="mt-2 border border-slate-200 dark:border-slate-700 rounded-md max-h-60 overflow-y-auto">
              <ul>
                <li v-for="user in filteredUsers" :key="user.user_id" @click="selectUser(user)" class="search-result-item">
                  <span>{{ user.email }}</span>
                  <span v-if="user.raw_app_meta_data?.role === 'admin'" class="role-badge">Ya es Admin</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Fase de Confirmación -->
          <div v-else>
            <div class="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg mb-6 text-center">
              <p class="text-sm">Conceder rol de administrador a:</p>
              <p class="font-bold text-lg">{{ selectedUser.email }}</p>
            </div>
            <div class="flex justify-center gap-4">
              <button @click="resetSelection" class="btn-secondary">Cancelar</button>
              <button @click="handleGrantRole" :disabled="isSubmitting" class="btn-primary">
                <span v-if="isSubmitting">Concediendo...</span>
                <span v-else>Confirmar y Conceder Rol</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Mensaje de Acceso Denegado para cualquier otro usuario -->
    <div v-else class="max-w-2xl mx-auto mt-10 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md">
      <h3 class="font-bold">Acceso Denegado</h3>
      <p>No tiene los permisos necesarios para acceder a esta sección.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../services/supabase';
import { useToasts } from '../composables/useToasts';

const { showSuccessToast, showErrorToast } = useToasts();

// Estado para la seguridad y la UI
const isSuperUser = ref(false);
const isLoading = ref(true);
const isSubmitting = ref(false);
const allUsers = ref([]);
const searchTerm = ref('');
const selectedUser = ref(null);

// Capa de Seguridad #2: Comprobación de Email al Cargar
onMounted(async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (user && user.email === 'sistemas@districorr.com.ar') {
    isSuperUser.value = true;
    // Si es superusuario, carga la lista de usuarios.
    await fetchUsers();
  } else {
    isSuperUser.value = false;
    isLoading.value = false;
  }
});

// Lógica para obtener la lista de usuarios desde la RPC segura.
const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const { data, error } = await supabase.rpc('list_all_users');
    if (error) throw error;
    allUsers.value = data || [];
  } catch (err) {
    showErrorToast(err, "No se pudo cargar la lista de usuarios.");
  } finally {
    isLoading.value = false;
  }
};

// Filtra usuarios por email, excluyendo al superusuario y a los que ya son admin.
const filteredUsers = computed(() => {
  if (!searchTerm.value) return [];
  const lowerCaseSearch = searchTerm.value.toLowerCase();
  return allUsers.value.filter(user =>
    user.email.toLowerCase().includes(lowerCaseSearch) &&
    user.email !== 'sistemas@districorr.com.ar' &&
    user.raw_app_meta_data?.role !== 'admin'
  );
});

const selectUser = (user) => {
  selectedUser.value = user;
  searchTerm.value = '';
};

const resetSelection = () => {
  selectedUser.value = null;
};

// Llama a la RPC segura para conceder el rol.
const handleGrantRole = async () => {
  if (!selectedUser.value || isSubmitting.value) return;
  isSubmitting.value = true;
  try {
    const { data, error } = await supabase.rpc('grant_admin_role', {
      p_user_id: selectedUser.value.user_id
    });
    if (error) throw error;
    showSuccessToast(data);
    // Refresca la lista de usuarios y resetea la selección.
    await fetchUsers();
    resetSelection();
  } catch (err) {
    showErrorToast(err, "Error al conceder el rol.");
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1; }
.form-input { @apply px-4 py-2 border border-slate-300 rounded-md w-full; @apply dark:bg-slate-700 dark:border-slate-600; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors; @apply hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.btn-secondary { @apply bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg; @apply hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500; }
.search-result-item { @apply flex justify-between items-center p-3 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700; }
.role-badge { @apply text-xs bg-green-100 text-green-800 font-medium px-2 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300; }
</style>