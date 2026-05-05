// Hand-curated registry of publicly-announced IOTA projects.
//
// Four orthogonal dimensions so accountability reads clearly:
//
//   • TIER (provenance strength — who's backing the claim):
//       'if'         — IOTA Foundation–authored: blog.iota.org, iota.org
//                      showcase pages, @iota on X, Foundation cohort lists.
//       'company'    — project-authored formal announcement: litepaper,
//                      press release, their own blog, pinned X post.
//       'technical'  — only technical traces: IOTA mentioned on the project
//                      website, IOTA imports in a public GitHub repo, code
//                      references — no formal announcement.
//
//   • STAGE (organizational maturity — OPTIONAL):
//       'startup'    — seed-phase; may not even be formally founded.
//       'company'    — ongoing business entity with product or pilot.
//     Left undefined for hackathon teams whose legal structure is unknown.
//     Hackathon participation is NOT a stage — it's a separate event axis
//     (see `hackathons[]` below). A funded company can also enter a hackathon.
//
//   • HACKATHONS (event participation, orthogonal to stage):
//       hackathons[]  — zero or more entries with { event, result, date }.
//         result: 'winner' | 'participant'. Includes track winners and
//         community-favorite prizes as 'winner'; cohort-only or finalists
//         who didn't place as 'participant'.
//
//   • DEMO LINKS (presence drives a "Demo" badge):
//       demoLinks[]   — code repos, live demo URLs (Vercel/Netlify/etc.),
//         documentation sites. Distinct from `officialUrl` — if the only
//         URL we have IS a demo host (vercel.app etc.), the UI detects that
//         via `hasDemoBadge(entry)` and shows the badge without duplication.
//
//   • ONCHAIN (pre-live on-chain traces — what we can verify before the
//     project becomes a full Projects-tab entry):
//       'shared-rail' — confirmed live via TWIN verifiable_storage /
//                       IOTA Identity — no dedicated deployer expected,
//                       so it would never surface in the Projects tab.
//       'testnet'     — verifiable testnet footprint, not mainnet.
//       'none'        — nothing on-chain yet.
//
//     A project that ships on mainnet with its own deployer is a
//     "live" project — it moves to the Projects tab and leaves Announced
//     entirely. That's why there's no 'observed'/'shipped' value here.
//     The Announced tab is pre-live accounting + shared-rail exceptions.
//
//     HARD RULE: any non-`none` value REQUIRES at least one entry in
//     `onchainProof` — a citable IOTA Explorer / chain-browser URL for
//     the testnet package, object, tx digest, or shared-rail VC issuance
//     that backs the claim. A Vercel / Netlify demo frontend is *not*
//     proof. Project website copy mentioning IOTA is *not* proof.
//     Without a citable on-chain artifact, `onchain = 'none'` even if
//     the team claims deployment elsewhere. Accountability > optimism.
//
//   • LIFECYCLE (editorial health — computed, not stored):
//       'active'  — lastConfirmed within the last 6 months.
//       'stale'   — 6–12 months since lastConfirmed. Greyed out, kept visible.
//       'dead'    — more than 12 months since lastConfirmed.
//
//     The operator "refreshes" an entry by bumping its `lastConfirmed` date
//     (e.g. after adding a new announcement, verifying existing sources are
//     still live, or learning something that proves the project is active).
//     Entries that get no touches decay through the states automatically —
//     that's the accountability signal. No manual override: a `dead` entry
//     that genuinely comes back to life gets revived by the operator by
//     updating `lastConfirmed` on the next touch.
//
// An entry's TIER reflects the strongest source available. When a source
// disappears (e.g. litepaper taken down) the tier may drop — that's exactly
// the accountability signal this registry is for.

export type AnnouncedTier = 'if' | 'company' | 'technical'

export type AnnouncedStage = 'startup' | 'company'

export type AnnouncedOnchain = 'shared-rail' | 'testnet' | 'none'

export type AnnouncedLifecycle = 'active' | 'stale' | 'dead'

export type IotaStackPart = 'Rebased' | 'Move' | 'TWIN' | 'Identity' | 'Gas Station' | 'EVM'

export type AnnouncedLink = { label: string; href: string }

export type HackathonResult = 'winner' | 'participant'

export type HackathonEntry = {
  event: string
  result: HackathonResult
  date?: string
  note?: string
}

// Announcement artifacts get optional deleted/lastSeen for when a source
// goes 404 / 410 but we want to preserve the record for accountability.
export type AnnouncedRelease = {
  label: string
  href: string
  date?: string
  deleted?: boolean
  lastSeen?: string
}

