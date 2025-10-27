<!-- src/components/NewIncidenceModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div @click.self="$emit('close')" class="w-full max-w-lg p-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh] flex flex-col">
          
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center shrink-0">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Registrar Nueva Incidencia</h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">
              <svg class="w-6 h-6 text-gray-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          <form @submit.prevent="handleSubmit" class="flex-grow overflow-y-auto">
            <div class="p-6 space-y-4">
              
              <!-- Selector de Cirugía con Búsqueda -->
              <div class="relative" ref="reporteSearchContainer">
                <label for="reporte-search" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Asociar a Cirugía (Opcional)</label>
                <input v-model="reporteSearchTerm" @focus="isReporteSearchFocused = true" type="text" id="reporte-search" placeholder="Buscar por paciente o médico..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                <div v-if="isReporteSearchFocused && filteredReportes.length > 0" class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                  <ul>
                    <li v-for="reporte in filteredReportes" :key="reporte.id" @click="selectReporte(reporte)" class="text-gray-900 dark:text-slate-200 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white">
                      <span class="block truncate">{{ reporte.paciente }} - {{ reporte.medico }} ({{ new Date(reporte.fecha_cirugia).toLocaleDateString() }})</span>
                    </li>
                  </ul>
                </div>
                <button v-if="selectedReporteId" @click="clearReporteSelection" type="button" class="absolute inset-y-0 right-0 top-6 flex items-center pr-3">
                  <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                <!-- Texto de Ayuda -->
                <p class="mt-1 text-xs text-gray-500 dark:text-slate-400">Si no encuentra la cirugía, déjelo vacío y notifique al coordinador para que la cargue en "Generador de Reportes".</p>
              </div>

              <!-- === NUEVO: Selector de Instrumentador con Búsqueda y Creación Rápida === -->
              <div class="relative" ref="iqSearchContainer">
                <label for="iq-search" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Asignar a Instrumentador (Opcional)</label>
                <input v-model="iqSearchTerm" @focus="isIqSearchFocused = true" type="text" id="iq-search" placeholder="Buscar por nombre o DNI..." class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"/>
                <div v-if="isIqSearchFocused" class="absolute z-10 mt-1 w-full bg-white dark:bg-slate-700 shadow-lg max-h-60 rounded-md text-base ring-1 ring-black ring-opacity-5 overflow-auto">
                  <ul>
                    <li v-for="iq in filteredIqs" :key="iq.dni" @click="selectIq(iq)" class="text-gray-900 dark:text-slate-200 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white">
                      <span class="block truncate">{{ iq.nombre_completo }} ({{ iq.dni }})</span>
                    </li>
                    <!-- Opción de Creación Rápida -->
                    <li v-if="iqSearchTerm && filteredIqs.length === 0 && !selectedIqDni" @click="createNewInstrumentador" class="text-indigo-600 dark:text-indigo-400 cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-600 hover:text-white">
                      <span class="font-semibold">Crear nuevo instrumentador: "{{ iqSearchTerm }}"</span>
                    </li>
                  </ul>
                </div>
                 <button v-if="selectedIqDni" @click="clearIqSelection" type="button" class="absolute inset-y-0 right-0 top-6 flex items-center pr-3">
                  <svg class="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              
              <!-- Tipo de Incidencia Flexible -->
              <div>
                <label for="tipo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Tipo de Incidencia</label>
                <select v-model="formData.tipo" id="tipo" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                  <option disabled value="">Seleccione un tipo</option>
                  <option>Caja Sucia</option>
                  <option>Faltante de Instrumental</option>
                  <option>Instrumental Dañado</option>
                  <option value="Otro">Otro (especificar)</option>
                </select>
              </div>
              <div v-if="formData.tipo === 'Otro'">
                <label for="custom_tipo" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Especificar tipo</label>
                <input v-model="customTipo" type="text" id="custom_tipo" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

              <!-- Descripción Ampliada -->
              <div>
                <label for="descripcion" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Descripción Detallada</label>
                <textarea v-model="formData.descripcion" id="descripcion" rows="6" required class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"></textarea>
              </div>

              <div>
                <label for="reportado_por" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Reportado por (Nombre)</label>
                <input v-model="formData.reportado_por" type="text" id="reportado_por" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
              </div>

            </div>
          </form>
          
          <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-4 shrink-0">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-500">
              Cancelar
            </button>
            <button @click="handleSubmit" :disabled="isSubmitting" class="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-wait">
              {{ isSubmitting ? 'Guardando...' : 'Guardar Incidencia' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';
import { onClickOutside } from '@vueuse/core';

const props = defineProps({
  show: Boolean,
  reportes: { type: Array, default: () => [] },
  instrumentadores: { type: Array, default: () => [] }
});
const emit = defineEmits(['close', 'incidence-created', 'instrumentador-created']);

const toast = useToast();
const isSubmitting = ref(false);

// --- Búsqueda de Cirugía ---
const reporteSearchContainer = ref(null);
const reporteSearchTerm = ref('');
const selectedReporteId = ref(null);
const isReporteSearchFocused = ref(false);
onClickOutside(reporteSearchContainer, () => isReporteSearchFocused.value = false);
const filteredReportes = computed(() => {
  if (!reporteSearchTerm.value || selectedReporteId.value) return [];
  const term = reporteSearchTerm.value.toLowerCase();
  return props.reportes.filter(r => r.paciente.toLowerCase().includes(term) || r.medico.toLowerCase().includes(term));
});
const selectReporte = (reporte) => {
  selectedReporteId.value = reporte.id;
  reporteSearchTerm.value = `${reporte.paciente} - ${reporte.medico}`;
  isReporteSearchFocused.value = false;
};
const clearReporteSelection = () => {
  selectedReporteId.value = null;
  reporteSearchTerm.value = '';
};

// --- Búsqueda de Instrumentador ---
const iqSearchContainer = ref(null);
const iqSearchTerm = ref('');
const selectedIqDni = ref(null);
const isIqSearchFocused = ref(false);
onClickOutside(iqSearchContainer, () => isIqSearchFocused.value = false);
const filteredIqs = computed(() => {
  if (!iqSearchTerm.value || selectedIqDni.value) return [];
  const term = iqSearchTerm.value.toLowerCase();
  return props.instrumentadores.filter(i => i.nombre_completo.toLowerCase().includes(term) || (i.dni && i.dni.includes(term)));
});
const selectIq = (iq) => {
  selectedIqDni.value = iq.dni;
  iqSearchTerm.value = iq.nombre_completo;
  isIqSearchFocused.value = false;
};
const clearIqSelection = () => {
  selectedIqDni.value = null;
  iqSearchTerm.value = '';
};
const createNewInstrumentador = async () => {
  const nombre = iqSearchTerm.value.trim();
  if (!nombre) return;
  
  const dniTemporal = `TEMP-${Date.now()}`; // DNI temporal para cumplir con la constraint
  const { data, error } = await supabase
    .from('instrumentadores')
    .insert({ nombre_completo: nombre, dni: dniTemporal })
    .select()
    .single();

  if (error) {
    toast.error(`Error al crear instrumentador: ${error.message}`);
  } else {
    toast.success(`Instrumentador "${nombre}" creado.`);
    emit('instrumentador-created'); // Avisamos al padre para que recargue la lista
    selectIq(data); // Lo seleccionamos automáticamente
  }
};

// --- Formulario Principal ---
const customTipo = ref('');
const initialFormData = { tipo: '', descripcion: '', reportado_por: '' };
const formData = ref({ ...initialFormData });

const handleSubmit = async () => {
  if (!formData.value.tipo || !formData.value.descripcion) {
    toast.error('El tipo y la descripción son obligatorios.');
    return;
  }
  if (formData.value.tipo === 'Otro' && !customTipo.value.trim()) {
    toast.error('Debe especificar el tipo de incidencia.');
    return;
  }

  isSubmitting.value = true;
  try {
    const incidenceData = { ...formData.value };
    if (incidenceData.tipo === 'Otro') {
      incidenceData.tipo = customTipo.value.trim();
    }

    // Lógica de asignación de instrumentador
    if (selectedIqDni.value) {
      incidenceData.instrumentador_dni = selectedIqDni.value;
    } else if (selectedReporteId.value) {
      const reporte = props.reportes.find(r => r.id === selectedReporteId.value);
      if (reporte && reporte.instrumentador_dni) {
        incidenceData.instrumentador_dni = reporte.instrumentador_dni;
      }
    }
    
    if (selectedReporteId.value) {
      incidenceData.reporte_id = selectedReporteId.value;
    }

    const { error } = await supabase.from('incidencias').insert([incidenceData]);
    if (error) throw error;

    emit('incidence-created');
    emit('close');

  } catch (err) {
    toast.error('Error al guardar la incidencia: ' + err.message);
  } finally {
    isSubmitting.value = false;
  }
};

watch(() => props.show, (newVal) => {
  if (!newVal) {
    formData.value = { ...initialFormData };
    clearReporteSelection();
    clearIqSelection();
    customTipo.value = '';
  }
});
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>