<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { fmtNum, fmtIota } from '~/utils/format'
import { lineOptions, doughnutOptions, chartPalette, donutPalette } from '~/utils/chartTheme'
import { ANNOUNCED_ENTRIES } from '~/data/announced'

type Project = {
  slug: string
  category: string
  layer: 'L1' | 'L2'
  transactions?: number
  events?: number
  uniqueSenders?: number
  storageIota?: number
  objectCount?: number
  packages?: number
  team?: { id: string } | null
}

type EcosystemResponse = {
  l1: Project[]
  l2: Project[]
  unattributed?: unknown[]
}

type Epoch = {
  epoch: number
  epochTransactions: number
  epochGasBurned: number
  storageFundTotal: number
}

const { $api } = useApi()

const [
  { data: ecosystem },
  { data: epochs },
] = await Promise.all([
  useAsyncData<EcosystemResponse>('ecosystem', () => $api<EcosystemResponse>('/ecosystem')),
  useAsyncData<Epoch[]>('epochs', () => $api<Epoch[]>('/snapshots/epochs')),
])

const allProjects = computed<Project[]>(() => [
  ...(ecosystem.value?.l1 ?? []),
  ...(ecosystem.value?.l2 ?? []),
])

const stats = computed(() => {
  const list = allProjects.value
  const teams = new Set(list.map(p => p.team?.id).filter(Boolean))
  const totalTxs = list.reduce((s, p) => s + (p.transactions ?? 0), 0)
  const totalEvents = list.reduce((s, p) => s + (p.events ?? 0), 0)
  const totalWallets = list.reduce((s, p) => s + (p.uniqueSenders ?? 0), 0)
  const totalObjects = list.reduce((s, p) => s + (p.objectCount ?? 0), 0)
  const totalPackages = list.reduce((s, p) => s + (p.packages ?? 0), 0)
  const totalStorageIota = list.reduce((s, p) => s + (p.storageIota ?? 0), 0)
  const epochList = epochs.value ?? []
  const totalGasBurnedIota = epochList.reduce((s, e) => s + (e.epochGasBurned ?? 0), 0)
  const latestStorageFundIota = epochList.length ? epochList[epochList.length - 1].storageFundTotal : 0
  const epochCount = epochList.length
  return {
    totalProjects: list.length,
    totalTeams: teams.size,
    totalPackages,
    totalTxs,
    totalEvents,
    totalWallets,
    totalObjects,
    totalStorageIota,
    totalGasBurnedIota,
    latestStorageFundIota,
    epochCount,
    totalUnattributed: ecosystem.value?.unattributed?.length ?? 0,
    totalAnnounced: ANNOUNCED_ENTRIES.length,
  }
})

// Category donut — projects per top-level category.
const categoryDonut = computed(() => {
  const counts = new Map<string, number>()
  for (const p of allProjects.value) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  const entries = [...counts.entries()].sort((a, b) => b[1] - a[1])
  return {
    labels: entries.map(e => e[0]),
    datasets: [{
      data: entries.map(e => e[1]),
      backgroundColor: entries.map((_, i) => donutPalette[i % donutPalette.length]),
      borderColor: '#0B1220',
      borderWidth: 2,
    }],
  }
})

// Area chart of transactions per epoch since genesis.
const txByEpoch = computed(() => {
  const list = epochs.value ?? []
  return {
    values: list.map(e => e.epochTransactions ?? 0),
    labels: list.map(e => `E${e.epoch}`),
  }
})

// Cumulative gas burned since genesis.
const cumulativeGasBurn = computed(() => {
  const list = epochs.value ?? []
  let acc = 0
  return {
    values: list.map(e => { acc += (e.epochGasBurned ?? 0); return acc }),
    labels: list.map(e => `E${e.epoch}`),
  }
})

const doughnutOpts = markRaw(doughnutOptions())
</script>

