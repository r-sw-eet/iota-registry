<script setup lang="ts">
import {
  ANNOUNCED_ENTRIES,
  computeLifecycle,
  TIER_LABEL,
  ONCHAIN_LABEL,
  STAGE_LABEL,
  hasDemoBadge,
  type AnnouncedEntry,
  type AnnouncedStage,
} from '~/data/announced'

function daysSince(iso: string): number {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return 0
  return Math.floor((Date.now() - t) / 86_400_000)
}

const TIER_EXPL: Record<'if' | 'company' | 'technical', string> = {
  if: 'IOTA Foundation–authored announcement (blog.iota.org, showcase, @iota).',
  company: 'Project-authored formal announcement (litepaper, press release, own blog).',
  technical: 'Only technical traces — website mentions, GitHub imports, code references. No formal announcement.',
}

const STAGE_EXPL: Record<AnnouncedStage, string> = {
  startup: 'Seed-phase; may not even be formally founded.',
  company: 'Ongoing business entity with product or pilot.',
}

const ONCHAIN_EXPL: Record<'shared-rail' | 'testnet' | 'none', string> = {
  'shared-rail': 'Confirmed live but anchoring via TWIN verifiable_storage / IOTA Identity — no dedicated deployer row expected. Wouldn\'t surface in the Projects tab even once active.',
  testnet: 'Verifiable testnet footprint. Not on mainnet yet.',
  none: 'Nothing on-chain yet — public claim only.',
}

const route = useRoute()
const entry = computed<AnnouncedEntry | null>(() => {
  return ANNOUNCED_ENTRIES.find(e => e.id === route.params.id) ?? null
})

useHead(() => ({
  title: entry.value
    ? `${entry.value.name} — Announced — IOTA Registry`
    : 'Announcement — IOTA Registry',
}))

function hostFromUrl(u: string): string {
  try { return new URL(u).host.replace(/^www\./, '') } catch { return u }
}
</script>

