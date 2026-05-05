<template>
  <span class="brand-logo" :style="style" aria-hidden="true">
    <img src="/assets/logo_v2.png" alt="" :width="size" :height="size" />
  </span>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ size?: number }>(), { size: 28 })
const style = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
  borderRadius: `${Math.round(props.size * 0.22)}px`,
}))
</script>

<style scoped>
.brand-logo {
  display: inline-block;
  overflow: hidden;
  flex: 0 0 auto;
  line-height: 0;
}
.brand-logo img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
