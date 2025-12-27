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

    <!-- ESTADO 2: VISTA DE DATOS -->
    <div v-else class="max-w-7xl mx-auto">
      <header class="mb-6">
        <h1 class="text-3xl font-bold text-slate-800 dark:text-slate-100">Tu Resumen de Actividad</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-1">Gestiona tus cirugías, pagos y estados de ficha.</p>
      </header>

      <!-- Tabs -->
      <div class="tabs-wrap mb-8">
        <button
          class="tab-btn"
          :class="activeTab === 'resumen' ? 'tab-btn--active' : ''"
          type="button"
          @click="activeTab = 'resumen'"
        >
          Resumen
        </button>
        <button
          class="tab-btn"
          :class="activeTab === 'faq' ? 'tab-btn--active' : ''"
          type="button"
          @click="activeTab = 'faq'"
        >
          Preguntas Frecuentes
        </button>
      </div>

      <!-- TAB 1: RESUMEN -->
      <div v-if="activeTab === 'resumen'">
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
        <div v-if="paginatedActivity.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="report in paginatedActivity" :key="report.id" class="report-card">
            <div class="card-header">
              <div class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2Z">
                  </path>
                </svg>
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
              <div v-if="report.estado === 'Enviado'">
                <div v-if="report.estado_pago === 'Pagado'" class="payment-info">
                  <span class="status-badge bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300">Pagado</span>
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
                  <span class="status-badge bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">
                    Pendiente de Pago
                  </span>
                </div>
              </div>
              <div v-else>
                <span class="text-sm text-slate-400">Completa la ficha para ver el estado de pago.</span>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center p-10 bg-white dark:bg-slate-800 rounded-xl shadow">
          <p class="text-slate-500">No se encontró actividad para mostrar.</p>
        </div>

        <!-- Controles de Paginación -->
        <PaginationControls
          v-if="totalItems > itemsPerPage"
          :current-page="currentPage"
          :total-items="totalItems"
          :items-per-page="itemsPerPage"
          @page-changed="goToPage"
          class="mt-8"
        />
      </div>

      <!-- TAB 2: FAQ -->
      <div v-else class="faq-wrap">
        <div class="faq-card">
          <div class="faq-header">
            <h2 class="faq-title">Preguntas Frecuentes</h2>
            <p class="faq-subtitle">
              Respuestas rápidas sobre pagos, comprobantes y estados. Si tu caso es especial, escribinos y lo revisamos.
            </p>
          </div>

          <div class="faq-list">
            <div
              v-for="item in faqItems"
              :key="item.id"
              class="faq-item"
            >
              <button
                type="button"
                class="faq-q"
                @click="toggleFaq(item.id)"
                :aria-expanded="openFaqId === item.id"
              >
                <span class="faq-q-text">{{ item.q }}</span>
                <svg
                  class="faq-chevron"
                  :class="openFaqId === item.id ? 'faq-chevron--open' : ''"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>

              <div v-show="openFaqId === item.id" class="faq-a">
                <p class="faq-a-text" v-html="item.a"></p>
              </div>
            </div>
          </div>

          <div class="faq-footer">
            <div class="faq-tip">
              <strong>Tip:</strong> Si ves “Pendiente de pago”, normalmente es porque falta cerrar circuito:
              retorno de material + control + ficha completa.
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
import PaginationControls from '../components/PaginationControls.vue';

const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const dni = ref('');
const allActivityData = ref([]); // Almacena TODA la actividad
const currentPage = ref(1);
const itemsPerPage = ref(9); // 9 para que se vea bien en una grilla de 3 columnas

// Tabs
const activeTab = ref('resumen'); // 'resumen' | 'faq'

// FAQ (acordeón)
const openFaqId = ref(null);
const toggleFaq = (id) => {
  openFaqId.value = openFaqId.value === id ? null : id;
};

