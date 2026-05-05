<script setup lang="ts">
import { fmtNum, fmtIota, absoluteLogo, shortAddr } from '~/utils/format'
import {
  ANNOUNCED_ENTRIES,
  compareAnnounced,
  computeLifecycle,
  isRetired,
  TIER_LABEL,
  ONCHAIN_LABEL,
  hasDemoBadge,
  type AnnouncedEntry,
  type AnnouncedTier,
} from '~/data/announced'

function explorerAddressUrl(addr: string): string {
  return `https://explorer.iota.org/address/${addr}?network=mainnet`
}

function hostFromUrl(u: string): string {
  try { return new URL(u).host.replace(/^www\./, '') } catch { return u }
}

type Project = {
  slug: string
  name: string
  layer: 'L1' | 'L2'
  category: string
  subcategory?: string | null
  categoryLabel: string
  packages?: number
  transactions?: number
  events?: number
  uniqueSenders?: number
  uniqueHolders?: number
  objectCount?: number
  storageIota?: number
  addedAt?: string
  team?: { id: string; name: string; logo?: string } | null
  logo?: string
}

type SortKey = 'transactions' | 'events' | 'uniqueSenders' | 'objectCount' | 'packages' | 'storageIota'

type UnattributedCluster = {
  deployer: string
  packages: number
  transactions: number
  events: number
  uniqueSenders: number
  objectCount: number
  storageIota: number
  modules: string[]
  sampleIdentifiers: string[]
  insights: string[]
  deployerAttributedProjects?: { slug: string; name: string }[]
}

type EcosystemResponse = {
  l1: Project[]
  l2: Project[]
  unattributed?: UnattributedCluster[]
  syncedAt?: string
}

type Epoch = {
  epoch: number
  epochGasBurned: number
  epochTransactions: number
  storageFundTotal: number
  validatorTargetReward: number
}

type Team = {
  id: string
  name: string
  description?: string
  deployers: string[]
  logo?: string
  projects: { slug: string; name: string; category: string; layer: 'L1' | 'L2' }[]
}

const { $api } = useApi()

const [
  { data: ecosystem, pending: ecoPending, error: ecoError },
  { data: epochs },
  { data: teams },
] = await Promise.all([
  useAsyncData<EcosystemResponse>('ecosystem', () => $api<EcosystemResponse>('/ecosystem')),
  useAsyncData<Epoch[]>('epochs', () => $api<Epoch[]>('/snapshots/epochs')),
  useAsyncData<Team[]>('teams', () => $api<Team[]>('/ecosystem/teams')),
])

const tab = ref<'projects' | 'teams' | 'unattributed' | 'announced' | 'network'>('projects')

const announcedTierFilter = ref<'all' | AnnouncedTier>('all')
const announcedHideRetired = ref(false)
const unattributedHideInactive = ref(true)

const filteredAnnounced = computed<AnnouncedEntry[]>(() => {
  const q = search.value.trim().toLowerCase()
  return ANNOUNCED_ENTRIES
    .filter(a => {
      if (announcedTierFilter.value !== 'all' && a.tier !== announcedTierFilter.value) return false
      if (announcedHideRetired.value && isRetired(computeLifecycle(a.lastConfirmed))) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.stack.some(s => s.toLowerCase().includes(q))
      )
    })
    .slice()
    .sort(compareAnnounced)
})

const unattributed = computed<UnattributedCluster[]>(() => ecosystem.value?.unattributed ?? [])

function isInactiveCluster(u: UnattributedCluster): boolean {
  return (u.packages || 0) === 0 && (u.transactions || 0) === 0 && (u.events || 0) === 0
}
function hasProbablyHint(u: UnattributedCluster): boolean {
  return !!(u.deployerAttributedProjects && u.deployerAttributedProjects.length > 0)
}

const filteredSortedUnattributed = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rows = unattributed.value.filter(u => {
    if (unattributedHideInactive.value && isInactiveCluster(u)) return false
    if (!q) return true
    return (
      u.deployer.toLowerCase().includes(q) ||
      u.modules.some(m => m.toLowerCase().includes(q)) ||
      u.sampleIdentifiers.some(s => s.toLowerCase().includes(q))
    )
  })
  const k = unattributedSortKey.value
  if (!k) {
    // Default view: pin Probably-attributed rows to the top; API order below.
    return [...rows].sort((a, b) => {
      const ap = hasProbablyHint(a) ? 0 : 1
      const bp = hasProbablyHint(b) ? 0 : 1
      return ap - bp
    })
  }
  // Active column sort: pure sort, no Probably-first pin (reload to get it back).
  const dir = unattributedSortDir.value === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const av = Number((a[k as keyof UnattributedCluster] as unknown as number) ?? 0)
    const bv = Number((b[k as keyof UnattributedCluster] as unknown as number) ?? 0)
    return (av - bv) * dir
  })
})

type TeamRow = {
  id: string
  name: string
  logo: string | null
  layer: 'L1' | 'L2' | 'Mixed'
  category: string
  subcategory: string | null
  categoryLabel: string
  projectCount: number
  packages: number
  transactions: number
  events: number
  uniqueSenders: number
  objectCount: number
  storageIota: number
}

// Aggregate per-team rows from project-level metrics, enriched with logo /
// metadata from the teams endpoint. Dominant category = most common across the
// team's projects; layer = 'Mixed' when a team spans L1 and L2.
const teamRows = computed<TeamRow[]>(() => {
  const tList = teams.value ?? []
  const byTeam = new Map<string, Project[]>()
  for (const p of allProjects.value) {
    if (!p.team) continue
    const arr = byTeam.get(p.team.id) ?? []
    arr.push(p)
    byTeam.set(p.team.id, arr)
  }
  return tList.map((t): TeamRow => {
    const tps = byTeam.get(t.id) ?? []
    const sum = (k: keyof Project) => tps.reduce((s, p) => s + (Number(p[k] as unknown as number) || 0), 0)
    const layers = new Set(tps.map(p => p.layer))
    const layer: 'L1' | 'L2' | 'Mixed' = layers.size > 1 ? 'Mixed' : (layers.has('L2') ? 'L2' : 'L1')
    const catCounts = new Map<string, number>()
    const subCounts = new Map<string, number>()
    for (const p of tps) {
      catCounts.set(p.category, (catCounts.get(p.category) ?? 0) + 1)
      if (p.subcategory) subCounts.set(p.subcategory, (subCounts.get(p.subcategory) ?? 0) + 1)
    }
    const category = [...catCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '—'
    const subcategory = [...subCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    return {
      id: t.id,
      name: t.name,
      logo: absoluteLogo(t.logo || null),
      layer,
      category,
      subcategory,
      categoryLabel: subcategory ? `${category} / ${subcategory}` : category,
      projectCount: tps.length,
      packages: sum('packages'),
      transactions: sum('transactions'),
      events: sum('events'),
      uniqueSenders: sum('uniqueSenders'),
      objectCount: sum('objectCount'),
      storageIota: sum('storageIota'),
    }
  })
})

const filteredSortedTeams = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rows = teamRows.value.filter(t => {
    if (!layerMatchesTeam(t)) return false
    if (selectedCategory.value !== 'all' && t.category !== selectedCategory.value) return false
    if (selectedSubcategory.value !== 'all' && t.subcategory !== selectedSubcategory.value) return false
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.categoryLabel.toLowerCase().includes(q)
    )
  })
  const k = sortKey.value
  const dir = sortDir.value === 'desc' ? -1 : 1
  return rows.sort((a, b) => {
    const av = (a[k as keyof TeamRow] ?? 0) as number
    const bv = (b[k as keyof TeamRow] ?? 0) as number
    return (av - bv) * dir
  })
})

