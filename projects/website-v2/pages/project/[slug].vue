<script setup lang="ts">
import { fmtNum, fmtIota, shortAddr, relativeTime, absoluteLogo } from '~/utils/format'

type Project = {
  slug: string
  name: string
  layer: 'L1' | 'L2'
  categoryLabel: string
  description?: string
  packages?: number
  packageAddress?: string
  latestPackageAddress?: string
  modules?: string[]
  transactions?: number
  events?: number
  uniqueSenders?: number
  uniqueHolders?: number
  objectCount?: number
  storageIota?: number
  addedAt?: string
  team?: {
    id: string
    name: string
    description?: string
    logo?: string
    urls?: { label: string; href: string }[]
    deployers?: string[]
    attribution?: string
  } | null
  urls?: { label: string; href: string }[]
  attribution?: string
  detectedDeployers?: string[]
  anomalousDeployers?: string[]
  disclaimer?: string
  logo?: string
}

type EventItem = {
  timestamp: string
  type: string
  typeFull: string
  sender: string
  data: Record<string, unknown>
}

type DayPoint = { date: string; count: number }

type ActivityResponse = {
  eventsPerDay: DayPoint[]
  sendersPerDay: DayPoint[]
  cumulativeEvents: DayPoint[]
  eventTypes: { type: string; count: number }[]
}

const route = useRoute()
const slug = route.params.slug as string
const { $api } = useApi()

const [{ data: project, pending, error }, { data: eventsRes }, { data: activity }] = await Promise.all([
  useAsyncData<Project>(`project-${slug}`, () => $api<Project>(`/ecosystem/project/${slug}`)),
  useAsyncData<{ events: EventItem[] }>(`project-events-${slug}`, () =>
    $api<{ events: EventItem[] }>(`/ecosystem/project/${slug}/events?limit=30`),
  ),
  useAsyncData<ActivityResponse>(`project-activity-${slug}`, () =>
    $api<ActivityResponse>(`/ecosystem/project/${slug}/activity`),
  ),
])

const events = computed<EventItem[]>(() => eventsRes.value?.events ?? [])