const faqItems = ref([
  {
    id: 'pago-cuando',
    q: '¿Cuándo se paga una cirugía?',
    a: `El pago se realiza <strong>dentro de los 7 días hábiles</strong> posteriores a que:<br>
        • El material regresa al depósito y se controla<br>
        • La ficha técnica esté <strong>completa y validada</strong>.`,
  },
  {
    id: 'pendiente-por-que',
    q: '¿Por qué figura “Pendiente de pago” si ya instrumenté la cirugía?',
    a: `Porque el pago no se dispara solo por “instrumentar”. Se paga cuando se cierra el circuito:
        <strong>retorno de material</strong>, <strong>control</strong> y <strong>ficha técnica completa</strong>.`,
  },
  {
    id: 'sin-ficha',
    q: '¿Puedo cobrar si no completé la ficha técnica?',
    a: `No. La ficha técnica es <strong>obligatoria</strong> y forma parte de la política de la empresa.
        Sin ficha → <strong>no se procesa el pago</strong>.`,
  },
  {
    id: 'pago-agrupado',
    q: '¿Qué pasa si me pagaron varias cirugías juntas?',
    a: `Es normal. Muchas veces se agrupan varias cirugías de una misma semana en <strong>un solo pago</strong>
        (un solo comprobante).`,
  },
  {
    id: 'comprobante-donde',
    q: '¿Dónde veo mi comprobante de pago?',
    a: `Cuando el estado figura como <strong>“Pagado”</strong>, vas a ver el botón <strong>“Ver recibo”</strong>
        disponible en la tarjeta del reporte.`,
  },
  {
    id: 'por-que-ficha',
    q: '¿Por qué es tan importante completar la ficha técnica?',
    a: `Porque permite validar el evento quirúrgico, controlar materiales y registrar observaciones.
        Es el paso que habilita el cierre del circuito y el pago.`,
  },
  {
    id: 'no-veo-pago',
    q: '¿Por qué no veo el estado de pago?',
    a: `Hasta que la ficha no esté completa y enviada, el sistema puede mostrarte “Completa la ficha…”.
        Recién con <strong>Enviado</strong> se muestra el estado de pago.`,
  },
  {
    id: 'estados',
    q: '¿Qué significa cada estado?',
    a: `<strong>Pendiente:</strong> falta completar o validar la ficha.<br>
        <strong>Enviado:</strong> ficha cerrada y circuito finalizado.<br>
        <strong>Pagado:</strong> pago realizado y comprobante disponible.`,
  },
  {
    id: 'dos-tiempos',
    q: '¿Qué pasa si una cirugía se reprograma o tiene dos tiempos quirúrgicos?',
    a: `Cada tiempo se gestiona como un <strong>evento logístico distinto</strong>.
        Eso impacta en materiales, fichas y pagos.`,
  },
]);

const route = useRoute();
const toast = useToast();

const token = route.params.token;
const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;

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
      allActivityData.value = data;
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

// --- LÓGICA DE PAGINACIÓN ---
const totalItems = computed(() => allActivityData.value.length);

const paginatedActivity = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return allActivityData.value.slice(start, end);
});

const goToPage = (page) => {
  currentPage.value = page;
};

// --- PROPIEDADES COMPUTADAS PARA LOS INDICADORES ---
const totalCirugiasMes = computed(() => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  return allActivityData.value.filter(report => {
    const reportDate = new Date(report.fecha_cirugia);
    return reportDate.getMonth() === currentMonth && reportDate.getFullYear() === currentYear;
  }).length;
});

const pendientesDePago = computed(() => {
  return allActivityData.value.filter(report => report.estado === 'Enviado' && report.estado_pago === 'Pendiente').length;
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
.stat-card {
  @apply bg-white dark:bg-slate-800 p-6 rounded-xl shadow;
}
.stat-title {
  @apply text-sm font-medium text-slate-500 dark:text-slate-400;
}
.stat-value {
  @apply text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1;
}
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

/* Tabs */
.tabs-wrap {
  @apply inline-flex bg-white dark:bg-slate-800 rounded-xl shadow p-1 gap-1;
}
.tab-btn {
  @apply px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors;
  @apply hover:bg-slate-100 dark:hover:bg-slate-700/60;
}
.tab-btn--active {
  @apply bg-slate-900 text-white dark:bg-white dark:text-slate-900;
}

/* FAQ */
.faq-wrap {
  @apply w-full;
}
.faq-card {
  @apply bg-white dark:bg-slate-800 rounded-2xl shadow p-6;
}
.faq-header {
  @apply mb-6;
}
.faq-title {
  @apply text-xl font-bold text-slate-800 dark:text-slate-100;
}
.faq-subtitle {
  @apply mt-2 text-slate-600 dark:text-slate-300;
}
.faq-list {
  @apply divide-y divide-slate-100 dark:divide-slate-700;
}
.faq-item {
  @apply py-3;
}
.faq-q {
  @apply w-full flex items-center justify-between gap-3 text-left;
  @apply px-2 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors;
}
.faq-q-text {
  @apply font-semibold text-slate-800 dark:text-slate-100;
}
.faq-chevron {
  @apply w-5 h-5 text-slate-500 dark:text-slate-300 transition-transform;
}
.faq-chevron--open {
  @apply rotate-180;
}
.faq-a {
  @apply px-2 pt-2;
}
.faq-a-text {
  @apply text-slate-600 dark:text-slate-300 leading-relaxed;
}
.faq-footer {
  @apply mt-6;
}
.faq-tip {
  @apply text-sm bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-slate-700 dark:text-slate-200;
}
</style>
