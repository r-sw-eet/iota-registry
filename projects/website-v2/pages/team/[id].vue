<script setup lang="ts">
import { fmtNum, absoluteLogo } from '~/utils/format'

type TeamProject = {
  slug: string
  name: string
  layer: 'L1' | 'L2'
  categoryLabel: string
  transactions?: number
  events?: number
  uniqueSenders?: number
  packages?: number
  addedAt?: string
  logo?: string
}

type Team = {
  id: string
  name: string
  description?: string
  logo?: string
  logoWordmark?: string
  urls?: { label: string; href: string }[]
  deployers?: string[]
  attribution?: string
  projects: TeamProject[]
}

const route = useRoute()
const id = route.params.id as string
const { $api } = useApi()

const { data: team, pending, error } = await useAsyncData<Team>(`team-${id}`, () =>
  $api<Team>(`/ecosystem/teams/${id}`),
)

function initials(name: string): string {
  return name.split(/[\s—-]+/).filter(Boolean).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}
function explorerAddr(addr: string): string {
  return `https://explorer.iota.org/address/${addr}?network=mainnet`
}

const aggregate = computed(() => {
  const projects = team.value?.projects ?? []
  return {
    count: projects.length,
    l1: projects.filter(p => p.layer === 'L1').length,
    l2: projects.filter(p => p.layer === 'L2').length,
    txs: projects.reduce((s, p) => s + (p.transactions ?? 0), 0),
    events: projects.reduce((s, p) => s + (p.events ?? 0), 0),
    wallets: projects.reduce((s, p) => s + (p.uniqueSenders ?? 0), 0),
    packages: projects.reduce((s, p) => s + (p.packages ?? 0), 0),
  }
})

const sortedProjects = computed(() =>
  (team.value?.projects ?? []).slice().sort((a, b) => (b.transactions ?? 0) - (a.transactions ?? 0)),
)

const teamLogoUrl = computed(() => absoluteLogo(team.value?.logo))
function projectLogoUrl(p: TeamProject): string | null {
  return absoluteLogo(p.logo || team.value?.logo)
}
</script>