const networkTotals = computed(() => {
  const list = epochs.value ?? []
  const totalTxs = list.reduce((s, e) => s + (e.epochTransactions ?? 0), 0)
  const totalGasBurned = list.reduce((s, e) => s + (e.epochGasBurned ?? 0), 0)
  const latestStorage = list.length ? list[list.length - 1].storageFundTotal : 0
  return { totalTxs, totalGasBurned, latestStorage, epochs: list.length }
})

const gasBurnChart = computed(() => {
  const list = (epochs.value ?? []).slice(-30)
  return {
    values: list.map(e => e.epochGasBurned ?? 0),
    labels: list.map(e => `E${e.epoch}`),
  }
})
const storageChart = computed(() => {
  const list = (epochs.value ?? []).slice(-30)
  return {
    values: list.map(e => e.storageFundTotal ?? 0),
    labels: list.map(e => `E${e.epoch}`),
  }
})

const allProjects = computed<Project[]>(() => [
  ...(ecosystem.value?.l1 ?? []),
])

// Top-level categories in the registry's canonical display order — Misc last.
const CATEGORY_ORDER = [
  'DeFi', 'Bridge', 'Oracle', 'NFT', 'Game', 'Identity',
  'Real World', 'Infrastructure', 'Social', 'Misc',
] as const

const selectedCategory = ref<string>('all')
const selectedSubcategory = ref<string>('all')
const selectedLayer = ref<'all' | 'L1' | 'L2'>('all')
const search = ref('')

// Project layer filter is strict (L1 or L2). Team "Mixed" rows match both
// L1 and L2 filters — teams straddle layers and we shouldn't hide them.
function layerMatchesProject(p: Project): boolean {
  if (selectedLayer.value === 'all') return true
  return p.layer === selectedLayer.value
}
function layerMatchesTeam(t: { layer: 'L1' | 'L2' | 'Mixed' }): boolean {
  if (selectedLayer.value === 'all') return true
  return t.layer === selectedLayer.value || t.layer === 'Mixed'
}

// Chip source = active tab's rowset filtered by layer; both Project and
// TeamRow expose { category, subcategory } so counts work uniformly.
const chipSource = computed<{ category: string; subcategory?: string | null }[]>(() => {
  if (tab.value === 'teams') return teamRows.value.filter(layerMatchesTeam)
  return allProjects.value.filter(layerMatchesProject)
})

// Top-level chip row with live per-category counts.
const categoryChips = computed<{ key: string; label: string; count: number }[]>(() => {
  const src = chipSource.value
  const counts = new Map<string, number>()
  for (const p of src) counts.set(p.category, (counts.get(p.category) ?? 0) + 1)
  const ordered = CATEGORY_ORDER
    .filter(c => counts.has(c))
    .map(c => ({ key: c, label: c, count: counts.get(c)! }))
  return [{ key: 'all', label: 'All', count: src.length }, ...ordered]
})

// Sub-chips only materialize when a specific top-level is selected.
const subcategoryChips = computed<{ key: string; label: string; count: number }[]>(() => {
  if (selectedCategory.value === 'all') return []
  const inCat = chipSource.value.filter(p => p.category === selectedCategory.value)
  const counts = new Map<string, number>()
  for (const p of inCat) {
    if (p.subcategory) counts.set(p.subcategory, (counts.get(p.subcategory) ?? 0) + 1)
  }
  const entries = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([key, count]) => ({ key, label: key, count }))
  if (!entries.length) return []
  return [{ key: 'all', label: 'All', count: inCat.length }, ...entries]
})

// Clearing the top-level clears the sub; switching top-level resets sub to 'all'.
watch(selectedCategory, () => { selectedSubcategory.value = 'all' })

const sortKey = ref<SortKey>('transactions')
const sortDir = ref<'asc' | 'desc'>('desc')
function setSort(k: SortKey) {
  if (sortKey.value === k) sortDir.value = sortDir.value === 'desc' ? 'asc' : 'desc'
  else { sortKey.value = k; sortDir.value = 'desc' }
}
function sortIcon(k: SortKey): string {
  if (sortKey.value !== k) return 'fa-sort'
  return sortDir.value === 'desc' ? 'fa-sort-down' : 'fa-sort-up'
}

// Unattributed has its own sort state so Probably-row-first stays intact
// on first visit (null = no sort column highlighted). Projects/Teams tabs
// keep their own `transactions desc` default.
const unattributedSortKey = ref<SortKey | null>(null)
const unattributedSortDir = ref<'asc' | 'desc'>('desc')
function setUnattributedSort(k: SortKey) {
  if (unattributedSortKey.value === k) {
    if (unattributedSortDir.value === 'desc') unattributedSortDir.value = 'asc'
    else { unattributedSortKey.value = null; unattributedSortDir.value = 'desc' }
  } else { unattributedSortKey.value = k; unattributedSortDir.value = 'desc' }
}
function unattributedSortIcon(k: SortKey): string {
  if (unattributedSortKey.value !== k) return 'fa-sort'
  return unattributedSortDir.value === 'desc' ? 'fa-sort-down' : 'fa-sort-up'
}

