<template>
  <div class="area-chart-wrap" :style="{ height: `${height}px` }">
    <Line v-if="data.length" :data="chartData" :options="chartOptions" />
    <div v-else class="empty">No data</div>
  </div>
</template>

<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { buildLineData, lineOptions } from '~/utils/chartTheme'

const props = withDefaults(defineProps<{
  data: number[]
  xLabels?: string[]
  label?: string
  color?: string
  height?: number
}>(), {
  xLabels: () => [],
  label: 'Value',
  color: '#F5B041',
  height: 200,
})

const resolvedLabels = computed(() => {
  if (props.xLabels.length === props.data.length) return props.xLabels
  return props.data.map((_, i) => `${props.data.length - 1 - i}d`)
})

const chartData = computed(() => buildLineData(props.label, props.data, resolvedLabels.value, props.color))
const chartOptions = markRaw(lineOptions())
</script>

<style scoped>
.area-chart-wrap { position: relative; width: 100%; }
.area-chart-wrap .empty {
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--text-mute, #94a3b8);
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  letter-spacing: 0.04em;
}
</style>