<template>
  <div>
    <DetailNavStrip v-if="team" tab="teams" :current-id="team.id" base-path="/team" />
    <NuxtLink v-else to="/" class="back-link">← Back to dashboard</NuxtLink>

    <div v-if="pending" class="state">Loading team…</div>
    <div v-else-if="error || !team" class="state error">
      {{ error?.message || 'Team not found' }}
    </div>
    <template v-else>
      <header class="team-head">
        <span class="avatar lg">
          <img v-if="teamLogoUrl" :src="teamLogoUrl" alt="" />
          <span v-else class="initials">{{ initials(team.name) }}</span>
        </span>
        <div class="head-text">
          <h1>{{ team.name }}</h1>
          <div class="sub">
            <span>{{ aggregate.count }} project{{ aggregate.count === 1 ? '' : 's' }}</span>
            <span v-if="aggregate.l1">· {{ aggregate.l1 }} L1</span>
            <span v-if="aggregate.l2">· {{ aggregate.l2 }} L2</span>
            <span v-if="team.deployers">· {{ team.deployers.length }} deployer{{ team.deployers.length === 1 ? '' : 's' }}</span>
          </div>
          <div v-if="team.urls && team.urls.length" class="urls">
            <a v-for="u in team.urls" :key="u.href" :href="u.href" target="_blank" rel="noopener">
              {{ u.label }} ↗
            </a>
          </div>
        </div>
      </header>

      <p v-if="team.description" class="descr">{{ team.description }}</p>

      <!-- Aggregate KPIs -->
      <div class="kpi-grid">
        <div class="kpi">
          <div class="lb">Transactions</div>
          <div class="vl">{{ fmtNum(aggregate.txs) }}</div>
          <div class="dl">across {{ aggregate.count }} project{{ aggregate.count === 1 ? '' : 's' }}</div>
        </div>
        <div class="kpi">
          <div class="lb">Events</div>
          <div class="vl">{{ fmtNum(aggregate.events) }}</div>
        </div>
        <div class="kpi">
          <div class="lb">Wallets</div>
          <div class="vl">{{ fmtNum(aggregate.wallets) }}</div>
          <div class="dl">unique senders</div>
        </div>
        <div class="kpi">
          <div class="lb">Packages</div>
          <div class="vl">{{ fmtNum(aggregate.packages) }}</div>
        </div>
      </div>

      <!-- Attribution -->
      <div class="section" v-if="team.attribution">
        <h2>Attribution</h2>
        <AttributionText :text="team.attribution" />
      </div>

      <!-- Deployers -->
      <div class="section" v-if="team.deployers && team.deployers.length">
        <h2>Known deployer addresses <span class="hint">{{ team.deployers.length }}</span></h2>
        <ul class="addr-list">
          <li v-for="d in team.deployers" :key="d">
            <a :href="explorerAddr(d)" target="_blank" rel="noopener">{{ d }} ↗</a>
          </li>
        </ul>
      </div>

      <!-- Projects -->
      <div class="section">
        <h2>Projects <span class="hint">{{ aggregate.count }}</span></h2>
        <table class="scan-table">
          <thead>
            <tr>
              <th>Project</th>
              <th>Layer</th>
              <th>Category</th>
              <th class="num">TXs</th>
              <th class="num">Events</th>
              <th class="num">Wallets</th>
              <th class="num">Packages</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in sortedProjects" :key="p.slug">
              <td>
                <NuxtLink :to="`/project/${p.slug}`" class="proj-cell">
                  <span class="avatar">
                    <img v-if="projectLogoUrl(p)" :src="projectLogoUrl(p)!" alt="" />
                    <span v-else class="initials">{{ initials(p.name) }}</span>
                  </span>
                  <span class="proj-name">{{ p.name }}</span>
                </NuxtLink>
              </td>
              <td><span class="layer-chip" :data-layer="p.layer">{{ p.layer }}</span></td>
              <td>{{ p.categoryLabel }}</td>
              <td class="num">{{ fmtNum(p.transactions) }}</td>
              <td class="num">{{ fmtNum(p.events) }}</td>
              <td class="num">{{ fmtNum(p.uniqueSenders) }}</td>
              <td class="num">{{ fmtNum(p.packages) }}</td>
            </tr>
          </tbody>
        </table>
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
}
.back-link:hover { color: var(--accent, #F5B041); }

.team-head {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.avatar {
  width: 32px; height: 32px; border-radius: 8px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  display: inline-grid; place-items: center;
  overflow: hidden;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  flex: 0 0 auto;
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }
.avatar.lg { width: 56px; height: 56px; border-radius: 12px; font-size: 16px; }

.team-head h1 {
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
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.urls { margin-top: 8px; display: flex; gap: 14px; flex-wrap: wrap; }
.urls a {
  color: var(--accent, #F5B041);
  text-decoration: none;
  font-size: 13px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
.urls a:hover { text-decoration: underline; }

.descr {
  color: var(--text-dim, #cbd5e1);
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 28px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
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
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8); margin-bottom: 6px;
}
.kpi .vl {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 22px; font-weight: 600; color: var(--text, #F1F5F9);
  letter-spacing: -0.01em;
}
.kpi .dl {
  margin-top: 2px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; color: var(--text-mute, #94a3b8);
}

.section { margin: 36px 0; }
.section h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 16px; font-weight: 600; color: var(--text, #F1F5F9);
  margin: 0 0 14px;
  display: flex; align-items: baseline; gap: 10px;
}
.section h2 .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; color: var(--text-mute, #94a3b8); font-weight: 400;
}
.prose {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px; line-height: 1.7; white-space: pre-wrap;
}

.addr-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 6px; }
.addr-list li {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}
.addr-list a {
  color: var(--accent, #F5B041); text-decoration: none; word-break: break-all;
}
.addr-list a:hover { text-decoration: underline; }

.scan-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.scan-table thead th {
  text-align: left;
  font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-mute, #94a3b8); padding: 10px 12px;
  border-bottom: 1px solid var(--border, #1C2740); font-weight: 500;
}
.scan-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border, #1C2740);
  color: var(--text, #F1F5F9); vertical-align: middle;
}
.scan-table td.num, .scan-table th.num {
  text-align: right;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
.scan-table tbody tr:hover { background: var(--accent-soft, rgba(245,176,65,0.04)); }
.proj-cell { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; color: var(--text, #F1F5F9); }
.proj-cell .proj-name { font-weight: 500; }
.proj-cell:hover .proj-name { color: var(--accent, #F5B041); }

.layer-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; letter-spacing: 0.04em;
  padding: 2px 6px; border-radius: 4px;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
}
.layer-chip[data-layer="L1"] { color: var(--accent, #F5B041); border-color: var(--accent, #F5B041); }
.layer-chip[data-layer="L2"] { color: #60a5fa; border-color: #3b82f6; }

.state {
  padding: 40px; text-align: center; color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px; letter-spacing: 0.04em;
}
.state.error { color: #fca5a5; }
</style>
