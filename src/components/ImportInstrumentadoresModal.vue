<!-- src/components/ImportInstrumentadoresModal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div @click.self="$emit('close')" class="w-full max-w-lg p-4">
        <div class="bg-white dark:bg-slate-800 rounded-lg shadow-xl">
          
          <div class="p-4 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
            <h2 class="text-xl font-semibold text-gray-900 dark:text-slate-100">Importar Instrumentadores desde XLS</h2>
            <button @click="$emit('close')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700">&times;</button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label for="file-upload" class="block text-sm font-medium text-gray-700 dark:text-slate-300">Archivo Excel (.xls, .xlsx)</label>
              <!-- === CORRECCIÓN === -->
              <!-- Añadimos los tipos MIME oficiales para máxima compatibilidad -->
              <input 
                type="file" 
                id="file-upload"
                @change="handleFileChange"
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                class="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-300 dark:hover:file:bg-blue-900/40"
              />
            </div>
            
            <div class="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-700/50 p-3 rounded-md">
              <p class="font-semibold mb-2">Instrucciones:</p>
              <ul class="list-disc list-inside space-y-1">
                <li>El archivo debe tener una cabecera con los nombres de las columnas.</li>
                <li>Columnas requeridas: <strong>dni</strong>, <strong>nombre_completo</strong>.</li>
                <li>Columnas opcionales: <strong>cuil</strong>, <strong>telefono</strong>, <strong>alias</strong>, <strong>banco</strong>, etc.</li>
                <li>La operación actualizará los registros existentes (basado en el DNI) y creará los nuevos.</li>
              </ul>
              <a 
                href="/plantilla_instrumentadores.xlsx" 
                download
                class="inline-flex items-center gap-1 mt-3 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Descargar plantilla de ejemplo
              </a>
            </div>
          </div>

          <div class="p-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700 flex justify-end space-x-4">
            <button type="button" @click="$emit('close')" class="px-4 py-2 bg-white dark:bg-slate-600 border border-gray-300 dark:border-slate-500 rounded-md text-sm font-medium">Cancelar</button>
            <button @click="processFile" :disabled="!file || isProcessing" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium disabled:bg-blue-400">
              {{ isProcessing ? 'Procesando...' : 'Procesar Archivo' }}
            </button>
          </div>

        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue';
import { read, utils } from 'xlsx';
import { supabase } from '../services/supabase.js';
import { useToast } from 'vue-toastification';

defineProps({ show: Boolean });
const emit = defineEmits(['close', 'imported']);

const toast = useToast();
const file = ref(null);
const isProcessing = ref(false);

const handleFileChange = (event) => {
  file.value = event.target.files[0];
};

const processFile = async () => {
  if (!file.value) {
    toast.error("Por favor, seleccione un archivo.");
    return;
  }
  isProcessing.value = true;
  try {
    const data = await file.value.arrayBuffer();
    const workbook = read(data);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = utils.sheet_to_json(worksheet);

    if (jsonData.length === 0) {
      throw new Error("El archivo Excel está vacío o tiene un formato incorrecto.");
    }

    const instrumentadoresToUpsert = jsonData.map(row => ({
      dni: String(row.dni).replace(/\D/g, ''),
      nombre_completo: row.nombre_completo,
      cuil: row.cuil,
      telefono: row.telefono,
      alias: row.alias,
      banco: row.banco,
      alias_bancario: row.alias_bancario,
      cbu: row.cbu,
      lugar_trabajo: row.lugar_trabajo
    })).filter(iq => iq.dni && iq.nombre_completo);

    const { error } = await supabase
      .from('instrumentadores')
      .upsert(instrumentadoresToUpsert, { onConflict: 'dni' });

    if (error) throw error;

    toast.success(`${instrumentadoresToUpsert.length} registros han sido importados/actualizados con éxito.`);
    emit('imported');
    emit('close');

  } catch (err) {
    toast.error("Error al procesar el archivo: " + err.message);
  } finally {
    isProcessing.value = false;
  }
};
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>