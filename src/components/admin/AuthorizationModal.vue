<!-- src/components/admin/AuthorizationModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="modal-overlay" @click.self="$emit('cancelled')">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">Acceso Restringido</h3>
          <p class="modal-subtitle">Por seguridad, por favor confirmá tu contraseña para continuar.</p>
        </div>
        
        <form @submit.prevent="verifyPassword" class="modal-body">
          <div class="form-group">
            <label for="auth-password">Contraseña</label>
            <input 
              id="auth-password"
              v-model="password"
              type="password"
              class="form-input"
              required
              ref="passwordInput"
            />
          </div>
          <p v-if="error" class="error-message">{{ error }}</p>
        </form>

        <div class="modal-footer">
          <button @click="$emit('cancelled')" class="btn-secondary">Cancelar</button>
          <button @click="verifyPassword" :disabled="isLoading" class="btn-primary">
            {{ isLoading ? 'Verificando...' : 'Autorizar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { supabase } from '../../services/supabase';
import { useToast } from 'vue-toastification';

const props = defineProps({
  show: { type: Boolean, default: false }
});

const emit = defineEmits(['authorized', 'cancelled']);

const password = ref('');
const isLoading = ref(false);
const error = ref(null);
const toast = useToast();
const passwordInput = ref(null);

// Cuando el modal se muestra, hacemos foco automáticamente en el campo de contraseña.
watch(() => props.show, (newValue) => {
  if (newValue) {
    nextTick(() => {
      passwordInput.value?.focus();
    });
  }
});

const verifyPassword = async () => {
  if (!password.value) {
    error.value = "La contraseña es requerida.";
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    // Usamos la función 'reauthenticate' de Supabase.
    // Esto es más seguro que un signIn, ya que verifica la sesión actual.
    const { error: authError } = await supabase.auth.reauthenticate();

    if (authError) {
      // Si reauthenticate falla, es probable que la sesión haya expirado.
      // Intentamos un signIn normal como fallback.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no encontrada.");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password.value,
      });
      if (signInError) throw signInError;
    }
    
    toast.success("Autorización exitosa.");
    emit('authorized');
    resetForm();

  } catch (err) {
    console.error("Error de autorización:", err);
    error.value = "Contraseña incorrecta.";
    toast.error("La contraseña no es válida.");
  } finally {
    isLoading.value = false;
  }
};

const resetForm = () => {
  password.value = '';
  error.value = null;
};
</script>

<style scoped>
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 2000; }
.modal-container { background-color: white; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); width: 90%; max-width: 400px; }
.modal-header { text-align: center; padding: 1.5rem 1.5rem 1rem; }
.modal-title { font-size: 1.25rem; font-weight: 600; }
.modal-subtitle { font-size: 0.875rem; color: #6b7280; margin-top: 0.25rem; }
.modal-body { padding: 0 1.5rem 1.5rem; }
.form-group { display: flex; flex-direction: column; gap: 0.5rem; }
label { font-size: 0.875rem; font-weight: 500; }
.form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 6px; }
.error-message { color: #ef4444; font-size: 0.875rem; text-align: center; margin-top: 0.75rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; background-color: #f9fafb; border-top: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; }
.btn-primary { background-color: #2563eb; color: white; padding: 0.5rem 1rem; border-radius: 6px; border: none; cursor: pointer; }
.btn-primary:disabled { background-color: #9ca3af; cursor: not-allowed; }
.btn-secondary { background-color: white; color: #374151; border: 1px solid #d1d5db; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>