<template>
  <section class="yoi">
    <BirthdayIllustration />
    <div class="yoi-eyebrow"><span class="dot" /> YEAR ONE · IOTA REBASED MAINNET</div>

    <!-- Hero stat band — the six numbers that carry the story -->
    <div class="hero-band">
      <div class="hero-stat">
        <div class="n">{{ fmtNum(stats.totalProjects) }}</div>
        <div class="lbl">Projects catalogued</div>
        <div class="sub">across {{ stats.totalTeams }} teams</div>
      </div>
      <div class="hero-stat">
        <div class="n">{{ fmtNum(stats.totalTxs) }}</div>
        <div class="lbl">Transactions on L1</div>
        <div class="sub">lifetime, across all Move packages</div>
      </div>
      <div class="hero-stat">
        <div class="n">{{ fmtNum(stats.totalWallets) }}</div>
        <div class="lbl">Unique wallets</div>
        <div class="sub">that touched an L1 contract</div>
      </div>
      <div class="hero-stat">
        <div class="n">{{ fmtIota(stats.latestStorageFundIota) }}</div>
        <div class="lbl">Storage fund</div>
        <div class="sub">IOTA locked, refundable on delete</div>
      </div>
      <div class="hero-stat">
        <div class="n">{{ fmtIota(stats.totalGasBurnedIota) }}</div>
        <div class="lbl">Gas burned</div>
        <div class="sub">cumulative since genesis</div>
      </div>
      <div class="hero-stat">
        <div class="n">{{ fmtNum(stats.totalEvents) }}</div>
        <div class="lbl">Move events emitted</div>
        <div class="sub">across {{ fmtNum(stats.totalPackages) }} packages</div>
      </div>
    </div>

    <!-- Coverage strip -->
    <div class="coverage">
      <div>
        <span class="k">{{ stats.totalProjects }}</span>
        <span class="v">attributed projects</span>
      </div>
      <span class="slash">+</span>
      <div>
        <span class="k">{{ stats.totalUnattributed }}</span>
        <span class="v">unattributed clusters (still chasing)</span>
      </div>
      <span class="slash">+</span>
      <div>
        <span class="k">{{ stats.totalAnnounced }}</span>
        <span class="v">announced but not yet live</span>
      </div>
    </div>

    <!-- Charts -->
    <div class="chart-grid">
      <div class="chart-card">
        <div class="chart-title">
          <h3>Transactions per epoch</h3>
          <span class="hint">{{ stats.epochCount }} epochs · 1 per day</span>
        </div>
        <ChartsAreaChart
          :data="txByEpoch.values"
          :x-labels="txByEpoch.labels"
          label="Txs / epoch"
          :height="220"
        />
      </div>
      <div class="chart-card">
        <div class="chart-title">
          <h3>Cumulative gas burned</h3>
          <span class="hint">IOTA · deflationary since genesis</span>
        </div>
        <ChartsAreaChart
          :data="cumulativeGasBurn.values"
          :x-labels="cumulativeGasBurn.labels"
          label="IOTA burned"
          :height="220"
        />
      </div>
      <div class="chart-card">
        <div class="chart-title">
          <h3>Projects by category</h3>
          <span class="hint">Top-level taxonomy</span>
        </div>
        <div class="donut-wrap">
          <Doughnut :data="categoryDonut" :options="doughnutOpts" />
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.yoi {
  margin: 32px 0 40px;
  padding: 24px;
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 16px;
  border-left: 3px solid var(--accent, #F5B041);
}

.yoi-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.14em;
  color: var(--accent, #F5B041);
  text-transform: uppercase;
  margin-bottom: 16px;
}
.yoi-eyebrow .dot {
  width: 6px; height: 6px;
  border-radius: 99px;
  background: var(--accent, #F5B041);
  display: inline-block;
}

.hero-band {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}
.hero-stat {
  padding: 14px 16px;
  background: var(--chip-bg, #0e1626);
  border-radius: 10px;
  border: 1px solid var(--border, #1C2740);
}
.hero-stat .n {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 28px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin-bottom: 4px;
}
.hero-stat .lbl {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-dim, #cbd5e1);
  margin-bottom: 2px;
}
.hero-stat .sub {
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}

.coverage {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 10px 14px;
  padding: 14px 18px;
  background: var(--chip-bg, #0e1626);
  border-radius: 10px;
  margin-bottom: 20px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}
.coverage .k {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent, #F5B041);
  margin-right: 6px;
}
.coverage .v {
  color: var(--text-dim, #cbd5e1);
  font-size: 12px;
}
.coverage .slash {
  color: var(--text-mute, #94a3b8);
  font-weight: 600;
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 14px;
}
.chart-card {
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 16px;
}
.chart-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.chart-title h3 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text, #F1F5F9);
}
.chart-title .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8);
  text-transform: uppercase;
  font-weight: 400;
}
.donut-wrap { height: 220px; }
</style>