const filteredSorted = computed(() => {
  const q = search.value.trim().toLowerCase()
  const rows = allProjects.value.filter(p => {
    if (!layerMatchesProject(p)) return false
    if (selectedCategory.value !== 'all' && p.category !== selectedCategory.value) return false
    if (selectedSubcategory.value !== 'all' && p.subcategory !== selectedSubcategory.value) return false
    if (!q) return true
    return (
      p.name.toLowerCase().includes(q) ||
      (p.categoryLabel || '').toLowerCase().includes(q) ||
      (p.team?.name || '').toLowerCase().includes(q)
    )
  })
  const k = sortKey.value
  const dir = sortDir.value === 'desc' ? -1 : 1
  return rows.sort((a, b) => {
    const av = (a[k] ?? 0) as number
    const bv = (b[k] ?? 0) as number
    return (av - bv) * dir
  })
})

const pulseStats = computed(() => {
  const l1 = ecosystem.value?.l1 ?? []
  const all = l1
  const totalProjects = all.length
  const totalTeams = new Set(all.map(p => p.team?.id).filter(Boolean)).size
  const totalTxs = all.reduce((s, p) => s + (p.transactions ?? 0), 0)
  const totalEvents = all.reduce((s, p) => s + (p.events ?? 0), 0)
  const totalWallets = all.reduce((s, p) => s + (p.uniqueSenders ?? 0), 0)
  return { totalProjects, totalTeams, totalTxs, totalEvents, totalWallets }
})

const epochChartData = computed(() => {
  if (!epochs.value) return { values: [] as number[], labels: [] as string[] }
  const last = epochs.value.slice(-30)
  return {
    values: last.map(e => e.epochTransactions),
    labels: last.map(e => `E${e.epoch}`),
  }
})

function projectLogo(p: Project): string | null {
  return absoluteLogo(p.logo || p.team?.logo || null)
}

// Category cell — when a category filter is active, the category line becomes
// redundant (every row shows the same one), so subcategory leads and the
// parent category drops to the muted sub-line. When unfiltered, category leads.
// Misc is the exception: its subcategories aren't a meaningful taxonomy, so
// we collapse to category-only.
type CatShape = { category: string; subcategory?: string | null }
function catMain(p: CatShape): string {
  if (selectedCategory.value === 'Misc') return p.category
  if (selectedCategory.value !== 'all' && p.subcategory) return p.subcategory
  return p.category
}
function catSub(p: CatShape): string | null {
  if (selectedCategory.value === 'Misc') return null
  if (!p.subcategory) return null
  return selectedCategory.value === 'all' ? p.subcategory : p.category
}
const catHeader = computed(() => {
  if (selectedCategory.value === 'all') return 'Category / Sub'
  if (selectedCategory.value === 'Misc') return 'Category'
  return 'Sub / Category'
})

function initials(name: string): string {
  return name.split(/[\s—-]+/).filter(Boolean).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}

// --- List-nav persistence ------------------------------------------------
// On mount: restore tab + filter state from sessionStorage if the user is
// coming back from a detail page. On every filter/tab change: write the
// current ordered list of IDs + filter state, so detail pages can render
// prev/next arrows and the back-link lands on the same view.

const currentOrderedIds = computed<string[]>(() => {
  if (tab.value === 'projects') return filteredSorted.value.map(p => p.slug)
  if (tab.value === 'teams') return filteredSortedTeams.value.map(t => t.id)
  if (tab.value === 'unattributed') return filteredSortedUnattributed.value.map(u => u.deployer)
  if (tab.value === 'announced') return filteredAnnounced.value.map(a => a.id)
  return []
})

// Restore synchronously at setup time so the watchEffect below doesn't
// overwrite saved state with defaults on the first tick.
if (typeof window !== 'undefined') {
  const saved = readListNav()
  if (saved) {
    tab.value = saved.tab
    const f = saved.filters as Record<string, unknown>
    if (typeof f.selectedLayer === 'string') selectedLayer.value = f.selectedLayer as 'all' | 'L1' | 'L2'
    if (typeof f.selectedCategory === 'string') selectedCategory.value = f.selectedCategory
    if (typeof f.selectedSubcategory === 'string') selectedSubcategory.value = f.selectedSubcategory
    if (typeof f.search === 'string') search.value = f.search
    if (typeof f.sortKey === 'string') sortKey.value = f.sortKey as SortKey
    if (f.sortDir === 'asc' || f.sortDir === 'desc') sortDir.value = f.sortDir
    if (f.announcedTierFilter === 'all' || f.announcedTierFilter === 'if' || f.announcedTierFilter === 'company' || f.announcedTierFilter === 'technical') {
      announcedTierFilter.value = f.announcedTierFilter
    }
    if (typeof f.announcedHideRetired === 'boolean') announcedHideRetired.value = f.announcedHideRetired
    if (typeof f.unattributedHideInactive === 'boolean') unattributedHideInactive.value = f.unattributedHideInactive
    // Note: unattributedSortKey / unattributedSortDir intentionally NOT restored —
    // a fresh page load should always return to the Probably-first default view.
  }
}

watchEffect(() => {
  saveListNav({
    tab: tab.value,
    orderedIds: currentOrderedIds.value,
    filters: {
      selectedLayer: selectedLayer.value,
      selectedCategory: selectedCategory.value,
      selectedSubcategory: selectedSubcategory.value,
      search: search.value,
      sortKey: sortKey.value,
      sortDir: sortDir.value,
      announcedTierFilter: announcedTierFilter.value,
      announcedHideRetired: announcedHideRetired.value,
      unattributedHideInactive: unattributedHideInactive.value,
    },
  })
})
</script>

