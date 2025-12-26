<!-- src/views/ActivitySummaryView.vue -->
<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">
    
    <!-- ESTADO 1: PANTALLA DE AUTENTICACIÓN (PIDE EL DNI) -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto pt-16">
      <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-center">
        <img src="/2.svg" alt="Districorr" class="h-10 mx-auto mb-6 opacity-80">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Resumen de Actividad</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2 mb-6">
          Por favor, ingresá tu DNI para acceder a tu información.
        </p>
        
        <form @submit.prevent="authenticate">
          <div class="form-group">
            <label for="dni" class="sr-only">DNI</label>
            <input 
              type="text" 
              id="dni" 
              v-model="dni"
              placeholder="Ingresá tu DNI (con o sin puntos)"
              class="form-input"
              required
            />
          </div>
          
          <p v-if="error" class="error-message">{{ error }}</p>

          <button type="submit" :disabled="isLoading" class="w-full btn-primary">
            {{ isLoading ? 'Verificando...' : 'Continuar' }}
          </button>
        </form>
      </div>
    </div>

    <!-- ESTADO 2: VISTA DE DATOS (Rediseñada) -->
    <div v-else class="max-w-7xl mx-auto">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Tu Resumen de Actividad</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Gestiona tus cirugías, pagos y estados de ficha.</p>
      </header>

      <!-- Indicadores Superiores -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="stat-card">
          <h3 class="stat-title">Total Cirugías (Mes)</h3>
          <p class="stat-value">{{ totalCirugiasMes }}</p>
        </div>
        <div class="stat-card">
          <h3 class="stat-title">Pendientes de Pago</h3>
          <p class="stat-value">{{ pendientesDePago }}</p>
        </div>
      </div>

      <!-- Grilla de Tarjetas de Reporte -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div v-for="report in activityData" :key="report.id" class="report-card">
          <div class="card-header">
            <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z"></path></svg>
              <span>{{ formatDate(report.fecha_cirugia) }}</span>
            </div>
            <span class="status-badge" :class="getStatusClass(report.estado)">
              {{ report.estado }}
            </span>
          </div>

          <div class="card-body">
            <h2 class="font-bold text-lg text-slate-800 dark:text-slate-100">{{ report.paciente }}</h2>
            <div class="text-sm text-slate-600 dark:text-slate-300 mt-2 space-y-1">
              <p><strong>Institución / Médico:</strong> {{ report.cliente_nombre || 'N/A' }} / {{ report.medico_nombre || 'N/A' }}</p>
            </div>
          </div>

          <div class="card-footer">
            <!-- Lógica para mostrar el estado de pago -->
            <div v-if="report.estado === 'Enviado'">
              <div v-if="report.estado_pago === 'Pagado'" class="payment-info">
                <span class="status-badge bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300">Pagado</span>
                
                <!-- Usamos un v-if para mostrar el enlace solo si existe un comprobante. -->
                <a 
                  v-if="report.comprobante_object_key" 
                  :href="getComprobanteUrl(report.comprobante_object_key)" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  class="action-link"
                >
                  Ver recibo ↗
                </a>
              </div>
              <div v-else>
                <span class="status-badge bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">Pendiente de Pago</span>
              </div>
            </div>
            <div v-else>
              <span class="text-sm text-slate-400">Completa la ficha para ver el estado de pago.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';

// --- ESTADO DEL COMPONENTE ---
const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const dni = ref('');
const activityData = ref([]);

const route = useRoute();
const toast = useToast();

const token = route.params.token;
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

// --- LÓGICA DE AUTENTICACIÓN ---
const authenticate = async () => {
  if (!dni.value.trim()) {
    error.value = "El DNI es requerido.";
    return;
  }

  isLoading.value = true;
  error.value = null;

  try {
    const cleanDni = dni.value.trim().replace(/\D/g, '');

    const { data, error: rpcError } = await supabase.rpc('autenticar_y_obtener_resumen', {
      p_token: token,
      p_dni: cleanDni
    });

    if (rpcError) throw rpcError;

    if (data) {
      activityData.value = data;
      isAuthenticated.value = true;
      toast.success("Acceso concedido.");
    } else {
      error.value = "Datos incorrectos. Por favor, verificá tu DNI.";
      dni.value = '';
      toast.error("Acceso denegado.");
    }

  } catch (err) {
    console.error("Error en la autenticación:", err);
    error.value = "Ocurrió un error inesperado. Intentá de nuevo.";
    toast.error("Error de conexión.");
  } finally {
    isLoading.value = false;
  }
};

// --- PROPIEDADES COMPUTADAS PARA LOS INDICADORES ---
const totalCirugiasMes = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return activityData.value.filter(report => {
    const reportDate = new Date(report.fecha_cirugia);
    return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
  }).length;
});

const pendientesDePago = computed(() => {
  return activityData.value.filter(report => report.estado === 'Enviado' && report.estado_pago === 'Pendiente').length;
});

// --- FUNCIONES AUXILIARES DE FORMATO ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' };
  return new Date(dateString).toLocaleDateString('es-AR', options);
};

const getStatusClass = (status) => {
  const statusMap = {
    'Pendiente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
    'Enviado': 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    'Expirado': 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  };
  return statusMap[status] || 'bg-slate-100 text-slate-800';
};

const getComprobanteUrl = (objectKey) => {
  if (!objectKey) return '#';
  return `${R2_PUBLIC_URL}/${objectKey}`;
};
</script>

<style scoped>
/* Estilos para el formulario de DNI */
.form-input {
  @apply w-full px-4 py-3 border border-slate-300 rounded-lg text-center text-lg;
  @apply dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100;
}
.error-message {
  @apply text-red-500 text-sm mt-2 mb-4;
}
.btn-primary {
  @apply w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors;
  @apply hover:bg-blue-700;
  @apply disabled:bg-slate-400 disabled:cursor-not-allowed;
}

/* Estilos para los nuevos indicadores */
.stat-card {
  @apply bg-white dark:bg-slate-800 p-6 rounded-xl shadow;
}
.stat-title {
  @apply text-sm font-medium text-slate-500 dark:text-slate-400;
}
.stat-value {
  @apply text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1;
}

/* Estilos para las nuevas tarjetas de reporte */
.report-card {
  @apply bg-white dark:bg-slate-800 rounded-xl shadow flex flex-col transition-transform duration-200 hover:scale-[1.02];
}
.card-header {
  @apply flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700;
}
.card-body {
  @apply p-4 flex-grow;
}
.card-footer {
  @apply p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl;
}
.payment-info {
  @apply flex justify-between items-center;
}
.action-link {
  @apply text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline;
}
.status-badge {
  @apply inline-block px-3 py-1 rounded-full text-xs font-semibold;
}
</style>