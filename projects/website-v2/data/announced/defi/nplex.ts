import type { AnnouncedEntry } from '../announced.interface'

export const nplex: AnnouncedEntry = {
  id: "nplex",
  name: "NPLEX",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "winner",
      date: "2026-04-17",
      note: "RWA & TradFi track cohort (2026-02-26); 2nd place at finale."
    }
  ],
  onchain: "none",
  category: "DeFi",
  subcategory: "Token",
  industries: [
    "EU NPL markets",
    "Structured credit",
    "Tokenized debt"
  ],
  officialUrl: "https://nplex.eu",
  socials: [],
  demoLinks: [
    {
      label: "GitHub — Sernior/hackatonIOTA-MC",
      href: "https://github.com/Sernior/hackatonIOTA-MC"
    },
    {
      label: "Move contracts docs",
      href: "https://sernior.github.io/hackatonIOTA-MC/"
    },
    {
      label: "Frontend docs",
      href: "https://sernior.github.io/hackatonIOTA-FE/"
    }
  ],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, RWA & TradFi track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    },
    {
      label: "MasterZ × IOTA Hackathon Finale (2nd place, top 5)",
      href: "https://blog.iota.org/masterz-hackathon-finale/",
      date: "2026-04-17"
    }
  ],
  description: "Tokenized NPL (Non-Performing Loan) trading platform — turns illiquid EU debt portfolios into on-chain semi-fungible tokens with revenue-waterfall smart contracts. Targets EU 2021/2167, MiCAR, DLT Pilot Regime. 2nd place in MasterZ × IOTA Hackathon (2026-04).",
  stack: [
    "Move",
    "Identity"
  ],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-04-17",
  watchSignals: "Mainnet deployer shipping ltc1* / nplex* / npl_* / waterfall* / loan* modules, or structs under ltc1:: / nplex::."
}
