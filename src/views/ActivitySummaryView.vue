<!-- src/views/ActivitySummaryView.vue -->
<template>
  <div class="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 sm:p-8">

    <!-- ESTADO 1: PANTALLA DE AUTENTICACIÓN -->
    <div v-if="!isAuthenticated" class="max-w-md mx-auto pt-16">
      <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg text-center">
        <img src="/2.svg" alt="Districorr" class="h-10 mx-auto mb-6 opacity-80">
        <h1 class="text-2xl font-bold text-slate-800 dark:text-slate-100">Resumen de Actividad</h1>
        <p class="text-slate-600 dark:text-slate-400 mt-2 mb-6">Por favor, ingresá tu DNI para acceder a tu información.</p>
        <form @submit.prevent="authenticate">
          <input v-model="dni" type="text" placeholder="Ingresá tu DNI (con o sin puntos)" class="form-input" required />
          <p v-if="error" class="error-message">{{ error }}</p>
          <button type="submit" :disabled="isLoading" class="w-full btn-primary mt-4">{{ isLoading ? 'Verificando...' : 'Continuar' }}</button>
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
        <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'resumen' }" @click="activeTab = 'resumen'">Resumen de Pagos</button>
        <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'datos' }" @click="activeTab = 'datos'">Mis Datos</button>
        <button class="tab-btn" :class="{ 'tab-btn--active': activeTab === 'faq' }" @click="activeTab = 'faq'">Preguntas Frecuentes</button>
      </div>

      <!-- TAB 1: RESUMEN DE PAGOS -->
      <div v-if="activeTab === 'resumen'">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="stat-card">
            <h3 class="stat-title">Cirugías Pendientes</h3>
            <p class="stat-value">{{ cirugiasPendientesCount }}</p>
          </div>
          <div class="stat-card">
            <h3 class="stat-title">Cobradas (Mes Actual)</h3>
            <p class="stat-value">{{ cirugiasCobradasMesCount }}</p>
          </div>
        </div>
        <section class="mb-12">
          <h2 class="section-title">🟡 Pendientes de Pago</h2>
          <div v-if="pendientes.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div v-for="report in pendientes" :key="report.id" class="report-card-simple">
              <div class="flex justify-between items-start">
                <div>
                  <p class="font-bold text-slate-800 dark:text-slate-100">{{ report.paciente }}</p>
                  <p class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(report.fecha_cirugia) }}</p>
                </div>
                <span class="status-badge bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300">Pendiente</span>
              </div>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-2 text-right">A la espera de lote de pago</p>
            </div>
          </div>
          <div v-else class="empty-state">No tenés cirugías pendientes de pago.</div>
        </section>
        <section>
          <h2 class="section-title">🟢 Histórico de Pagos</h2>
          <div v-if="Object.keys(pagadasAgrupadas).length > 0">
            <div v-for="(reports, month) in pagadasAgrupadas" :key="month" class="mb-8">
              <h3 class="month-title">{{ month }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div v-for="report in reports" :key="report.id" class="report-card-simple">
                  <div>
                    <p class="font-bold text-slate-800 dark:text-slate-100">{{ report.paciente }}</p>
                    <p class="text-sm text-slate-500 dark:text-slate-400">{{ formatDate(report.fecha_cirugia) }}</p>
                  </div>
                  <div class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <div>
                      <p class="text-xs text-slate-400">Pagado el:</p>
                      <p class="text-sm font-medium text-green-600 dark:text-green-400">{{ formatDate(report.fecha_pago) }}</p>
                    </div>
                    <div class="flex items-center gap-4">
                      <button @click="openDetailModal(report)" class="action-link">Ver Detalles</button>
                      <a v-if="report.comprobante_object_key" :href="getComprobanteUrl(report.comprobante_object_key)" target="_blank" rel="noopener noreferrer" class="action-link-secondary" title="Ver comprobante general">
                        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="empty-state">Aún no tenés cirugías pagadas registradas.</div>
        </section>
      </div>

      <!-- TAB 2: MIS DATOS -->
      <MyDataSection v-else-if="activeTab === 'datos'" :info="instrumentadorInfo" />

      <!-- TAB 3: FAQ -->
      <FaqSection v-else />

    </div>

    <!-- Modal de Detalle de Pago -->
    <PaymentDetailModal :show="isDetailModalOpen" :reporte="selectedReport" @close="isDetailModalOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { supabase } from '../services/supabase';
import { useToast } from 'vue-toastification';
import FaqSection from '../components/FaqSection.vue';
import PaymentDetailModal from '../components/PaymentDetailModal.vue';
import MyDataSection from '../components/MyDataSection.vue';

const isAuthenticated = ref(false);
const isLoading = ref(false);
const error = ref(null);
const dni = ref('');
const allActivityData = ref([]);
const instrumentadorInfo = ref(null);
const activeTab = ref('resumen');
const isDetailModalOpen = ref(false);
const selectedReport = ref(null);

const route = useRoute();
const toast = useToast();
const token = route.params.token;

const authenticate = async () => {
  if (!dni.value.trim()) {
    error.value = "El DNI es requerido.";
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const cleanDni = dni.value.trim();
    const { data, error: rpcError } = await supabase.rpc('autenticar_y_obtener_resumen', { p_token: token, p_dni: cleanDni });
    
    if (rpcError) throw rpcError;

    if (data) {
      instrumentadorInfo.value = data.instrumentador_info;
      allActivityData.value = (data.activity_summary || []).filter(r => r.estado === 'Enviado');
      isAuthenticated.value = true;
      toast.success("Acceso concedido.");
    } else {
      error.value = "Datos incorrectos. Por favor, verificá tu DNI.";
      dni.value = '';
      toast.error("Acceso denegado.");
    }
  } catch (err) {
    console.error("Error en la autenticación o procesamiento:", err);
    error.value = "Ocurrió un error inesperado. Intentá de nuevo.";
    toast.error("Error de conexión o procesamiento de datos.");
  } finally {
    isLoading.value = false;
  }
};

const pendientes = computed(() => allActivityData.value.filter(r => r.estado_pago === 'Pendiente'));

// --- INICIO DE LA MODIFICACIÓN ---
// Se refactoriza la propiedad computada para una agrupación y ordenamiento correctos.
const pagadasAgrupadas = computed(() => {
  // 1. Filtra solo las cirugías pagadas que tengan una fecha de pago.
  const pagadas = allActivityData.value.filter(r => r.estado_pago === 'Pagado' && r.fecha_pago);
  
  // 2. Ordena las cirugías por fecha de pago, de la más reciente a la más antigua.
  //    Esto asegura que los meses aparezcan en orden cronológico inverso.
  pagadas.sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago));

  // 3. Agrupa las cirugías ordenadas por mes.
  return pagadas.reduce((acc, report) => {
    // Se usa consistentemente 'fecha_pago' para la agrupación.
    const month = new Date(report.fecha_pago).toLocaleString('es-AR', { month: 'long', year: 'numeric', timeZone: 'UTC' });
    const capitalizedMonth = month.charAt(0).toUpperCase() + month.slice(1);
    
    if (!acc[capitalizedMonth]) {
      acc[capitalizedMonth] = [];
    }
    acc[capitalizedMonth].push(report);
    return acc;
  }, {});
});
// --- FIN DE LA MODIFICACIÓN ---