<template>
  <div>
    <div v-if="ecoPending" class="state">Loading ecosystem…</div>
    <div v-else-if="ecoError" class="state error">Failed to load: {{ ecoError.message }}</div>
    <template v-else>

      <!-- Hero -->
      <div class="l1-hero">
        <div class="pulse-card">
          <div class="eyebrow"><span class="dot" /> LIVE ON-CHAIN</div>
          <h1>Every project on L1 <span class="big">mainnet</span></h1>
          <p class="subline">
            {{ pulseStats.totalProjects }} projects across {{ pulseStats.totalTeams }} teams.
          </p>
          <div class="strip">
            <div>
              <span class="lb">Transactions</span>
              <span class="vl">{{ fmtNum(pulseStats.totalTxs) }}</span>
              <span class="dl">lifetime</span>
            </div>
            <div>
              <span class="lb">Events</span>
              <span class="vl">{{ fmtNum(pulseStats.totalEvents) }}</span>
              <span class="dl">emitted</span>
            </div>
            <div>
              <span class="lb">Wallets</span>
              <span class="vl">{{ fmtNum(pulseStats.totalWallets) }}</span>
              <span class="dl">unique senders</span>
            </div>
          </div>
        </div>

        <div class="arrivals">
          <div class="arrivals-inner">
            <h3>Network activity <span class="hint">LAST 30 EPOCHS</span></h3>
            <div class="epoch-chart">
              <ChartsAreaChart
                :data="epochChartData.values"
                :x-labels="epochChartData.labels"
                label="Txs / epoch"
                :height="180"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="page-tabs">
        <button :class="['ptab', { active: tab === 'projects' }]" @click="tab = 'projects'">
          Projects <span class="count">{{ allProjects.length }}</span>
        </button>
        <button :class="['ptab', { active: tab === 'teams' }]" @click="tab = 'teams'">
          Teams <span class="count">{{ teamRows.length }}</span>
        </button>
        <button :class="['ptab', { active: tab === 'unattributed' }]" @click="tab = 'unattributed'">
          Unattributed <span class="count">{{ unattributed.length }}</span>
        </button>
        <button :class="['ptab', { active: tab === 'announced' }]" @click="tab = 'announced'">
          Announced <span class="count">{{ ANNOUNCED_ENTRIES.length }}</span>
        </button>
        <button :class="['ptab', { active: tab === 'network' }]" @click="tab = 'network'">
          Network
        </button>
      </div>

      <!-- Scan table -->
      <div v-if="tab === 'projects'" class="scan-wrap">
        <div class="scan-toolbar">
          <input
            v-model="search"
            placeholder="Search projects, teams, categories…"
          />
        </div>

        <div class="chip-row">
          <span class="chip-label">CATEGORY</span>
          <div class="cat-chips">
            <button
              v-for="c in categoryChips"
              :key="c.key"
              :class="{ on: c.key === selectedCategory }"
              @click="selectedCategory = c.key"
            >
              {{ c.label }}
              <span class="chip-count">{{ c.count }}</span>
            </button>
          </div>
        </div>

        <div v-if="subcategoryChips.length" class="chip-row subcat-row">
          <span class="chip-label">SUB</span>
          <div class="subcat-chips">
            <button
              v-for="c in subcategoryChips"
              :key="c.key"
              :class="{ on: c.key === selectedSubcategory }"
              @click="selectedSubcategory = c.key"
            >
              {{ c.label }}
              <span class="chip-count">{{ c.count }}</span>
            </button>
          </div>
        </div>

        <table class="scan-table">
          <thead>
            <tr>
              <th class="rank">#</th>
              <th>Project / Team</th>
              <th>Layer</th>
              <th>{{ catHeader }}</th>
              <th class="num sortable" :class="{ active: sortKey === 'transactions' }" @click="setSort('transactions')">
                TXs <i class="fa-solid sort-ic" :class="sortIcon('transactions')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'events' }" @click="setSort('events')">
                Events <i class="fa-solid sort-ic" :class="sortIcon('events')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'uniqueSenders' }" @click="setSort('uniqueSenders')">
                Wallets <i class="fa-solid sort-ic" :class="sortIcon('uniqueSenders')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'objectCount' }" @click="setSort('objectCount')">
                Objects <i class="fa-solid sort-ic" :class="sortIcon('objectCount')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'packages' }" @click="setSort('packages')">
                Packages <i class="fa-solid sort-ic" :class="sortIcon('packages')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'storageIota' }" @click="setSort('storageIota')">
                Storage <i class="fa-solid sort-ic" :class="sortIcon('storageIota')" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, i) in filteredSorted" :key="p.slug">
              <td class="rank">{{ i + 1 }}</td>
              <td>
                <div class="proj-cell">
                  <NuxtLink :to="`/project/${p.slug}`" class="avatar-link">
                    <span class="avatar" :data-layer="p.layer">
                      <img v-if="projectLogo(p)" :src="projectLogo(p)!" alt="" />
                      <span v-else class="initials">{{ initials(p.name) }}</span>
                    </span>
                  </NuxtLink>
                  <div class="proj-stack">
                    <NuxtLink :to="`/project/${p.slug}`" class="proj-name">{{ p.name }}</NuxtLink>
                    <NuxtLink v-if="p.team" :to="`/team/${p.team.id}`" class="team-sub">{{ p.team.name }}</NuxtLink>
                    <span v-else class="team-sub dim">—</span>
                  </div>
                </div>
              </td>
              <td><span class="layer-chip" :data-layer="p.layer">{{ p.layer }}</span></td>
              <td>
                <div class="cat-stack">
                  <span class="cat-main">{{ catMain(p) }}</span>
                  <span v-if="catSub(p)" class="cat-sub">{{ catSub(p) }}</span>
                </div>
              </td>
              <td class="num">{{ fmtNum(p.transactions) }}</td>
              <td class="num">{{ fmtNum(p.events) }}</td>
              <td class="num">{{ fmtNum(p.uniqueSenders) }}</td>
              <td class="num">{{ fmtNum(p.objectCount) }}</td>
              <td class="num">{{ fmtNum(p.packages) }}</td>
              <td class="num">{{ p.storageIota != null ? fmtIota(p.storageIota) : '—' }}</td>
            </tr>
            <tr v-if="!filteredSorted.length">
              <td colspan="10" class="empty">No projects match the current filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Teams — mirrors the Projects scan table with team-level aggregates -->
      <div v-if="tab === 'teams'" class="scan-wrap">
        <div class="scan-toolbar">
          <input
            v-model="search"
            placeholder="Search teams, categories…"
          />
        </div>

        <div class="chip-row">
          <span class="chip-label">CATEGORY</span>
          <div class="cat-chips">
            <button
              v-for="c in categoryChips"
              :key="c.key"
              :class="{ on: c.key === selectedCategory }"
              @click="selectedCategory = c.key"
            >
              {{ c.label }}
              <span class="chip-count">{{ c.count }}</span>
            </button>
          </div>
        </div>

        <div v-if="subcategoryChips.length" class="chip-row subcat-row">
          <span class="chip-label">SUB</span>
          <div class="subcat-chips">
            <button
              v-for="c in subcategoryChips"
              :key="c.key"
              :class="{ on: c.key === selectedSubcategory }"
              @click="selectedSubcategory = c.key"
            >
              {{ c.label }}
              <span class="chip-count">{{ c.count }}</span>
            </button>
          </div>
        </div>

        <table class="scan-table">
          <thead>
            <tr>
              <th class="rank">#</th>
              <th>Team</th>
              <th>Layer</th>
              <th>{{ catHeader }}</th>
              <th class="num sortable" :class="{ active: sortKey === 'transactions' }" @click="setSort('transactions')">
                TXs <i class="fa-solid sort-ic" :class="sortIcon('transactions')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'events' }" @click="setSort('events')">
                Events <i class="fa-solid sort-ic" :class="sortIcon('events')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'uniqueSenders' }" @click="setSort('uniqueSenders')">
                Wallets <i class="fa-solid sort-ic" :class="sortIcon('uniqueSenders')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'objectCount' }" @click="setSort('objectCount')">
                Objects <i class="fa-solid sort-ic" :class="sortIcon('objectCount')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'packages' }" @click="setSort('packages')">
                Packages <i class="fa-solid sort-ic" :class="sortIcon('packages')" />
              </th>
              <th class="num sortable" :class="{ active: sortKey === 'storageIota' }" @click="setSort('storageIota')">
                Storage <i class="fa-solid sort-ic" :class="sortIcon('storageIota')" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(t, i) in filteredSortedTeams" :key="t.id">
              <td class="rank">{{ i + 1 }}</td>
              <td>
                <div class="proj-cell">
                  <NuxtLink :to="`/team/${t.id}`" class="avatar-link">
                    <span class="avatar" :data-layer="t.layer">
                      <img v-if="t.logo" :src="t.logo" alt="" />
                      <span v-else class="initials">{{ initials(t.name) }}</span>
                    </span>
                  </NuxtLink>
                  <NuxtLink :to="`/team/${t.id}`" class="proj-name">{{ t.name }}</NuxtLink>
                </div>
              </td>
              <td><span class="layer-chip" :data-layer="t.layer">{{ t.layer }}</span></td>
              <td>
                <div class="cat-stack">
                  <span class="cat-main">{{ catMain(t) }}</span>
                  <span v-if="catSub(t)" class="cat-sub">{{ catSub(t) }}</span>
                </div>
              </td>
              <td class="num">{{ fmtNum(t.transactions) }}</td>
              <td class="num">{{ fmtNum(t.events) }}</td>
              <td class="num">{{ fmtNum(t.uniqueSenders) }}</td>
              <td class="num">{{ fmtNum(t.objectCount) }}</td>
              <td class="num">{{ fmtNum(t.packages) }}</td>
              <td class="num">{{ t.storageIota ? fmtIota(t.storageIota) : '—' }}</td>
            </tr>
            <tr v-if="!filteredSortedTeams.length">
              <td colspan="10" class="empty">No teams match the current filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Unattributed clusters -->
      <div v-if="tab === 'unattributed'" class="scan-wrap">
        <div class="scan-toolbar">
          <input
            v-model="search"
            placeholder="Search deployer, module, sample name…"
          />
          <button
            class="hide-retired"
            :class="{ on: unattributedHideInactive }"
            :title="unattributedHideInactive ? 'Hiding clusters with 0 packages, 0 TXs, and 0 events' : 'Showing all clusters (including inactive)'"
            @click="unattributedHideInactive = !unattributedHideInactive"
          >
            <i class="fa-solid" :class="unattributedHideInactive ? 'fa-eye-slash' : 'fa-eye'" />
            {{ unattributedHideInactive ? 'Inactive hidden' : 'Show inactive' }}
          </button>
        </div>

        <table class="scan-table">
          <thead>
            <tr>
              <th class="rank">#</th>
              <th>Deployer</th>
              <th class="num sortable" :class="{ active: unattributedSortKey === 'packages' }" @click="setUnattributedSort('packages')">
                Packages <i class="fa-solid sort-ic" :class="unattributedSortIcon('packages')" />
              </th>
              <th class="num sortable" :class="{ active: unattributedSortKey === 'transactions' }" @click="setUnattributedSort('transactions')">
                TXs <i class="fa-solid sort-ic" :class="unattributedSortIcon('transactions')" />
              </th>
              <th class="num sortable" :class="{ active: unattributedSortKey === 'events' }" @click="setUnattributedSort('events')">
                Events <i class="fa-solid sort-ic" :class="unattributedSortIcon('events')" />
              </th>
              <th class="num sortable" :class="{ active: unattributedSortKey === 'uniqueSenders' }" @click="setUnattributedSort('uniqueSenders')">
                Wallets <i class="fa-solid sort-ic" :class="unattributedSortIcon('uniqueSenders')" />
              </th>
              <th class="num sortable" :class="{ active: unattributedSortKey === 'objectCount' }" @click="setUnattributedSort('objectCount')">
                Objects <i class="fa-solid sort-ic" :class="unattributedSortIcon('objectCount')" />
              </th>
              <th class="num sortable" :class="{ active: unattributedSortKey === 'storageIota' }" @click="setUnattributedSort('storageIota')">
                Storage <i class="fa-solid sort-ic" :class="unattributedSortIcon('storageIota')" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(u, i) in filteredSortedUnattributed" :key="u.deployer">
              <td class="rank">{{ i + 1 }}</td>
              <td>
                <div class="proj-stack">
                  <NuxtLink
                    :to="`/unattributed/${u.deployer}`"
                    class="proj-name addr-link"
                    :title="u.deployer"
                  >{{ shortAddr(u.deployer) }}</NuxtLink>
                  <span v-if="u.deployerAttributedProjects?.length" class="probably-hint">
                    <i class="fa-solid fa-wand-magic-sparkles" />
                    Probably:
                    <NuxtLink
                      v-for="(p, pi) in u.deployerAttributedProjects"
                      :key="p.slug"
                      :to="`/project/${p.slug}`"
                      class="probably-link"
                    >{{ p.name }}<span v-if="pi < u.deployerAttributedProjects.length - 1">,</span></NuxtLink>
                  </span>
                  <div v-if="u.insights?.length" class="insight-pills">
                    <span v-for="(ins, ii) in u.insights.slice(0, 3)" :key="ii" class="insight-pill">{{ ins }}</span>
                  </div>
                  <span v-else-if="u.modules?.length" class="team-sub">modules: {{ u.modules.slice(0, 3).join(', ') }}</span>
                </div>
              </td>
              <td class="num">{{ fmtNum(u.packages) }}</td>
              <td class="num">{{ fmtNum(u.transactions) }}</td>
              <td class="num">{{ fmtNum(u.events) }}</td>
              <td class="num">{{ fmtNum(u.uniqueSenders) }}</td>
              <td class="num">{{ fmtNum(u.objectCount) }}</td>
              <td class="num">{{ u.storageIota ? fmtIota(u.storageIota) : '—' }}</td>
            </tr>
            <tr v-if="!filteredSortedUnattributed.length">
              <td colspan="8" class="empty">No unattributed clusters match the current search.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Announced — curated watchlist of publicly-announced IOTA projects
           with on-chain observation status. Tier 1 = Foundation-promoted,
           Tier 2 = self-announced with explicit IOTA-stack claim. -->
      <div v-if="tab === 'announced'" class="scan-wrap">
        <div class="announced-lede">
          Publicly-announced IOTA projects, graded by on-chain reality. Tier 1 = Foundation-promoted · Tier 2 = self-announced · silent entries stay visible.
        </div>

        <div class="scan-toolbar">
          <input
            v-model="search"
            placeholder="Search announced projects, stack, description…"
          />
          <div class="layer-toggle">
            <button :class="{ on: announcedTierFilter === 'all' }" @click="announcedTierFilter = 'all'">All</button>
            <button :class="{ on: announcedTierFilter === 'if' }" @click="announcedTierFilter = 'if'">IF</button>
            <button :class="{ on: announcedTierFilter === 'company' }" @click="announcedTierFilter = 'company'">Company</button>
            <button :class="{ on: announcedTierFilter === 'technical' }" @click="announcedTierFilter = 'technical'">Technical</button>
          </div>
          <button class="hide-retired" :class="{ on: announcedHideRetired }" @click="announcedHideRetired = !announcedHideRetired">
            <i class="fa-solid" :class="announcedHideRetired ? 'fa-eye-slash' : 'fa-eye'" />
            {{ announcedHideRetired ? 'Retired hidden' : 'Show retired' }}
          </button>
        </div>

        <table class="scan-table announced-table">
          <thead>
            <tr>
              <th class="rank">#</th>
              <th>Project</th>
              <th>Tier</th>
              <th>On-chain</th>
              <th>Category / Sub</th>
              <th>Announced</th>
              <th class="num">Sources</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(a, i) in filteredAnnounced"
              :key="a.id"
              :class="{
                retired: isRetired(computeLifecycle(a.lastConfirmed)),
                'row-demo': hasDemoBadge(a) || (a.hackathons && a.hackathons.length > 0),
              }"
            >
              <td class="rank">{{ i + 1 }}</td>
              <td>
                <NuxtLink :to="`/announced/${a.id}`" class="proj-name">{{ a.name }}</NuxtLink>
                <span
                  v-if="a.hackathons && a.hackathons.some(h => h.result === 'winner')"
                  class="stage-chip"
                  data-stage="hackathon-winner"
                  :title="a.hackathons.filter(h => h.result === 'winner').map(h => h.event + (h.note ? ' — ' + h.note : '')).join(' · ')"
                >HACKATHON WINNER</span>
                <span
                  v-else-if="a.hackathons && a.hackathons.length > 0"
                  class="stage-chip"
                  data-stage="hackathon-participant"
                  :title="a.hackathons.map(h => h.event + (h.note ? ' — ' + h.note : '')).join(' · ')"
                >HACKATHON</span>
                <span v-if="a.stage === 'startup'" class="stage-chip" data-stage="startup">STARTUP</span>
                <span v-else-if="a.stage === 'company'" class="stage-chip" data-stage="company">COMPANY</span>
                <span v-if="hasDemoBadge(a)" class="stage-chip" data-stage="demo">DEMO</span>
              </td>
              <td>
                <span class="tier-chip" :data-tier="a.tier">{{ TIER_LABEL[a.tier] }}</span>
              </td>
              <td>
                <span class="onchain-chip" :data-onchain="a.onchain">{{ ONCHAIN_LABEL[a.onchain] }}</span>
              </td>
              <td>
                <div class="cat-stack">
                  <span class="cat-main">{{ a.category }}</span>
                  <span v-if="a.subcategory" class="cat-sub">{{ a.subcategory }}</span>
                </div>
              </td>
              <td>
                <span class="date-main">{{ a.firstAnnounced }}</span>
              </td>
              <td class="num">{{ a.announcements.length }}</td>
            </tr>
            <tr v-if="!filteredAnnounced.length">
              <td colspan="7" class="empty">No announced projects match the current filters.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Network -->
      <div v-if="tab === 'network'" class="network-wrap">
        <div class="net-tiles">
          <div class="net-tile">
            <span class="lb">Transactions</span>
            <span class="vl">{{ fmtNum(networkTotals.totalTxs) }}</span>
            <span class="dl">across {{ networkTotals.epochs }} epochs</span>
          </div>
          <div class="net-tile">
            <span class="lb">Gas burned</span>
            <span class="vl">{{ fmtIota(networkTotals.totalGasBurned) }}</span>
            <span class="dl">cumulative</span>
          </div>
          <div class="net-tile">
            <span class="lb">Storage fund</span>
            <span class="vl">{{ fmtIota(networkTotals.latestStorage) }}</span>
            <span class="dl">latest epoch</span>
          </div>
        </div>

        <div class="net-grid">
          <div class="net-card">
            <div class="net-card-head">
              <h3>Transactions per epoch</h3>
              <span class="hint">LAST 30 EPOCHS</span>
            </div>
            <ChartsAreaChart
              :data="epochChartData.values"
              :x-labels="epochChartData.labels"
              label="Txs / epoch"
              :height="220"
            />
          </div>
          <div class="net-card">
            <div class="net-card-head">
              <h3>Gas burned per epoch</h3>
              <span class="hint">LAST 30 EPOCHS · IOTA</span>
            </div>
            <ChartsAreaChart
              :data="gasBurnChart.values"
              :x-labels="gasBurnChart.labels"
              label="Gas burned (IOTA)"
              :height="220"
            />
          </div>
          <div class="net-card">
            <div class="net-card-head">
              <h3>Storage fund total</h3>
              <span class="hint">LAST 30 EPOCHS · IOTA</span>
            </div>
            <ChartsAreaChart
              :data="storageChart.values"
              :x-labels="storageChart.labels"
              label="Storage fund (IOTA)"
              :height="220"
            />
          </div>
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.state {
  padding: 40px;
  text-align: center;
  color: var(--text-mute, #94a3b8);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  letter-spacing: 0.04em;
}
.state.error { color: #fca5a5; }

.page-tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--border, #1C2740);
  margin: 18px 0 0;
  padding: 0 4px;
  position: sticky;
  top: var(--topbar-h, 61px);
  z-index: 40;
  background: var(--bg, #0B1220);
}
.ptab {
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-serif, 'Instrument Sans', sans-serif);
  font-size: 14px;
  letter-spacing: 0.02em;
  padding: 10px 14px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: color .1s, border-color .1s;
  margin-bottom: -1px;
}
.ptab:hover { color: var(--text, #F1F5F9); }
.ptab.active {
  color: var(--accent, #F5B041);
  border-bottom-color: var(--accent, #F5B041);
}
.ptab .count {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 99px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-mute, #94a3b8);
  letter-spacing: 0.02em;
}
.ptab.active .count {
  background: var(--accent-soft, rgba(245,176,65,0.15));
  color: var(--accent, #F5B041);
}

@media (max-width: 720px) {
  .page-tabs {
    flex-wrap: nowrap;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scrollbar-width: none;
    margin-left: -12px;
    margin-right: -12px;
    padding-left: 12px;
    padding-right: 12px;
  }
  .page-tabs::-webkit-scrollbar { display: none; }
  .ptab {
    flex: 0 0 auto;
    scroll-snap-align: start;
    padding: 9px 12px;
    font-size: 13px;
  }
}

.team-desc {
  color: var(--text-mute, #94a3b8);
  font-size: 12px;
  max-width: 560px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.network-wrap { padding-top: 14px; }
.net-section { margin-top: 36px; padding-top: 28px; border-top: 1px solid var(--border, #1C2740); }
.net-section-head {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 20px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 16px;
  letter-spacing: -0.01em;
}
.net-tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.net-tile {
  border: 1px solid var(--border, #1C2740);
  border-radius: 12px;
  padding: 16px 18px;
  background: var(--surface, #111A2B);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.net-tile .lb {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-mute, #94a3b8);
}
.net-tile .vl {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 22px;
  color: var(--text, #F1F5F9);
  font-weight: 600;
}
.net-tile .dl {
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}

.net-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
  gap: 14px;
}
.net-card {
  border: 1px solid var(--border, #1C2740);
  border-radius: 12px;
  padding: 16px;
  background: var(--surface, #111A2B);
}
.net-card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}
.net-card-head h3 {
  font-family: var(--font-serif, 'Instrument Sans', sans-serif);
  font-size: 14px;
  margin: 0;
  color: var(--text, #F1F5F9);
  font-weight: 500;
}
.net-card-head .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  color: var(--text-mute, #94a3b8);
}

.epoch-chart {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  align-items: stretch;
  margin-top: 8px;
}

.chip-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
}
.chip-row.subcat-row {
  border-top: 1px dashed var(--border, #1C2740);
}
.chip-label {
  flex: 0 0 auto;
  padding-top: 5px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.12em;
  color: var(--text-mute, #94a3b8);
}
.cat-chips,
.subcat-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: 1 1 auto;
  min-width: 0;
}
.cat-chips button,
.subcat-chips button {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid var(--border, #1C2740);
  background: transparent;
  color: var(--text-mute, #94a3b8);
  cursor: pointer;
  transition: color .1s, border-color .1s, background .1s;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.cat-chips button:hover,
.subcat-chips button:hover {
  color: var(--text, #F1F5F9);
  border-color: var(--border-strong, #2a3a5c);
}
.cat-chips button.on {
  color: var(--accent, #F5B041);
  border-color: var(--accent, #F5B041);
  background: var(--accent-soft, rgba(245,176,65,0.1));
}
.subcat-chips button.on {
  color: var(--text, #F1F5F9);
  border-color: var(--accent, #F5B041);
  background: transparent;
}
.chip-count {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9.5px;
  letter-spacing: 0.02em;
  padding: 1px 5px;
  border-radius: 99px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-mute, #94a3b8);
  text-transform: none;
  line-height: 1.4;
}
.cat-chips button.on .chip-count {
  background: rgba(245, 176, 65, 0.2);
  color: var(--accent, #F5B041);
}
.subcat-chips button.on .chip-count {
  background: var(--chip-bg, #0e1626);
  color: var(--accent, #F5B041);
}

.scan-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px 12px;
}
.scan-toolbar input {
  flex: 1 1 auto;
  min-width: 0;
  height: 32px;
  padding: 0 12px;
  font-family: var(--font-sans, 'Inter', sans-serif);
  font-size: 13px;
  color: var(--text, #F1F5F9);
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  outline: none;
  transition: border-color .1s;
}
.scan-toolbar input:focus { border-color: var(--accent, #F5B041); }
.scan-toolbar input::placeholder { color: var(--text-mute, #94a3b8); }
.layer-toggle {
  display: inline-flex;
  background: var(--chip-bg, #0e1626);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
  flex: 0 0 auto;
}
.layer-toggle button {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 5px 12px;
  border: none;
  background: transparent;
  color: var(--text-mute, #94a3b8);
  border-radius: 5px;
  cursor: pointer;
}
.layer-toggle button.on {
  background: var(--surface, #111A2B);
  color: var(--text, #F1F5F9);
  box-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.scan-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.scan-table thead th {
  text-align: left;
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  color: var(--text-mute, #94a3b8);
  padding: 10px 12px;
  border-bottom: 1px solid var(--border, #1C2740);
  font-weight: 500;
}
.scan-table tbody td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--border, #1C2740);
  color: var(--text, #F1F5F9);
  vertical-align: middle;
}
.scan-table td.num, .scan-table th.num {
  text-align: right;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}
.scan-table th.rank, .scan-table td.rank {
  width: 40px;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
}
.scan-table tbody tr:hover { background: var(--accent-soft, rgba(245,176,65,0.04)); }

.scan-table th.sortable {
  cursor: pointer;
  user-select: none;
  transition: color .1s;
}
.scan-table th.sortable:hover { color: var(--text, #F1F5F9); }
.scan-table th.sortable.active { color: var(--accent, #F5B041); }
.sort-ic {
  margin-left: 6px;
  font-size: 10px;
  opacity: 0.55;
}
.scan-table th.sortable.active .sort-ic { opacity: 1; }

/* Mobile: hide less-critical columns, collapse chip rows */
@media (max-width: 1100px) {
  /* Hide Objects (8) and Storage (10) first */
  .scan-table th:nth-child(8),
  .scan-table td:nth-child(8),
  .scan-table th:nth-child(10),
  .scan-table td:nth-child(10) { display: none; }
}
@media (max-width: 820px) {
  /* Hide Wallets (7) and Packages (9) */
  .scan-table th:nth-child(7),
  .scan-table td:nth-child(7),
  .scan-table th:nth-child(9),
  .scan-table td:nth-child(9) { display: none; }
  .scan-toolbar { flex-wrap: wrap; }
  .chip-row { flex-direction: column; gap: 6px; padding: 10px 12px; }
  .chip-label { min-width: 0; padding-top: 0; }
}
@media (max-width: 560px) {
  /* Hide Category / Sub (4) */
  .scan-table th:nth-child(4),
  .scan-table td:nth-child(4) { display: none; }
  .scan-table { font-size: 12px; }
}
.scan-table a { color: var(--text, #F1F5F9); text-decoration: none; }
.scan-table .dim { color: var(--text-mute, #94a3b8); }
.scan-table td.empty {
  text-align: center;
  padding: 40px;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
}

.proj-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }
.proj-stack { display: flex; flex-direction: column; min-width: 0; line-height: 1.25; }
.proj-name {
  font-weight: 500;
  color: var(--text, #F1F5F9);
  text-decoration: none;
}
.proj-name:hover { color: var(--accent, #F5B041); }
.scan-table a.team-sub {
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
  text-decoration: none;
  margin-top: 1px;
}
.scan-table a.team-sub:hover { color: var(--accent, #F5B041); }
.avatar-link { display: inline-flex; flex: 0 0 auto; text-decoration: none; }
.addr-link { font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 12px; }

.announced-lede {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px;
  line-height: 1.55;
  padding: 14px 16px 4px;
}

.hide-retired {
  flex: 0 0 auto;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 0 12px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border, #1C2740);
  background: var(--chip-bg, #0e1626);
  color: var(--text-mute, #94a3b8);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: color .1s, border-color .1s;
}
.hide-retired:hover { color: var(--text, #F1F5F9); border-color: var(--border-strong, #2a3a5c); }
.hide-retired.on { color: var(--accent, #F5B041); border-color: var(--accent, #F5B041); }

.announced-table tbody tr.retired { opacity: 0.48; }
.announced-table tbody tr.retired:hover { opacity: 0.75; }
.announced-table tbody tr.row-demo:not(.retired) { opacity: 0.78; }
.announced-table tbody tr.row-demo:not(.retired):hover { opacity: 1; }

.probably-hint {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  margin-top: 4px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--accent, #F5B041);
  background: var(--accent-soft, rgba(245,176,65,0.10));
  border: 1px solid rgba(245,176,65,0.35);
  border-radius: 4px;
  padding: 2px 8px;
  line-height: 1.4;
  width: fit-content;
  max-width: 100%;
}
.probably-hint .fa-wand-magic-sparkles { font-size: 10px; }
.probably-link {
  color: var(--accent, #F5B041);
  text-decoration: none;
  font-weight: 500;
}
.probably-link:hover { text-decoration: underline; }

.insight-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 3px 6px;
  margin-top: 4px;
}
.insight-pill {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.02em;
  padding: 1px 7px;
  border-radius: 3px;
  border: 1px solid var(--border, #1C2740);
  background: rgba(148,163,184,0.05);
  color: var(--text-mute, #94a3b8);
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 360px;
}

.stage-chip {
  display: inline-block;
  margin-left: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 9px;
  letter-spacing: 0.1em;
  padding: 1px 6px;
  border-radius: 3px;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
  vertical-align: middle;
}
.stage-chip[data-stage="hackathon-winner"] {
  background: rgba(245, 176, 65, 0.12);
  border-color: rgba(245, 176, 65, 0.45);
  color: #F5B041;
}
.stage-chip[data-stage="hackathon-participant"] {
  background: rgba(96, 165, 250, 0.08);
  border-color: rgba(96, 165, 250, 0.35);
  color: #60a5fa;
}
.stage-chip[data-stage="demo"] {
  background: rgba(148, 163, 184, 0.06);
  border-color: rgba(148, 163, 184, 0.3);
  color: #94a3b8;
  border-style: dashed;
}
.stage-chip[data-stage="startup"] {
  background: rgba(167, 139, 250, 0.08);
  border-color: rgba(167, 139, 250, 0.4);
  color: #a78bfa;
}
.stage-chip[data-stage="company"] {
  background: rgba(52, 211, 153, 0.08);
  border-color: rgba(52, 211, 153, 0.4);
  color: #34d399;
}

.tier-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
  text-transform: uppercase;
}
.tier-chip[data-tier="if"] {
  color: var(--accent, #F5B041);
  border-color: var(--accent, #F5B041);
  background: var(--accent-soft, rgba(245,176,65,0.12));
}
.tier-chip[data-tier="company"] {
  color: var(--text-dim, #cbd5e1);
  border-color: var(--border-strong, #2a3a5c);
  background: rgba(148,163,184,0.06);
}
.tier-chip[data-tier="technical"] {
  color: var(--text-mute, #94a3b8);
  border-color: var(--border, #1C2740);
  background: transparent;
  border-style: dashed;
}

.onchain-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid transparent;
}
.onchain-chip[data-onchain="shared-rail"] { color: #2dd4bf; border-color: #14b8a6; background: rgba(20,184,166,0.1); }
.onchain-chip[data-onchain="testnet"]     { color: #60a5fa; border-color: #3b82f6; background: rgba(59,130,246,0.1); }
.onchain-chip[data-onchain="none"]        { color: #94a3b8; border-color: #334155; background: rgba(148,163,184,0.08); }

.stack-chips { display: flex; flex-wrap: wrap; gap: 4px; }
.stack-chip {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.04em;
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-dim, #cbd5e1);
}

.ext-ic { font-size: 9px; margin-left: 4px; opacity: 0.6; }
.date-main { font-family: var(--font-mono, 'JetBrains Mono', monospace); font-size: 12px; color: var(--text, #F1F5F9); }

.source-link {
  display: inline-flex;
  flex-direction: column;
  gap: 1px;
  color: var(--text-dim, #cbd5e1);
  text-decoration: none;
  font-size: 12px;
  line-height: 1.2;
}
.source-link:hover { color: var(--accent, #F5B041); }
.source-link .source-host {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--text-mute, #94a3b8);
}

.cat-stack { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.cat-main { font-weight: 500; color: var(--text, #F1F5F9); }
.cat-sub {
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
  margin-top: 1px;
}
.avatar {
  width: 26px;
  height: 26px;
  border-radius: 6px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  display: inline-grid;
  place-items: center;
  flex: 0 0 26px;
  overflow: hidden;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  color: var(--text-mute, #94a3b8);
}
.avatar img { width: 100%; height: 100%; object-fit: cover; }

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
.layer-chip[data-layer="L1"] {
  color: var(--accent, #F5B041);
  border-color: var(--accent, #F5B041);
}
.layer-chip[data-layer="L2"] {
  color: #60a5fa;
  border-color: #3b82f6;
}
</style>
