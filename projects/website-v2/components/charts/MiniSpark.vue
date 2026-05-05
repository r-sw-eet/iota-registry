<template>
  <svg :width="width" :height="height" :viewBox="`0 0 ${width} ${height}`" class="mini-spark">
    <defs>
      <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.3" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <polygon :points="areaPoints" :fill="`url(#${gradientId})`" />
    <polyline :points="linePoints" fill="none" :stroke="color" stroke-width="1.25" stroke-linejoin="round" />
    <circle v-if="data.length" :cx="lastX" :cy="lastY" r="1.8" :fill="color" />
  </svg>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  data: number[]
  width?: number
  height?: number
  color?: string
}>(), { width: 120, height: 28, color: '#F5B041' })

const id = Math.random().toString(36).slice(2, 10)
const gradientId = `spark-${id}`

const bounds = computed(() => {
  const d = props.data
  if (!d.length) return { min: 0, max: 1, range: 1 }
  const max = Math.max(...d)
  const min = Math.min(...d)
  return { min, max, range: Math.max(1, max - min) }
})

const points = computed(() =>
  props.data.map((v, i) => {
    const x = (i / Math.max(1, props.data.length - 1)) * (props.width - 2) + 1
    const y = props.height - 1 - ((v - bounds.value.min) / bounds.value.range) * (props.height - 2)
    return [x, y] as const
  }),
)

const linePoints = computed(() => points.value.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' '))
const areaPoints = computed(() => {
  if (!points.value.length) return ''
  return `1,${props.height - 1} ${linePoints.value} ${props.width - 1},${props.height - 1}`
})
const lastX = computed(() => points.value.length ? points.value[points.value.length - 1][0] : 0)
const lastY = computed(() => points.value.length ? points.value[points.value.length - 1][1] : 0)
</script>

<style scoped>
.mini-spark { display: block; }
</style>
