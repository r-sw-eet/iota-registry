<template>
  <div class="donut-wrap" :style="{ height: `${height}px` }">
    <Doughnut v-if="entries.length" :data="chartData" :options="chartOptions" />
    <div v-else class="empty">No data</div>
  </div>
</template>

<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { doughnutOptions, donutPalette } from '~/utils/chartTheme'

const props = withDefaults(defineProps<{
  entries: { label: string; value: number }[]
  height?: number
  colors?: string[]
}>(), {
  height: 220,
  colors: () => donutPalette,
})

const chartData = computed(() => ({
  labels: props.entries.map(e => e.label),
  datasets: [
    {
      data: props.entries.map(e => e.value),
      backgroundColor: props.entries.map((_, i) => props.colors[i % props.colors.length]),
      borderColor: '#0B1220',
      borderWidth: 2,
      hoverOffset: 4,
    },
  ],
}))
const chartOptions = markRaw(doughnutOptions())
</script>

<style scoped>
.donut-wrap { position: relative; width: 100%; }
.donut-wrap .empty {
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--text-mute, #94a3b8);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
}
</style>