const eventTypeBreakdown = computed(() => {
  const src = activity.value?.eventTypes
  if (src && src.length) {
    return src.map(e => ({ label: e.type, value: e.count })).sort((a, b) => b.value - a.value)
  }
  const counts = new Map<string, number>()
  for (const e of events.value) counts.set(e.type, (counts.get(e.type) ?? 0) + 1)
  return [...counts.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
})

function shortDate(iso: string): string {
  const d = new Date(iso)
  if (!isFinite(d.getTime())) return iso
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

const eventsPerDaySeries = computed(() => {
  const src = activity.value?.eventsPerDay ?? []
  return {
    values: src.map(p => p.count),
    labels: src.map(p => shortDate(p.date)),
  }
})
const sendersPerDaySeries = computed(() => {
  const src = activity.value?.sendersPerDay ?? []
  return {
    values: src.map(p => p.count),
    labels: src.map(p => shortDate(p.date)),
  }
})
const cumulativeEventsSeries = computed(() => {
  const src = activity.value?.cumulativeEvents ?? []
  return {
    values: src.map(p => p.count),
    labels: src.map(p => shortDate(p.date)),
  }
})
function projectLogo(p: Project | null | undefined): string | null {
  if (!p) return null
  return absoluteLogo(p.logo || p.team?.logo || null)
}
function initials(name: string): string {
  return name.split(/[\s—-]+/).filter(Boolean).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}
function explorerObj(addr: string): string {
  return `https://explorer.iota.org/object/${addr}?network=mainnet`
}
function explorerTx(digest: string): string {
  return `https://explorer.iota.org/txblock/${digest}?network=mainnet`
}
function explorerAddr(addr: string): string {
  return `https://explorer.iota.org/address/${addr}?network=mainnet`
}
</script>

<template>
  <div>
    <DetailNavStrip v-if="project" tab="projects" :current-id="project.slug" base-path="/project" />
    <NuxtLink v-else to="/" class="back-link">← Back to dashboard</NuxtLink>

    <div v-if="pending" class="state">Loading project…</div>
    <div v-else-if="error || !project" class="state error">
      {{ error?.message || 'Project not found' }}
    </div>
    <template v-else>
      <!-- Header -->
      <header class="proj-head">
        <span class="avatar lg">
          <img v-if="projectLogo(project)" :src="projectLogo(project)!" alt="" />
          <span v-else class="initials">{{ initials(project.name) }}</span>
        </span>
        <div class="head-text">
          <div class="title-row">
            <h1>{{ project.name }}</h1>
            <span class="layer-chip" :data-layer="project.layer">{{ project.layer }}</span>
          </div>
          <div class="sub">
            <span v-if="project.categoryLabel">{{ project.categoryLabel }}</span>
            <span v-if="project.team">
              · by <NuxtLink :to="`/team/${project.team.id}`">{{ project.team.name }}</NuxtLink>
            </span>
            <span v-if="project.addedAt">
              · listed {{ relativeTime(project.addedAt) }}
            </span>
          </div>
          <div v-if="project.urls && project.urls.length" class="urls">
            <a v-for="u in project.urls" :key="u.href" :href="u.href" target="_blank" rel="noopener">
              {{ u.label }} ↗
            </a>
          </div>
        </div>
      </header>

      <p v-if="project.description" class="descr">{{ project.description }}</p>

      <!-- KPI grid -->
      <div class="kpi-grid">
        <template v-if="project.layer === 'L1'">
          <div class="kpi">
            <div class="lb">Transactions</div>
            <div class="vl">{{ fmtNum(project.transactions) }}</div>
          </div>
          <div class="kpi">
            <div class="lb">Events</div>
            <div class="vl">{{ fmtNum(project.events) }}</div>
          </div>
          <div class="kpi">
            <div class="lb">Wallets</div>
            <div class="vl">{{ fmtNum(project.uniqueSenders) }}</div>
            <div class="dl" v-if="project.uniqueHolders">{{ fmtNum(project.uniqueHolders) }} holders</div>
          </div>
          <div class="kpi" v-if="project.objectCount">
            <div class="lb">Objects</div>
            <div class="vl">{{ fmtNum(project.objectCount) }}</div>
          </div>
          <div class="kpi">
            <div class="lb">Packages</div>
            <div class="vl">{{ fmtNum(project.packages) }}</div>
            <div class="dl" v-if="project.modules">{{ project.modules.length }} modules</div>
          </div>
          <div class="kpi">
            <div class="lb">Storage</div>
            <div class="vl">{{ fmtIota(project.storageIota) }}</div>
          </div>
        </template>
      </div>

      <!-- Activity charts -->
      <div class="section" v-if="project.layer === 'L1'">
        <h2>Activity</h2>
        <div class="chart-grid">
          <div class="chart-card">
            <div class="chart-title">Events per day <span class="hint">{{ eventsPerDaySeries.values.length }}d</span></div>
            <div class="chart-body">
              <ChartsAreaChart
                v-if="eventsPerDaySeries.values.length"
                :data="eventsPerDaySeries.values"
                :x-labels="eventsPerDaySeries.labels"
                label="Events"
                :height="180"
              />
              <div v-else class="empty-mini">No activity indexed yet.</div>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Unique senders per day <span class="hint">{{ sendersPerDaySeries.values.length }}d</span></div>
            <div class="chart-body">
              <ChartsAreaChart
                v-if="sendersPerDaySeries.values.length"
                :data="sendersPerDaySeries.values"
                :x-labels="sendersPerDaySeries.labels"
                label="Senders"
                :height="180"
              />
              <div v-else class="empty-mini">No activity indexed yet.</div>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Cumulative events <span class="hint">lifetime</span></div>
            <div class="chart-body">
              <ChartsAreaChart
                v-if="cumulativeEventsSeries.values.length"
                :data="cumulativeEventsSeries.values"
                :x-labels="cumulativeEventsSeries.labels"
                label="Events"
                :height="180"
              />
              <div v-else class="empty-mini">No activity indexed yet.</div>
            </div>
          </div>
          <div class="chart-card">
            <div class="chart-title">Event types <span class="hint">all-time</span></div>
            <div class="chart-body">
              <ChartsDonutChart :entries="eventTypeBreakdown" :height="180" />
            </div>
          </div>
        </div>
      </div>

      <!-- Attribution -->
      <div class="section" v-if="project.attribution">
        <h2>Attribution</h2>
        <AttributionText :text="project.attribution" />
      </div>

      <!-- Recent events (L1 only) -->
      <div class="section" v-if="project.layer === 'L1' && events.length">
        <h2>Recent events <span class="hint">{{ events.length }}</span></h2>
        <ul class="event-list">
          <li v-for="(e, i) in events" :key="i">
            <div class="ev-head">
              <span class="ev-type">{{ e.type }}</span>
              <span class="ev-time">{{ relativeTime(e.timestamp) }}</span>
            </div>
            <div class="ev-meta">
              <span>from <a :href="explorerAddr(e.sender)" target="_blank" rel="noopener">{{ shortAddr(e.sender) }}</a></span>
              <span class="mono-full">{{ e.typeFull }}</span>
            </div>
          </li>
        </ul>
      </div>

      <!-- Network layer -->
      <div class="section network-layer">
        <h2>Network Layer</h2>
        <p v-if="project.layer === 'L1'">
          This project runs on
          <a href="https://docs.iota.org/about-iota/tokenomics/gas-pricing" target="_blank" rel="noopener">IOTA L1 (Move)</a>.
          Transactions on L1 directly burn gas fees (deflationary) and storage deposits are locked in the protocol storage fund (refundable when objects are deleted).
        </p>
        <p v-else>
          This project runs on
          <a href="https://docs.iota.org/about-iota/iota-architecture/iota-evm" target="_blank" rel="noopener">IOTA L2 (EVM)</a>.
          The IOTA EVM chain settles to L1, so its activity indirectly contributes to L1 gas burn and network security. Individual EVM transactions are not visible in the Move package registry.
        </p>
      </div>

      <!-- Move modules -->
      <div class="section" v-if="project.modules && project.modules.length">
        <h2>Move modules <span class="hint">{{ project.modules.length }}</span></h2>
        <div class="chip-body">
          <span v-for="m in project.modules" :key="m" class="mod-chip">{{ m }}</span>
        </div>
      </div>

      <!-- Addresses -->
      <div
        v-if="project.packageAddress || (project.detectedDeployers && project.detectedDeployers.length) || (project.anomalousDeployers && project.anomalousDeployers.length)"
        class="section"
      >
        <h2>Identification</h2>
        <dl class="addr-list">
          <template v-if="project.packageAddress">
            <dt>First package</dt>
            <dd>
              <a :href="explorerObj(project.packageAddress)" target="_blank" rel="noopener">
                {{ project.packageAddress }} ↗
              </a>
            </dd>
          </template>
          <template v-if="project.latestPackageAddress && project.latestPackageAddress !== project.packageAddress">
            <dt>Latest package</dt>
            <dd>
              <a :href="explorerObj(project.latestPackageAddress)" target="_blank" rel="noopener">
                {{ project.latestPackageAddress }} ↗
              </a>
            </dd>
          </template>
          <template v-if="project.detectedDeployers && project.detectedDeployers.length">
            <dt>Deployers</dt>
            <dd>
              <div v-for="d in project.detectedDeployers" :key="d">
                <a :href="explorerAddr(d)" target="_blank" rel="noopener">{{ d }} ↗</a>
              </div>
            </dd>
          </template>
          <template v-if="project.anomalousDeployers && project.anomalousDeployers.length">
            <dt class="warn">Anomalous deployers</dt>
            <dd>
              <div v-for="d in project.anomalousDeployers" :key="d" class="warn">
                <a :href="explorerAddr(d)" target="_blank" rel="noopener">{{ d }} ↗</a>
              </div>
            </dd>
          </template>
        </dl>
      </div>
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
  margin-bottom: 18px;
  letter-spacing: 0.02em;
}
.back-link:hover { color: var(--accent, #F5B041); }

.proj-head {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  display: inline-grid;
  place-items: center;
  overflow: hidden;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  flex: 0 0 auto;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar.lg { width: 56px; height: 56px; border-radius: 12px; font-size: 16px; }

.title-row { display: flex; gap: 12px; align-items: center; }
.title-row h1 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 32px;
  font-weight: 600;
  margin: 0;
  color: var(--text, #F1F5F9);
  letter-spacing: -0.01em;
}
.sub {
  margin-top: 6px;
  color: var(--text-mute, #94a3b8);
  font-size: 13px;
}
.sub a { color: var(--text, #F1F5F9); text-decoration: none; }
.sub a:hover { color: var(--accent, #F5B041); }

.urls { margin-top: 8px; display: flex; gap: 14px; flex-wrap: wrap; }
.urls a {
  color: var(--accent, #F5B041);
  text-decoration: none;
  font-size: 13px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
.urls a:hover { text-decoration: underline; }

.layer-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
}
.layer-chip[data-layer="L1"] { color: var(--accent, #F5B041); border-color: var(--accent, #F5B041); }
.layer-chip[data-layer="L2"] { color: #60a5fa; border-color: #3b82f6; }

.descr {
  color: var(--text-dim, #cbd5e1);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 28px;
}


.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}
.l2-empty {
  background: var(--chip-bg, #0e1626);
  border: 1px dashed var(--border, #1C2740);
  border-radius: 10px;
  padding: 16px 18px;
  color: var(--text-mute, #94a3b8);
  font-size: 13px;
  line-height: 1.55;
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
.kpi .dl {
  margin-top: 2px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}

.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 16px;
}
.chart-card {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 16px 18px;
}
.chart-card.wide { padding: 18px 22px; }
.empty-mini {
  height: 180px;
  display: grid;
  place-items: center;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
}
.chart-title {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.chart-title .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8);
  font-weight: 400;
  text-transform: uppercase;
}
.chart-body { min-height: 180px; }
.chip-body { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 6px; }
.mod-chip {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  color: var(--text-dim, #cbd5e1);
}

.section { margin: 36px 0; }
.section h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 16px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 14px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}
.section h2 .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
  font-weight: 400;
}
.prose { color: var(--text-dim, #cbd5e1); font-size: 13px; line-height: 1.7; white-space: pre-wrap; max-width: 76ch; }

.addr-list { display: grid; grid-template-columns: 160px 1fr; gap: 10px 16px; margin: 0; }
.addr-list dt {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding-top: 4px;
}
.addr-list dt.warn, .addr-list .warn a { color: #fca5a5; }
.addr-list dd { margin: 0; font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 12px; }
.addr-list a { color: var(--accent, #F5B041); text-decoration: none; word-break: break-all; }
.addr-list a:hover { text-decoration: underline; }

.event-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.event-list li {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  padding: 12px 14px;
}
.ev-head { display: flex; justify-content: space-between; gap: 12px; align-items: baseline; }
.ev-type {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--accent, #F5B041);
  font-weight: 500;
}
.ev-time {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}
.ev-meta {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}
.ev-meta a { color: var(--text-dim, #cbd5e1); text-decoration: none; }
.ev-meta a:hover { color: var(--accent, #F5B041); }
.ev-meta .mono-full { font-size: 10px; color: var(--text-mute, #94a3b8); opacity: .7; word-break: break-all; }

.network-layer p {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-left: 3px solid var(--accent, #F5B041);
  border-radius: 6px;
  padding: 14px 16px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-dim, #cbd5e1);
}
.network-layer a { color: var(--accent, #F5B041); }

.state {
  padding: 40px;
  text-align: center;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  letter-spacing: 0.04em;
}
.state.error { color: #fca5a5; }
</style>