<template>
  <div>
    <DetailNavStrip v-if="entry" tab="announced" :current-id="entry.id" base-path="/announced" />
    <NuxtLink v-else to="/" class="back-link">← Back to dashboard</NuxtLink>

    <div v-if="!entry" class="state error">Announcement not found.</div>
    <template v-else>
      <header class="ann-head">
        <div class="top-row">
          <h1>{{ entry.name }}</h1>
          <span class="tier-chip" :data-tier="entry.tier">{{ TIER_LABEL[entry.tier] }}</span>
          <template v-for="(h, i) in entry.hackathons || []" :key="`hk-${i}`">
            <span class="stage-chip" :data-stage="`hackathon-${h.result}`" :title="h.note ? `${h.event} — ${h.note}` : h.event">
              {{ h.result === 'winner' ? 'HACKATHON WINNER' : 'HACKATHON' }}
            </span>
          </template>
          <span v-if="entry.stage === 'startup'" class="stage-chip" data-stage="startup">STARTUP</span>
          <span v-else-if="entry.stage === 'company'" class="stage-chip" data-stage="company">COMPANY</span>
          <span v-if="hasDemoBadge(entry)" class="stage-chip" data-stage="demo">DEMO</span>
          <span class="onchain-chip" :data-onchain="entry.onchain">{{ ONCHAIN_LABEL[entry.onchain] }}</span>
          <span v-if="computeLifecycle(entry.lastConfirmed) !== 'active'" class="lifecycle-chip" :data-lifecycle="computeLifecycle(entry.lastConfirmed)">{{ computeLifecycle(entry.lastConfirmed) }}</span>
        </div>
        <div class="sub">
          <div class="stack-chips">
            <span v-for="s in entry.stack" :key="s" class="stack-chip">{{ s }}</span>
          </div>
          <a :href="entry.officialUrl" target="_blank" rel="noopener" class="official">
            {{ hostFromUrl(entry.officialUrl) }}
            <i class="fa-solid fa-arrow-up-right-from-square" />
          </a>
        </div>
      </header>

      <section class="section">
        <h2>What they're building</h2>
        <p class="prose">{{ entry.description }}</p>
      </section>

      <section v-if="entry.industries && entry.industries.length" class="section">
        <h2>Industries</h2>
        <div class="stack-chips">
          <span v-for="ind in entry.industries" :key="ind" class="stack-chip">{{ ind }}</span>
        </div>
      </section>

      <section class="section">
        <h2>Timeline</h2>
        <dl class="kv">
          <dt>Category</dt>
          <dd>{{ entry.category }}{{ entry.subcategory ? ` / ${entry.subcategory}` : '' }}</dd>
          <dt>Tier</dt>
          <dd>
            <b>{{ TIER_LABEL[entry.tier] }}</b>
            <span class="status-expl">{{ TIER_EXPL[entry.tier] }}</span>
          </dd>
          <dt>Stage</dt>
          <dd v-if="entry.stage">
            <b>{{ STAGE_LABEL[entry.stage] }}</b>
            <span class="status-expl">{{ STAGE_EXPL[entry.stage] }}</span>
          </dd>
          <dd v-else>
            <b>—</b>
            <span class="status-expl">Organizational maturity unknown. Often the case for hackathon teams that didn't publish team/company details.</span>
          </dd>
          <template v-if="entry.hackathons && entry.hackathons.length">
            <dt>Hackathons</dt>
            <dd>
              <ul class="hk-list">
                <li v-for="(h, i) in entry.hackathons" :key="i">
                  <b>{{ h.result === 'winner' ? 'Winner' : 'Participant' }}</b>
                  — {{ h.event }}<span v-if="h.date"> ({{ h.date }})</span>
                  <span v-if="h.note" class="status-expl">{{ h.note }}</span>
                </li>
              </ul>
            </dd>
          </template>
          <dt>On-chain</dt>
          <dd>
            <span class="onchain-chip" :data-onchain="entry.onchain">{{ ONCHAIN_LABEL[entry.onchain] }}</span>
            <span class="status-expl">{{ ONCHAIN_EXPL[entry.onchain] }}</span>
            <ul v-if="entry.onchainProof && entry.onchainProof.length" class="proof-list">
              <li v-for="p in entry.onchainProof" :key="p.href">
                <a :href="p.href" target="_blank" rel="noopener">
                  {{ p.label }}
                  <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
                </a>
              </li>
            </ul>
          </dd>
          <dt>Lifecycle</dt>
          <dd>
            <b>{{ computeLifecycle(entry.lastConfirmed) }}</b>
            <span class="status-expl">{{ {
              active: 'Last confirmed within 6 months. Still live / evolving.',
              stale: 'Last confirmed 6–12 months ago. Greyed out, kept visible — accountability.',
              dead: 'Last confirmed more than 12 months ago. Operator-refresh required to revive.',
            }[computeLifecycle(entry.lastConfirmed)] }}</span>
          </dd>
          <dt>First announced</dt>
          <dd>{{ entry.firstAnnounced }}</dd>
          <dt>Last confirmed</dt>
          <dd>{{ entry.lastConfirmed }} <span class="status-expl">({{ daysSince(entry.lastConfirmed) }} days ago)</span></dd>
        </dl>
      </section>

      <section class="section">
        <h2>Announcements <span class="hint">{{ entry.announcements.length }}</span></h2>
        <p class="hint-inline">Dated public claims about the project's IOTA stack — the things we're actually tracking. Sources that get taken down stay listed as "deleted, last seen" for accountability.</p>
        <ul class="src-list">
          <li v-for="a in entry.announcements" :key="a.href" :class="{ 'src-deleted': a.deleted }">
            <a :href="a.href" target="_blank" rel="noopener">
              <span class="src-label">
                {{ a.label }}
                <span v-if="a.date" class="src-date">· {{ a.date }}</span>
                <span v-if="a.deleted" class="src-gone">deleted · last seen {{ a.lastSeen || a.date || '?' }}</span>
              </span>
              <span class="src-host">{{ hostFromUrl(a.href) }}</span>
              <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
            </a>
          </li>
        </ul>
      </section>

      <section v-if="entry.socials && entry.socials.length" class="section">
        <h2>Socials <span class="hint">{{ entry.socials.length }}</span></h2>
        <ul class="src-list compact">
          <li v-for="s in entry.socials" :key="s.href">
            <a :href="s.href" target="_blank" rel="noopener">
              <span class="src-label">{{ s.label }}</span>
              <span class="src-host">{{ hostFromUrl(s.href) }}</span>
              <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
            </a>
          </li>
        </ul>
      </section>

      <section v-if="entry.demoLinks && entry.demoLinks.length" class="section">
        <h2>Demo &amp; code <span class="hint">{{ entry.demoLinks.length }}</span></h2>
        <p class="hint-inline">Code repos and live demo URLs. Not on-chain proof — per file header, a Vercel/Netlify demo is accountability-grade evidence something was built, not that it ships.</p>
        <ul class="src-list compact">
          <li v-for="d in entry.demoLinks" :key="d.href">
            <a :href="d.href" target="_blank" rel="noopener">
              <span class="src-label">{{ d.label }}</span>
              <span class="src-host">{{ hostFromUrl(d.href) }}</span>
              <i class="fa-solid fa-arrow-up-right-from-square ext-ic" />
            </a>
          </li>
        </ul>
      </section>

      <section v-if="entry.watchSignals" class="section">
        <h2>On-chain watch signals</h2>
        <p class="prose mono">{{ entry.watchSignals }}</p>
        <p class="hint-inline">These are the patterns we grep mainnet for when a new unattributed cluster appears — if a match lands, this entry flips to <span class="code">shipped</span> and cross-links to the Projects row.</p>
      </section>

      <section v-if="entry.sharedRailNote" class="section shared-rail-section">
        <h2>Shared-rail note</h2>
        <p class="prose">{{ entry.sharedRailNote }}</p>
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

