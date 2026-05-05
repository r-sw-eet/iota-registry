import type { AnnouncedEntry } from '../announced.interface'

export const orobo: AnnouncedEntry = {
  id: "orobo",
  name: "Orobo",
  tier: "if",
  stage: "company",
  onchain: "none",
  category: "Real World",
  subcategory: "Application",
  industries: [
    "EV batteries",
    "Textiles",
    "Construction",
    "Cacao",
    "Consumer goods",
    "Product passports"
  ],
  officialUrl: "https://orobo.tech",
  socials: [],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Orobo — Trusted Product Data\"",
      href: "https://blog.iota.org/orobo-trusted-product-data/",
      date: "2026-04-09"
    }
  ],
  description: "Singapore-based clearing house for Digital Product Passports (DPPs) — EV batteries, textiles, construction, cacao. EU Ecodesign / DPP mandate tailwind from 2026.",
  stack: [
    "Rebased",
    "Move",
    "Gas Station"
  ],
  firstAnnounced: "2026-04-09",
  lastConfirmed: "2026-04-23",
  watchSignals: "Modules: dpp* / orobo* / product_passport* / battery_passport* / manifest_anchor* / lifecycle_*; or Move structs under orobo:: / dpp::",
  sharedRailNote: "Alt mode: if they only hash-anchor through TWIN verifiable_storage + issue VCs via IOTA Identity, no dedicated deployer will surface — usage lifts TWIN + Identity counts instead."
}
