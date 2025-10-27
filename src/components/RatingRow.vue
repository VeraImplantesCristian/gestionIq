<!-- src/components/RatingRow.vue -->
<template>
  <div class="grid grid-cols-2 gap-4 py-2 border-b border-slate-200/50 last:border-b-0 dark:border-slate-600/50">
    <dt class="font-semibold text-gray-600 dark:text-slate-300 text-sm">{{ label }}</dt>
    <dd class="flex items-center" :class="{ 'font-bold': isBold }">
      <span v-if="rating" class="flex items-center">
        <span v-for="i in 5" :key="i" class="text-lg" :class="i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-slate-600'">★</span>
        <span class="ml-2 text-gray-800 dark:text-slate-100 text-sm">({{ rating }}/5)</span>
      </span>
      <span v-else class="text-gray-500 dark:text-slate-400 text-sm">N/A</span>
    </dd>
  </div>
</template>

<script setup>
defineProps({
  label: String,
  rating: Number,
  isBold: Boolean
});
</script>