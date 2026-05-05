<script setup lang="ts">
import { fmtNum, fmtIota } from '~/utils/format'

type UnattributedCluster = {
  deployer: string
  packages: number
  firstPackageAddress?: string
  latestPackageAddress: string
  storageIota: number
  modules: string[]
  events: number
  eventsCapped?: boolean
  uniqueSenders: number
  transactions: number
  transactionsCapped?: boolean
  uniqueHolders?: number
  objectCount?: number
  marketplaceListedCount?: number
  uniqueWalletsReach?: number
  sampleIdentifiers: string[]
  sampledObjectType?: string
  deployerAttributedProjects?: { slug: string; name: string; layer?: string; category?: string }[]
  deployerIsSender?: boolean
  insights: string[]
}

type EcosystemResponse = {
  unattributed?: UnattributedCluster[]
}

const route = useRoute()
const { $api } = useApi()

// Re-use the same key as the homepage so Nuxt can share the payload.
const { data: ecosystem, pending, error } = await useAsyncData<EcosystemResponse>(
  'ecosystem',
  () => $api<EcosystemResponse>('/ecosystem'),
)

const cluster = computed<UnattributedCluster | null>(() => {
  const d = route.params.deployer as string
  return ecosystem.value?.unattributed?.find(u => u.deployer === d) ?? null
})

useHead(() => ({
  title: cluster.value
    ? `Unattributed ${cluster.value.deployer.slice(0, 10)}… — IOTA Registry`
    : 'Unattributed cluster — IOTA Registry',
}))

// Top-level sample identifiers: "name: Foo", "description: Bar".
// Nested: "url.url: https://…", "wrapper.field: value" — keys contain a dot.
function flatIdentifiers(ids: string[] | undefined): string[] {
  return (ids ?? []).filter(id => !/^[a-z_]+\.[a-z_]+[:\s]/i.test(id))
}
function nestedIdentifiers(ids: string[] | undefined): string[] {
  return (ids ?? []).filter(id => /^[a-z_]+\.[a-z_]+[:\s]/i.test(id))
}

function explorerAddressUrl(addr: string): string {
  return `https://explorer.iota.org/address/${addr}?network=mainnet`
}
function explorerObjectUrl(addr: string): string {
  return `https://explorer.iota.org/object/${addr}?network=mainnet`
}
function explorerObjectTypeUrl(typ: string): string {
  const pkg = typ.split('::')[0]
  return explorerObjectUrl(pkg)
}
</script>