.state.error {
  padding: 40px;
  text-align: center;
  color: #fca5a5;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
}

.ann-head { margin-bottom: 32px; }
.top-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 10px;
}
.top-row h1 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 32px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0;
  letter-spacing: -0.01em;
}
.sub {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
}
.official {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--accent, #F5B041);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.official:hover { text-decoration: underline; }

.tier-chip {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
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
  border-style: dashed;
  background: transparent;
}

.stage-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.12em;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
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

.hk-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.hk-list li {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-dim, #cbd5e1);
}
.hk-list .status-expl {
  display: block;
  margin-top: 2px;
}

.status-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  border: 1px solid transparent;
}
.onchain-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 3px 10px;
  border-radius: 99px;
  border: 1px solid transparent;
}
.onchain-chip[data-onchain="shared-rail"] { color: #2dd4bf; border-color: #14b8a6; background: rgba(20,184,166,0.1); }
.onchain-chip[data-onchain="testnet"]     { color: #60a5fa; border-color: #3b82f6; background: rgba(59,130,246,0.1); }
.onchain-chip[data-onchain="none"]        { color: #94a3b8; border-color: #334155; background: rgba(148,163,184,0.08); }

.lifecycle-chip {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 4px;
}
.lifecycle-chip[data-lifecycle="stale"] { color: #64748b; background: rgba(71,85,105,0.15); border: 1px solid #475569; }
.lifecycle-chip[data-lifecycle="dead"]  { color: #fca5a5; background: rgba(239,68,68,0.12); border: 1px solid #ef4444; }

.src-deleted a { border-style: dashed; }
.src-deleted .src-label { color: var(--text-mute, #94a3b8); }
.src-gone {
  display: inline-block;
  margin-left: 8px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 1px 6px;
  border-radius: 3px;
  background: rgba(239,68,68,0.12);
  color: #fca5a5;
  border: 1px solid rgba(239,68,68,0.4);
}

.stack-chips { display: inline-flex; flex-wrap: wrap; gap: 4px; }
.stack-chip {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
  padding: 3px 8px;
  border-radius: 4px;
  background: var(--chip-bg, #0e1626);
  color: var(--text-dim, #cbd5e1);
}

.section { margin: 32px 0; }
.section h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 17px;
  font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 12px;
}
.section h2 .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px;
  letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8);
  font-weight: 400;
  text-transform: uppercase;
  margin-left: 8px;
}

.prose {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px;
  line-height: 1.7;
  margin: 0 0 8px;
}
.prose.mono {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  padding: 12px 14px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  line-height: 1.6;
}
.hint-inline {
  font-size: 12px;
  color: var(--text-mute, #94a3b8);
  line-height: 1.55;
  margin-top: 8px;
}
.code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--chip-bg, #0e1626);
  color: var(--text, #F1F5F9);
}

.shared-rail-section {
  background: var(--surface, #111A2B);
  border: 1px solid rgba(20, 184, 166, 0.35);
  border-radius: 10px;
  padding: 16px 18px;
  margin-top: 32px;
}
.shared-rail-section h2 { color: #2dd4bf; margin-bottom: 8px; }

.kv {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px 16px;
  margin: 0;
  font-size: 13px;
}
.kv dt {
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  letter-spacing: 0.04em;
}
.kv dd { margin: 0; color: var(--text-dim, #cbd5e1); }
.kv .status-expl { display: block; margin-top: 6px; font-size: 12px; color: var(--text-mute, #94a3b8); }

.src-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.src-list a {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 10px 14px;
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  text-decoration: none;
  color: var(--text, #F1F5F9);
  font-size: 13px;
  transition: border-color .1s;
}
.src-list a:hover { border-color: var(--accent, #F5B041); }
.src-list .src-label { flex: 1 1 auto; }
.src-list .src-date {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
  margin-left: 4px;
}
.src-list .src-host {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-mute, #94a3b8);
}
.src-list.compact a { padding: 8px 12px; font-size: 12px; }

.proof-list { margin: 6px 0 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 4px; }
.proof-list a {
  display: inline-flex; align-items: baseline; gap: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  color: var(--text-dim, #cbd5e1);
  text-decoration: none;
}
.proof-list a:hover { color: var(--accent, #F5B041); }
.ext-ic { font-size: 10px; opacity: 0.6; }
</style>
