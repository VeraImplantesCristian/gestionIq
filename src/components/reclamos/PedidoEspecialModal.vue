<!-- src/components/reclamos/PedidoEspecialModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="$emit('close')" class="fixed inset-0 bg-black bg-opacity-70"></div>
      
      <!-- ========= INICIO DE LA SOLUCIÓN: AJUSTE ESTRUCTURAL DEL MODAL ========= -->
      <!-- Se elimina 'flex-col' para que la altura se ajuste al contenido -->
      <div class="relative z-10 w-full max-w-2xl bg-white dark:bg-slate-800 rounded-lg shadow-xl max-h-[90vh]">
        
        <div class="p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {{ isEditing ? 'Editar Pedido Especial' : 'Nuevo Pedido Especial' }}
          </h3>
        </div>

        <!-- Se añade un div contenedor para el scroll principal -->
        <div class="overflow-y-auto">
          <div class="p-6">
            <div v-if="step === 'selecting' && !isEditing" class="min-h-[200px]">
              <h4 class="font-semibold mb-2 dark:text-slate-200">Asociar a una Cirugía</h4>
              <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Busque por nombre de paciente o ID de cirugía para autocompletar.</p>
              
              <AutocompleteSearch 
                v-model="searchTerm"
                :results="searchResults"
                @select="handleReporteSelected"
                placeholder="Buscar paciente o ID..."
              >
                <template #default="{ result }">
                  <div class="flex justify-between">
                    <span><strong>{{ result.paciente }}</strong> (Médico: {{ result.medico }})</span>
                    <span class="text-xs text-slate-500">ID: {{ result.reporte_id }}</span>
                  </div>
                </template>
              </AutocompleteSearch>

              <div class="mt-6 text-center">
                <button @click="skipToForm" class="text-sm text-blue-600 hover:underline">O continuar sin asociar a una cirugía</button>
              </div>
            </div>

            <div v-if="step === 'filling'" class="space-y-4">
              <div>
                <label for="nombre_medico" class="form-label">Nombre del Médico <span class="text-red-500">*</span></label>
                <input type="text" id="nombre_medico" v-model="formData.nombre_medico" class="form-input mt-1" :readonly="!!formData.reporte_asociado_id"/>
                <p v-if="errors.nombre_medico" class="form-error">{{ errors.nombre_medico }}</p>
              </div>
              <div>
                <label for="descripcion_pedido" class="form-label">Descripción del Pedido <span class="text-red-500">*</span></label>
                <!-- Se añade la clase 'whitespace-pre-wrap' para el formato correcto -->
                <textarea id="descripcion_pedido" v-model="formData.descripcion_pedido" rows="8" class="form-input mt-1 whitespace-pre-wrap"></textarea>
                <p v-if="errors.descripcion_pedido" class="form-error">{{ errors.descripcion_pedido }}</p>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div>
                  <label for="estado_autorizacion" class="form-label">Estado de Autorización</label>
                  <select id="estado_autorizacion" v-model="formData.estado_autorizacion" class="form-input mt-1">
                    <option>Cubierto por Districorr</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div v-if="formData.estado_autorizacion === 'Otro'">
                  <label for="estado_otro" class="form-label">Especificar estado</label>
                  <input type="text" id="estado_otro" v-model="formData.estado_autorizacion_otro" class="form-input mt-1" />
                </div>
              </div>
              <div>
                <label for="costo_estimado" class="form-label">Costo Estimado (opcional)</label>
                <input type="number" step="0.01" id="costo_estimado" v-model="formData.costo_estimado" class="form-input mt-1" />
              </div>
              <div>
                <label for="observaciones" class="form-label">Observaciones Internas</label>
                <textarea id="observaciones" v-model="formData.observaciones" rows="3" class="form-input mt-1"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="p-4 bg-slate-50 dark:bg-slate-800/50 border-t flex justify-end items-center space-x-3">
          <button @click="$emit('close')" class="btn-secondary">Cancelar</button>
          <!-- El botón Guardar ahora está deshabilitado si estamos en el paso de selección -->
          <button @click="handleSave" :disabled="isSaving || step === 'selecting'" class="btn-primary flex items-center">
            <svg v-if="isSaving" class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
            <span>{{ isSaving ? 'Guardando...' : 'Guardar Pedido' }}</span>
          </button>
        </div>
      </div>
      <!-- ========= FIN DE LA SOLUCIÓN ========= -->
    </div>
  </Transition>