<template>
  <div>
    <DetailNavStrip v-if="cluster" tab="unattributed" :current-id="cluster.deployer" base-path="/unattributed" />
    <NuxtLink v-else to="/" class="back-link">← Back to dashboard</NuxtLink>

    <div v-if="pending" class="state">Loading cluster…</div>
    <div v-else-if="error" class="state error">Failed to load: {{ error.message }}</div>
    <div v-else-if="!cluster" class="state error">Unattributed cluster not found for this deployer.</div>
    <template v-else>
      <header class="cluster-head">
        <div class="eyebrow">
          <i class="fa-solid fa-circle-question" /> UNATTRIBUTED DEPLOYER
        </div>
        <h1 class="addr">{{ cluster.deployer }}</h1>
        <div class="head-links">
          <a :href="explorerAddressUrl(cluster.deployer)" target="_blank" rel="noopener" class="head-link">
            <i class="fa-solid fa-arrow-up-right-from-square" /> View on IOTA Explorer
          </a>
          <span v-if="cluster.deployerIsSender" class="chip-flag">
            <i class="fa-solid fa-user-check" /> Deployer is also a sender
          </span>
        </div>
      </header>

      <!-- KPI grid -->
      <div class="kpi-grid">
        <div class="kpi">
          <div class="lb">Packages</div>
          <div class="vl">{{ cluster.packages }}</div>
          <div v-if="cluster.modules.length" class="dl">{{ cluster.modules.length }} unique modules</div>
        </div>
        <div class="kpi">
          <div class="lb">Transactions</div>
          <div class="vl">
            {{ fmtNum(cluster.transactions) }}<span v-if="cluster.transactionsCapped" class="cap">+</span>
          </div>
        </div>
        <div class="kpi">
          <div class="lb">Events</div>
          <div class="vl">
            {{ fmtNum(cluster.events) }}<span v-if="cluster.eventsCapped" class="cap">+</span>
          </div>
        </div>
        <div class="kpi">
          <div class="lb">Wallets</div>
          <div class="vl">{{ fmtNum(cluster.uniqueSenders) }}</div>
          <div v-if="cluster.uniqueWalletsReach && cluster.uniqueWalletsReach !== cluster.uniqueSenders" class="dl">
            {{ fmtNum(cluster.uniqueWalletsReach) }} reach (senders ∪ holders)
          </div>
        </div>
        <div v-if="cluster.objectCount" class="kpi">
          <div class="lb">Objects</div>
          <div class="vl">{{ fmtNum(cluster.objectCount) }}</div>
          <div v-if="cluster.uniqueHolders" class="dl">{{ fmtNum(cluster.uniqueHolders) }} holders</div>
        </div>
        <div class="kpi">
          <div class="lb">Storage</div>
          <div class="vl">{{ fmtIota(cluster.storageIota) }}</div>
        </div>
        <div v-if="cluster.marketplaceListedCount" class="kpi">
          <div class="lb">Listed</div>
          <div class="vl">{{ fmtNum(cluster.marketplaceListedCount) }}</div>
          <div class="dl">on marketplaces</div>
        </div>
      </div>

      <!-- Insights -->
      <section v-if="cluster.insights && cluster.insights.length" class="section">
        <h2>Insights <span class="hint">{{ cluster.insights.length }}</span></h2>
        <ul class="insights-list">
          <li v-for="(note, i) in cluster.insights" :key="i">{{ note }}</li>
        </ul>
      </section>

      <!-- Deployer-attributed companion projects (if any) -->
      <section v-if="cluster.deployerAttributedProjects && cluster.deployerAttributedProjects.length" class="section">
        <h2>Same deployer also ships <span class="hint">{{ cluster.deployerAttributedProjects.length }} attributed</span></h2>
        <p class="hint-inline">This deployer is already known for other projects in the registry — strong signal that this cluster belongs to the same team.</p>
        <ul class="proj-xref-list">
          <li v-for="p in cluster.deployerAttributedProjects" :key="p.slug">
            <NuxtLink :to="`/project/${p.slug}`">
              <span class="xref-name">{{ p.name }}</span>
              <span v-if="p.category || p.layer" class="xref-meta">{{ [p.layer, p.category].filter(Boolean).join(' · ') }}</span>
              <i class="fa-solid fa-arrow-right ext-ic" />
            </NuxtLink>
          </li>
        </ul>
      </section>

      <!-- Package addresses -->
      <section class="section">
        <h2>Packages</h2>
        <dl class="addr-list">
          <template v-if="cluster.firstPackageAddress">
            <dt>First package</dt>
            <dd>
              <a :href="explorerObjectUrl(cluster.firstPackageAddress)" target="_blank" rel="noopener">
                {{ cluster.firstPackageAddress }} <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
              </a>
            </dd>
          </template>
          <template v-if="cluster.latestPackageAddress && cluster.latestPackageAddress !== cluster.firstPackageAddress">
            <dt>Latest package</dt>
            <dd>
              <a :href="explorerObjectUrl(cluster.latestPackageAddress)" target="_blank" rel="noopener">
                {{ cluster.latestPackageAddress }} <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
              </a>
            </dd>
          </template>
          <template v-else-if="cluster.latestPackageAddress">
            <dt>Package</dt>
            <dd>
              <a :href="explorerObjectUrl(cluster.latestPackageAddress)" target="_blank" rel="noopener">
                {{ cluster.latestPackageAddress }} <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
              </a>
            </dd>
          </template>
          <template v-if="cluster.sampledObjectType">
            <dt>Sampled object type</dt>
            <dd>
              <a :href="explorerObjectTypeUrl(cluster.sampledObjectType)" target="_blank" rel="noopener" class="mono-sm">
                {{ cluster.sampledObjectType }} <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
              </a>
            </dd>
          </template>
        </dl>
      </section>

      <!-- Modules -->
      <section v-if="cluster.modules && cluster.modules.length" class="section">
        <h2>Move modules <span class="hint">{{ cluster.modules.length }}</span></h2>
        <div class="chip-body">
          <span v-for="m in cluster.modules" :key="m" class="mod-chip">{{ m }}</span>
        </div>
      </section>

      <!-- Sample identifiers — top-level -->
      <section v-if="flatIdentifiers(cluster.sampleIdentifiers).length" class="section">
        <h2>Sample identifiers — top-level <span class="hint">{{ flatIdentifiers(cluster.sampleIdentifiers).length }}</span></h2>
        <p class="hint-inline">Direct fields sampled from on-chain objects deployed by this cluster — name / description / symbol. Best brand-signal source.</p>
        <ul class="ident-list">
          <li v-for="(id, i) in flatIdentifiers(cluster.sampleIdentifiers)" :key="`flat-${i}`" class="mono-sm">{{ id }}</li>
        </ul>
      </section>

      <!-- Sample identifiers — nested -->
      <section v-if="nestedIdentifiers(cluster.sampleIdentifiers).length" class="section">
        <h2>Sample identifiers — nested <span class="hint">{{ nestedIdentifiers(cluster.sampleIdentifiers).length }}</span></h2>
        <p class="hint-inline">Deeper fields found inside wrappers / URLs / metadata. Often contain domain hints (e.g. <code>url.url: https://somebrand.com/…</code>) that attach a deployer to a real-world brand.</p>
        <ul class="ident-list">
          <li v-for="(id, i) in nestedIdentifiers(cluster.sampleIdentifiers)" :key="`nested-${i}`" class="mono-sm nested">{{ id }}</li>
        </ul>
      </section>
    </template>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
  margin-bottom: 20px;
}
.back-link:hover { color: var(--accent, #F5B041); }

.state {
  padding: 40px;
  text-align: center;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.state.error { color: #fca5a5; }

.cluster-head { margin-bottom: 28px; }
.eyebrow {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--text-mute, #94a3b8);
  margin-bottom: 6px;
}
.cluster-head h1.addr {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 16px;
  font-weight: 500;
  color: var(--text, #F1F5F9);
  margin: 0 0 10px;
  word-break: break-all;
  line-height: 1.3;
}
.head-links { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; }
.head-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--accent, #F5B041);
  text-decoration: none;
  padding: 4px 10px;
  border: 1px solid var(--border, #1C2740);
  border-radius: 6px;
  background: var(--accent-soft, rgba(245,176,65,0.06));
}
.head-link:hover { border-color: var(--accent, #F5B041); }
.chip-flag {
  display: inline-flex; align-items: center; gap: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 6px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-dim, #cbd5e1);
  border: 1px solid var(--border, #1C2740);
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}
.kpi {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 14px 16px;
}
.kpi .lb {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8);
  margin-bottom: 6px;
}
.kpi .vl {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 22px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  letter-spacing: -0.01em;
}
.kpi .vl .cap { color: var(--accent, #F5B041); font-size: 16px; margin-left: 2px; }
.kpi .dl {
  margin-top: 2px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}

.section { margin: 28px 0; }
.section h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 10px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.section h2 .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8);
  font-weight: 400;
  text-transform: uppercase;
}
.hint-inline {
  font-size: 12px;
  color: var(--text-mute, #94a3b8);
  line-height: 1.55;
  margin: 0 0 12px;
}
.hint-inline code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-dim, #cbd5e1);
}

.insights-list {
  list-style: disc;
  padding-left: 20px;
  margin: 0;
  color: var(--text-dim, #cbd5e1);
  font-size: 13px;
  line-height: 1.7;
}

.proj-xref-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.proj-xref-list a {
  display: flex; align-items: baseline; gap: 12px;
  padding: 10px 14px;
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text, #F1F5F9);
  font-size: 13px;
  transition: border-color .1s;
}
.proj-xref-list a:hover { border-color: var(--accent, #F5B041); }
.xref-name { font-weight: 500; flex: 1; }
.xref-meta {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}

.addr-list {
  display: grid;
  grid-template-columns: 160px 1fr;
  gap: 8px 16px;
  margin: 0;
  align-items: baseline;
}
.addr-list dt {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--text-mute, #94a3b8);
}
.addr-list dd { margin: 0; }
.addr-list a {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-dim, #cbd5e1);
  text-decoration: none;
  word-break: break-all;
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
}
.addr-list a:hover { color: var(--accent, #F5B041); }
.mono-sm {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}

.chip-body { display: flex; flex-wrap: wrap; gap: 6px; }
.mod-chip {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 4px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-dim, #cbd5e1);
  border: 1px solid var(--border, #1C2740);
}

.ident-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ident-list li {
  padding: 6px 10px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 4px;
  color: var(--text-dim, #cbd5e1);
  word-break: break-all;
}
.ident-list li.nested {
  border-left: 2px solid var(--accent, #F5B041);
  color: var(--text, #F1F5F9);
}

.ext-ic { font-size: 10px; opacity: 0.6; }
</style>
