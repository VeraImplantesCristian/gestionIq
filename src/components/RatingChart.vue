<!-- src/components/RatingChart.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
    <h3 class="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-4">{{ title }}</h3>
    
    <!-- **CAMBIO CLAVE:** Envolvemos el gráfico en un div con altura fija y posición relativa -->
    <div class="relative h-64">
      <Bar v-if="chartData.datasets[0].data.some(d => d > 0)" :data="chartData" :options="chartOptions" />
      <div v-else class="flex items-center justify-center h-full text-center text-gray-500 dark:text-slate-400">
        <p>No hay datos suficientes para mostrar el gráfico.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const props = defineProps({
  title: { type: String, required: true },
  reports: { type: Array, required: true },
  field: { type: String, required: true }
});

const chartData = computed(() => {
  const counts = [0, 0, 0, 0, 0];
  for (const report of props.reports) {
    const rating = report[props.field];
    if (rating >= 1 && rating <= 5) {
      counts[rating - 1]++;
    }
  }
  
  return {
    labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
    datasets: [{
      label: 'Nº de Votos',
      backgroundColor: ['#EF4444', '#F97316', '#EAB308', '#84CC16', '#10B981'],
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      data: counts
    }]
  };
});

const chartOptions = {
  responsive: true,
  // **CAMBIO CLAVE:** maintainAspectRatio = false es crucial cuando el contenedor tiene altura fija.
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: () => '', // Oculta el título del tooltip
        label: (context) => `${context.raw} votos`,
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: { precision: 0 }
    }
  }
};
</script>