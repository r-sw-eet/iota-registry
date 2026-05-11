<template>
  <div class="app">
    <div class="wip-banner" role="note">
      <b>Work in progress</b> — this site is under active development. Data may contain errors. If you're a developer and your team or project is missing, please contact
      <a href="mailto:hello@iota-registry.org">hello@iota-registry.org</a>.
    </div>
    <header class="topbar">
      <NuxtLink to="/" class="brand">
        <BrandLogo :size="30" />
        <span class="wordmark"><b>IOTA</b> <span>Registry</span></span>
      </NuxtLink>
      <nav>
        <NuxtLink to="/" :aria-current="route.path === '/' ? 'page' : undefined">Home</NuxtLink>
        <button type="button" class="disabled" aria-disabled="true" title="Coming soon">Arena</button>
        <button type="button" class="disabled" aria-disabled="true" title="Coming soon">Watchlists</button>
        <button type="button" class="disabled" aria-disabled="true" title="Coming soon">Alerts</button>
        <NuxtLink to="/blog">Blog</NuxtLink>
        <NuxtLink to="/developers">Docs</NuxtLink>
      </nav>
      <div class="grow" />
      <NuxtLink to="/?tab=network" class="chip-btn" :title="latest ? `Open Network tab · IOTA mainnet` : 'IOTA mainnet'">
        <span class="status-dot" />
        mainnet
        <span v-if="latest?.currentEpoch != null" class="chip-epoch">· Epoch {{ latest.currentEpoch }}</span>
      </NuxtLink>
    </header>
    <div class="v2-main">
      <div class="v2-content">
        <slot />
      </div>
    </div>
    <footer class="v2-footer">
      <div class="v2-footer-inner">
        <div class="disclaimer">
          <p>Built by the community, for the IOTA ecosystem.</p>
          <p>On-chain data sourced from <a href="https://iota.org" target="_blank" rel="noopener">IOTA mainnet</a> · TVL data via <a href="https://defillama.com" target="_blank" rel="noopener">DefiLlama</a>.</p>
          <p>Not affiliated with <a href="https://iota.org" target="_blank" rel="noopener">IOTA Foundation</a>. "IOTA" and its logo are trademarks of the IOTA Foundation.</p>
        </div>
        <div class="links">
          <a href="https://github.com/r-sw-eet/iota-registry" target="_blank" rel="noopener" title="Source on GitHub">
            <i class="fa-brands fa-github" /> GitHub
          </a>
          <span class="sep">·</span>
          <NuxtLink to="/imprint">Imprint</NuxtLink>
          <span class="sep">·</span>
          <NuxtLink to="/privacy">Privacy</NuxtLink>
          <span class="sep">·</span>
          <a href="mailto:hello@iota-registry.org">hello@iota-registry.org</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const { $api } = useApi()

// Minimal epoch ping — reuses the 'snapshots-latest' key so if another
// page already fetched /snapshots/latest, useAsyncData dedupes to one call.
const { data: latest } = await useAsyncData<{ epoch: number; currentEpoch?: number }>(
  'snapshots-latest',
  () => $api<{ epoch: number; currentEpoch?: number }>('/snapshots/latest'),
)

useHead({
  htmlAttrs: {
    'data-theme': 'dark',
    'data-accent': 'amber',
    'data-density': 'balanced',
    'data-font': 'instrument',
  },
  bodyAttrs: { class: 'has-theme' },
})
</script>

<style scoped>
nav button.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 99px;
  background: #22c55e;
  display: inline-block;
  margin-right: 6px;
  vertical-align: middle;
}
.chip-epoch {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
  margin-left: 4px;
  letter-spacing: 0.04em;
}

.v2-footer {
  border-top: 1px solid var(--border, #1C2740);
  padding: 22px 0 40px;
  margin-top: 40px;
}
.v2-footer-inner {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 40px;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
}
.v2-footer .disclaimer {
  color: var(--text-mute, #94a3b8);
  font-size: 12px;
  line-height: 1.55;
  max-width: 640px;
}
.v2-footer .disclaimer p { margin: 0 0 4px; }
.v2-footer .disclaimer p:last-child { margin-bottom: 0; }
.v2-footer .disclaimer a { color: var(--text-mute, #94a3b8); text-decoration: underline; text-underline-offset: 2px; }
.v2-footer .disclaimer a:hover { color: var(--accent, #F5B041); }
.v2-footer .links {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  color: var(--text-mute, #94a3b8);
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.v2-footer .links a {
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
}
.v2-footer .links a:hover { color: var(--accent, #F5B041); }
.v2-footer .sep { opacity: 0.5; }

/* Mobile: stack topbar, hide non-critical chips */
@media (max-width: 720px) {
  .topbar {
    flex-wrap: wrap;
    padding: 10px 12px;
    gap: 10px;
  }
  .topbar nav {
    order: 3;
    width: 100%;
    overflow-x: auto;
    padding: 4px 0;
    gap: 6px;
  }
  .topbar nav a,
  .topbar nav button {
    font-size: 12px;
    padding: 4px 8px;
    flex: 0 0 auto;
  }
  .chip-btn { font-size: 11px; padding: 4px 8px; }
  .grow { display: none; }

  .v2-footer-inner {
    padding: 0 12px;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
