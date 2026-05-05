// Static blog posts. Drafted by hand, rendered via `marked` at read time.
//
// Posts with a `publishedAt` date in the future are hidden from the list
// view but still reachable by direct URL (so operators can preview drafts).

export type BlogPost = {
  slug: string
  title: string
  subtitle?: string
  publishedAt: string // ISO yyyy-mm-dd
  author: string
  // One-line description used on the list view and in <head> meta.
  summary: string
  // Optional thumbnail — rendered in the blog list card. 16:9 works best.
  previewImage?: string
  // Markdown body. Rendered via `marked`.
  body: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'why-this-exists',
    title: 'Why iota-registry exists',
    subtitle: 'Built for myself, then for the community. "Actual numbers" is the ethos.',
    publishedAt: '2026-05-03',
    author: 'Ralf Süss',
    summary:
      'Personal tool turned community infrastructure: the story behind iota-trade-scanner (now iota-registry) and the "actual numbers" ethos that drives it.',
    previewImage: '/images/its-network_1.png',
    body: `
I originally built this site for myself.

<!-- SCREENSHOT_SLIDER -->

Around the time IOTA Rebased went live on mainnet, I wanted to know simple things — how many Move packages are actually deployed? Which teams shipped vs. which are still vapor? How much of the on-chain noise is real activity, and how much is test deploys or phishing spray? None of the existing tools could answer those questions honestly. Foundation blog posts were celebratory by design. Partner-list sites were curated by incentive. Community dashboards were thin or already pivoted toward NFT-gating the numbers everyone had a right to see.

So I wrote a scanner. It pages every package on the L1 Move registry, clusters them by deployer, matches known teams, and publishes the result as plain data. Nothing is curated out. Unattributed deployers show up as unattributed. Phishing-spray rows stay visible, just flagged. When on-chain reality doesn't match a public claim, the registry shows the claim *and* the reality side by side — not to pick fights, just because that's the point.

The project started as \`iota-trade-scanner.net\`. This site — \`iota-registry.org\` — is the same backend reframed around the word the thing actually wants to be: a *registry*. A public list of every Move package on IOTA L1, every team that ships them, every announcement that hasn't landed on-chain yet, and what we can verify about each of them.

### What it is

- A complete, honest catalog of IOTA L1 Move activity.
- Teams with known deployers, attributed by fingerprint + deployer routing.
- Unattributed clusters surfaced with their watch-signals intact so anyone can help attribute them.
- Announced-but-not-yet-live projects tracked in their own tab with explicit tiers of evidence (Foundation-announced, company-announced, technical-mention) so readers can tell a press release from a website blurb.
- Network-level metrics and economics, sourced directly from IOTA mainnet RPC + GraphQL.

### What it isn't

- Curated. There's no editorial kingmaking. Every package that's on-chain shows up; every team with a matchable footprint gets a row.
- Monetized through gated numbers. On-chain facts are not a product to sell back to the community — they're public data, and the site treats them as such. If a commercial tier ever exists, it'll be *workflow tools on top of the data*, never the data itself.
- Hyped. The Announced tab tracks public claims and grades them against what we can actually see on-chain. Projects that go silent stay visible — accountability by default, no ghosting.

### The "actual numbers" rule

The internal principle is simple: show everything, including the unflattering parts. If a project announced a million-user pilot and the deployer has 14 wallets after a year, the registry shows 14 wallets. If a Foundation-blogged hackathon winner never makes it to mainnet, the Announced tab's lifecycle-decay will grey them out automatically after six months of silence, and the row stays visible as a record.

That's the posture. It costs some goodwill with teams whose claims don't hold up. It buys trust from the part of the audience — builders, journalists, enterprise evaluators — that actually cares about ground truth. I think that's a good trade.

### Community-first, maybe-commercial

The scanner's engine and match rules are open source ([GitHub](https://github.com/iota-registry)). The editorial data — project and team definitions — is checked in, reviewable as plain TypeScript. Anything commercial that eventually shows up will be additive (alerts, watchlists, analytics workflows), never subtractive (gating on-chain facts behind a paywall).

This site is a community gift first. If it one day pays the rent, great — but the north star is: the day someone in the IOTA ecosystem needs actual numbers, the answer should be free.

Thanks for being here. Click around. The Projects / Teams / Announced / Network / Economics tabs are all live, and the detail pages are where the interesting attribution stories live.

— Ralf
    `,
  },

  {
    slug: 'iota-mainnet-year-one',
    title: 'Happy Birthday, IOTA L1 Rebased.',
    subtitle: 'Year one, reviewed in numbers.',
    publishedAt: '2026-05-05',
    author: 'Ralf Süss',
    summary:
      'IOTA Rebased mainnet just turned one. Here is what shipped in year one, counted honestly — projects, teams, transactions, storage, and the pipeline of what was announced but hasn\'t landed yet.',
    previewImage: '/images/birthday.png',
    body: `
One year ago today, **IOTA Rebased** went live on mainnet — a clean-sheet Move L1 launched after years of architectural reinvention. The network has run continuously for a year, earning its first real on-chain history.

This site, \`iota-registry.org\`, is my birthday present to the community: a complete, honest, no-hype reading of what actually shipped on IOTA mainnet in year one.

<!-- INFOGRAPHICS -->

The numbers above are pulled live from the registry's mainnet scan — every Move package we can see, classified where we can, flagged as unattributed where we can't. No manual curation, no partner filter. The footer chip shows the current epoch; everything recomputes from the latest 2-hour ecosystem capture.

### What shipped vs. what was announced

The [Announced](/) tab is the accountability story. IOTA's first year produced dozens of publicly-announced projects — blog posts, hackathon winners, litepapers, partnership announcements. Here's the honest ledger of where those announcements landed:

- **Shipped to mainnet**: graduated out of Announced and into the Projects tab. Count, evidence, deployer addresses all visible.
- **Live on testnet**: observable footprint but not yet on mainnet. Small group so far; the public-testnet work is still early.
- **Shared-rail**: anchoring activity via TWIN verifiable_storage or IOTA Identity — confirmed live, but no dedicated deployer row ever surfaces. Contributes to network metrics rather than showing up as "their own thing."
- **Pre-live**: announced, no on-chain trace yet. Some will ship. Some already went silent; our 6-month lifecycle rule greys them out automatically.

Year one's signal-to-noise in announcements was real. The hackathon circuit (MasterZ, APAC Moveathon) produced dozens of demos; most haven't crossed mainnet yet. Foundation-promoted partnerships (Orobo, TWIN-anchored compliance projects) are still in pilot. One year in, IOTA L1 is more pipeline than stampede — and that's fine. Truthful pipelines ship.

### What matters most

A few things from the year-one data that stand out:

- **Real-World Applications** are the largest non-NFT category on mainnet. Product passports, compliance verification, trade anchoring, industrial traceability — the "IOTA = enterprise-grade real-world infrastructure" thesis is the *actually-happening* part, not the speculative part.
- **NFT collections** dominate raw deployment count (many small drops, low per-collection activity) but produce proportionally less network activity than the application layer. Numbers aren't a beauty contest — per-TX, infrastructure is the heavier lift.
- **Unattributed deployers** are down from the opening months as attribution sweeps landed, but there's still a long tail of tiny deployers (test contracts, personal experiments, one-module joke packages) that make the registry honest. Year one wasn't all serious projects, and it shouldn't pretend to be.
- **Storage fund** has grown steadily — that number is dollars of real-world capital locked on L1, returning to depositors when objects delete. It's the cleanest single indicator of non-speculative usage.

### Next year

What I'd like to see in year two: more mainnet graduations out of the Announced tab, a full testnet tracker (NPLEX and the APAC Moveathon cohort deserve their own scanner), and the first shared-rail project whose TWIN usage we can cite with an explorer link rather than a theory.

This registry will keep counting, quietly and completely. Happy birthday to the ecosystem.

— Ralf
    `,
  },
]

// List view: shows every post sorted date-desc. Future-dated posts render
// with an "Scheduled" chip so operators can preview drafts without losing
// the intended publish date on the metadata. Flip this back to a filter
// after the real public launch if we want to hide scheduled posts from
// the public list.
export function publishedBlogPosts(_now: Date = new Date()): BlogPost[] {
  return BLOG_POSTS
    .slice()
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

export function isScheduled(post: BlogPost, now: Date = new Date()): boolean {
  return post.publishedAt > now.toISOString().slice(0, 10)
}

export function findBlogPost(slug: string): BlogPost | null {
  return BLOG_POSTS.find(p => p.slug === slug) ?? null
}
