<script setup lang="ts">
import type { ListTabKey } from '~/composables/useListNav'

const props = defineProps<{
  tab: ListTabKey
  currentId: string
  basePath: string // e.g. '/project', '/team', '/unattributed', '/announced'
}>()

// Recompute on currentId change — prev/next walk in-session sessionStorage
// is static per click-through, so a route param change is the only trigger.
const nav = computed(() => useAdjacentInList(props.tab, props.currentId))

const prevHref = computed(() => (nav.value.prev ? `${props.basePath}/${nav.value.prev}` : null))
const nextHref = computed(() => (nav.value.next ? `${props.basePath}/${nav.value.next}` : null))
</script>

<template>
  <div class="detail-nav-strip">
    <NuxtLink to="/" class="back-link">← Back to dashboard</NuxtLink>
    <div v-if="nav.total > 0" class="adj-nav">
      <NuxtLink v-if="prevHref" :to="prevHref" class="adj-link" :title="`Previous ${tab.slice(0, -1)} in list`">
        <i class="fa-solid fa-arrow-left" /> <span>Prev</span>
      </NuxtLink>
      <span v-else class="adj-link adj-disabled"><i class="fa-solid fa-arrow-left" /> <span>Prev</span></span>
      <span class="adj-index">{{ nav.index + 1 }} / {{ nav.total }}</span>
      <NuxtLink v-if="nextHref" :to="nextHref" class="adj-link" :title="`Next ${tab.slice(0, -1)} in list`">
        <span>Next</span> <i class="fa-solid fa-arrow-right" />
      </NuxtLink>
      <span v-else class="adj-link adj-disabled"><span>Next</span> <i class="fa-solid fa-arrow-right" /></span>
    </div>
  </div>
</template>

<style scoped>
.detail-nav-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.back-link {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
}
.back-link:hover { color: var(--accent, #F5B041); }

.adj-nav {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
}
.adj-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid var(--border, #1C2740);
  background: var(--chip-bg, #0e1626);
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
  transition: color .1s, border-color .1s;
}
.adj-link:hover { color: var(--text, #F1F5F9); border-color: var(--border-strong, #2a3a5c); }
.adj-link.adj-disabled {
  opacity: 0.4;
  pointer-events: none;
}
.adj-link i { font-size: 9px; }
.adj-index {
  color: var(--text-mute, #94a3b8);
  padding: 0 6px;
  min-width: 52px;
  text-align: center;
}

@media (max-width: 560px) {
  .detail-nav-strip { flex-wrap: wrap; gap: 8px; }
  .adj-nav { flex: 1 1 100%; justify-content: flex-end; }
}
</style>