</template>

<script setup>
import { ref, watch, computed, reactive } from 'vue';
import { supabase } from '../../services/supabase.js';
import { useToast } from 'vue-toastification';
import { useDebounceFn } from '@vueuse/core';
import AutocompleteSearch from '../AutocompleteSearch.vue';

const props = defineProps({
  show: { type: Boolean, required: true },
  pedido: { type: Object, default: null },
  isSaving: { type: Boolean, default: false }
});
const emit = defineEmits(['close', 'save']);
const toast = useToast();

const formData = ref({});
const errors = reactive({});
const step = ref('selecting');
const isEditing = computed(() => !!props.pedido?.id);
const searchTerm = ref('');
const searchResults = ref([]);

const resetForm = () => {
  formData.value = {
    nombre_medico: '',
    reporte_asociado_id: null,
    descripcion_pedido: '',
    estado_autorizacion: 'Cubierto por Districorr',
    estado_autorizacion_otro: '',
    costo_estimado: null,
    observaciones: ''
  };
  Object.keys(errors).forEach(key => delete errors[key]);
};

watch(() => props.show, (isVisible) => {
  if (isVisible) {
    if (props.pedido) {
      formData.value = JSON.parse(JSON.stringify(props.pedido));
      if (formData.value.estado_autorizacion !== 'Cubierto por Districorr') {
        formData.value.estado_autorizacion_otro = formData.value.estado_autorizacion;
        formData.value.estado_autorizacion = 'Otro';
      }
      step.value = 'filling';
    } else {
      resetForm();
      step.value = 'selecting';
      searchTerm.value = '';
      searchResults.value = [];
    }
  }
}, { immediate: true });

const searchReportes = useDebounceFn(async () => {
  if (searchTerm.value.length < 2) {
    searchResults.value = [];
    return;
  }
  const { data, error } = await supabase.rpc('search_reportes_para_pedidos', { p_search_term: searchTerm.value });
  if (error) { toast.error('Error al buscar reportes.'); } 
  else { searchResults.value = data; }
}, 300);

watch(searchTerm, searchReportes);

const handleReporteSelected = (reporte) => {
  formData.value.reporte_asociado_id = reporte.reporte_id;
  formData.value.nombre_medico = reporte.medico;
  formData.value.descripcion_pedido = reporte.descripcion_sugerida;
  step.value = 'filling';
};

const skipToForm = () => {
  step.value = 'filling';
};

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key]);
  if (!formData.value.nombre_medico?.trim()) errors.nombre_medico = 'El nombre es obligatorio.';
  if (!formData.value.descripcion_pedido?.trim()) errors.descripcion_pedido = 'La descripción es obligatoria.';
  return Object.keys(errors).length === 0;
};

const handleSave = () => {
  if (!validateForm()) {
    toast.error('Por favor, complete los campos requeridos.');
    return;
  }
  
  const finalData = { ...formData.value };
  if (finalData.estado_autorizacion === 'Otro') {
    finalData.estado_autorizacion = finalData.estado_autorizacion_otro;
  }
  delete finalData.estado_autorizacion_otro;

  emit('save', finalData);
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.form-label { @apply block text-sm font-medium text-slate-700 dark:text-slate-300; }
.form-input { @apply block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-slate-900 dark:border-slate-600 dark:text-white; }
textarea.form-input { @apply h-auto; }
.form-error { @apply mt-1 text-sm text-red-500; }
.btn-primary { @apply bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow hover:bg-blue-700 disabled:opacity-50; }
.btn-secondary { @apply bg-white dark:bg-slate-700 ring-1 ring-slate-300 dark:ring-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2 px-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600; }
</style>