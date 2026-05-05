<script setup lang="ts">
type Slide = { src: string; label: string }

const props = defineProps<{ slides: Slide[] }>()

const index = ref(0)

function next() {
  if (index.value < props.slides.length - 1) index.value++
  else index.value = 0
}
function prev() {
  if (index.value > 0) index.value--
  else index.value = props.slides.length - 1
}
function go(i: number) { index.value = i }

const current = computed(() => props.slides[index.value])
</script>

<template>
  <figure class="slider">
    <div class="frame">
      <img :src="current.src" :alt="current.label" />
      <button class="nav-btn prev" aria-label="Previous slide" @click="prev">
        <i class="fa-solid fa-chevron-left" />
      </button>
      <button class="nav-btn next" aria-label="Next slide" @click="next">
        <i class="fa-solid fa-chevron-right" />
      </button>
    </div>
    <figcaption class="caption">
      <span class="label">{{ current.label }}</span>
      <span class="counter">{{ index + 1 }} / {{ slides.length }}</span>
    </figcaption>
    <div class="dots" role="tablist">
      <button
        v-for="(s, i) in slides"
        :key="s.src"
        class="dot"
        :class="{ on: i === index }"
        :aria-label="`Show slide ${i + 1}: ${s.label}`"
        :aria-selected="i === index"
        role="tab"
        @click="go(i)"
      />
    </div>
  </figure>
</template>

<style scoped>
.slider {
  margin: 24px 0;
  padding: 0;
}
.frame {
  position: relative;
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  overflow: hidden;
  background: var(--surface, #111A2B);
  aspect-ratio: 1440 / 900;
  max-height: 560px;
}
.frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
  display: block;
}
.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  border-radius: 99px;
  border: 1px solid var(--border, #1C2740);
  background: rgba(11, 18, 32, 0.85);
  color: var(--text, #F1F5F9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background .12s, border-color .12s;
  backdrop-filter: blur(4px);
}
.nav-btn:hover { border-color: var(--accent, #F5B041); background: rgba(11, 18, 32, 0.95); }
.nav-btn.prev { left: 10px; }
.nav-btn.next { right: 10px; }
.nav-btn i { font-size: 12px; }

.caption {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 2px 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11.5px;
  color: var(--text-mute, #94a3b8);
}
.caption .label { color: var(--text-dim, #cbd5e1); }

.dots {
  display: flex;
  justify-content: center;
  gap: 6px;
  margin-top: 6px;
}
.dot {
  width: 7px;
  height: 7px;
  border-radius: 99px;
  background: var(--border, #1C2740);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background .12s, transform .12s;
}
.dot:hover { background: var(--text-mute, #94a3b8); }
.dot.on {
  background: var(--accent, #F5B041);
  transform: scale(1.3);
}
</style>