export type AnnouncedEntry = {
  id: string
  name: string
  tier: AnnouncedTier
  stage?: AnnouncedStage
  hackathons?: HackathonEntry[]
  onchain: AnnouncedOnchain
  onchainProof?: AnnouncedLink[]
  category: string
  subcategory?: string | null
  industries?: string[]
  officialUrl: string
  socials?: AnnouncedLink[]
  demoLinks?: AnnouncedLink[]
  announcements: AnnouncedRelease[]
  description: string
  stack: IotaStackPart[]
  firstAnnounced: string
  lastConfirmed: string
  watchSignals?: string
  sharedRailNote?: string
}

// Display order — strongest-backed claims first (tier), then by
// organizational maturity (stage), then by on-chain observability, then
// alphabetical within buckets. Lifecycle is handled via row dimming, not
// in sort order (we still want retired entries visible in their bucket).
const TIER_RANK: Record<AnnouncedTier, number> = {
  if: 0,
  company: 1,
  technical: 2,
}

const STAGE_RANK: Record<AnnouncedStage, number> = {
  company: 0,
  startup: 1,
}

// Undefined stage (hackathon-only, unknown maturity) sorts after defined stages.
const UNKNOWN_STAGE_RANK = 2

// Hackathon-sort: winners rank above participants when stage is undefined,
// so finalists/placers float up inside the "unknown-stage" bucket.
const HACKATHON_WINNER_BONUS = -1
function hackathonRank(entry: AnnouncedEntry): number {
  if (!entry.hackathons || entry.hackathons.length === 0) return 0
  return entry.hackathons.some((h) => h.result === 'winner') ? HACKATHON_WINNER_BONUS : 0
}

const ONCHAIN_RANK: Record<AnnouncedOnchain, number> = {
  'shared-rail': 0,
  testnet: 1,
  none: 2,
}

export function compareAnnounced(a: AnnouncedEntry, b: AnnouncedEntry): number {
  if (TIER_RANK[a.tier] !== TIER_RANK[b.tier]) return TIER_RANK[a.tier] - TIER_RANK[b.tier]
  const aStage = a.stage ? STAGE_RANK[a.stage] : UNKNOWN_STAGE_RANK + hackathonRank(a)
  const bStage = b.stage ? STAGE_RANK[b.stage] : UNKNOWN_STAGE_RANK + hackathonRank(b)
  if (aStage !== bStage) return aStage - bStage
  if (ONCHAIN_RANK[a.onchain] !== ONCHAIN_RANK[b.onchain]) return ONCHAIN_RANK[a.onchain] - ONCHAIN_RANK[b.onchain]
  return a.name.localeCompare(b.name)
}

// UI helper — the "Demo" badge fires when we have explicit demoLinks OR
// when the officialUrl itself points to a known demo-hosting domain (so a
// Vercel/Netlify-only project doesn't need duplicated links to light the chip).
const DEMO_HOSTS = [
  'vercel.app',
  'vercel.dev',
  'netlify.app',
  'netlify.com',
  'pages.dev',
  'github.io',
  'surge.sh',
]
export function hasDemoBadge(entry: AnnouncedEntry): boolean {
  if (entry.demoLinks && entry.demoLinks.length > 0) return true
  try {
    const host = new URL(entry.officialUrl).hostname.toLowerCase()
    return DEMO_HOSTS.some((h) => host === h || host.endsWith('.' + h))
  } catch {
    return false
  }
}

export function hackathonLabel(h: HackathonEntry): string {
  return h.result === 'winner' ? `Hackathon winner — ${h.event}` : `Hackathon participant — ${h.event}`
}

// Lifecycle thresholds — active < 6 months, stale 6–12 months, dead > 12.
// Partial date strings like "2025-06" parse as "2025-06-01" (start of month),
// which is the safe-conservative interpretation.
const STALE_DAYS = 183
const DEAD_DAYS = 366
const MS_PER_DAY = 86_400_000

export function computeLifecycle(lastConfirmed: string, now: Date = new Date()): AnnouncedLifecycle {
  const ts = new Date(lastConfirmed).getTime()
  if (Number.isNaN(ts)) return 'active'
  const days = (now.getTime() - ts) / MS_PER_DAY
  if (days >= DEAD_DAYS) return 'dead'
  if (days >= STALE_DAYS) return 'stale'
  return 'active'
}

export function isRetired(l: AnnouncedLifecycle): boolean {
  return l === 'stale' || l === 'dead'
}

export const TIER_LABEL: Record<AnnouncedTier, string> = {
  if: 'IF',
  company: 'Company',
  technical: 'Technical',
}

export const ONCHAIN_LABEL: Record<AnnouncedOnchain, string> = {
  'shared-rail': 'Shared rail',
  testnet: 'Testnet',
  none: 'Unobserved',
}

export const STAGE_LABEL: Record<AnnouncedStage, string> = {
  company: 'Company',
  startup: 'Startup',
}