const cirugiasPendientesCount = computed(() => pendientes.value.length);

const cirugiasCobradasMesCount = computed(() => {
  const currentMonth = new Date().getUTCMonth();
  const currentYear = new Date().getUTCFullYear();
  return allActivityData.value.filter(r => {
    if (r.estado_pago !== 'Pagado' || !r.fecha_pago) return false;
    const paymentDate = new Date(r.fecha_pago);
    return paymentDate.getUTCMonth() === currentMonth && paymentDate.getUTCFullYear() === currentYear;
  }).length;
});

const openDetailModal = (report) => {
  selectedReport.value = report;
  isDetailModalOpen.value = true;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-AR', { timeZone: 'UTC' });
};

const getComprobanteUrl = (objectKey) => {
  if (!objectKey) return '#';
  const R2_PUBLIC_URL = import.meta.env.VITE_R2_PUBLIC_URL;
  return `${R2_PUBLIC_URL}/${objectKey}`;
};
</script>

<style scoped>
.form-input { @apply w-full px-4 py-3 border border-slate-300 rounded-lg text-center text-lg dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100; }
.error-message { @apply text-red-500 text-sm mt-2; }
.btn-primary { @apply w-full bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed; }
.stat-card { @apply bg-white dark:bg-slate-800 p-6 rounded-xl shadow; }
.stat-title { @apply text-sm font-medium text-slate-500 dark:text-slate-400; }
.stat-value { @apply text-3xl font-bold text-slate-800 dark:text-slate-100 mt-1; }
.tabs-wrap { @apply inline-flex bg-white dark:bg-slate-800 rounded-xl shadow p-1 gap-1; }
.tab-btn { @apply px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/60; }
.tab-btn--active { @apply bg-slate-900 text-white dark:bg-white dark:text-slate-900; }
.section-title { @apply text-xl font-bold text-slate-700 dark:text-slate-200 mb-4 pb-2 border-b-2 border-slate-200 dark:border-slate-700; }
.month-title { @apply text-lg font-semibold text-slate-600 dark:text-slate-300 mb-4; }
.report-card-simple { @apply bg-white dark:bg-slate-800 p-4 rounded-xl shadow transition-shadow hover:shadow-md; }
.status-badge { @apply inline-block px-2 py-0.5 rounded-full text-xs font-semibold; }
.action-link { @apply text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer; }
.action-link-secondary { @apply text-slate-400 hover:text-slate-600 dark:hover:text-slate-200; }
.empty-state { @apply text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow text-slate-500; }
</style>