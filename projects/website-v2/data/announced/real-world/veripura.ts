import type { AnnouncedEntry } from '../announced.interface'

export const veripura: AnnouncedEntry = {
  id: "veripura",
  name: "VeriPura",
  tier: "if",
  stage: "startup",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "participant",
      date: "2026-02-26",
      note: "Trade & Supply Chain track; did not place in 2026-04-17 finale."
    }
  ],
  onchain: "none",
  category: "Real World",
  subcategory: "Application",
  industries: [
    "Food import compliance",
    "Regulatory / pre-shipment"
  ],
  officialUrl: "https://veripura.com",
  socials: [
    {
      label: "X / @VeriPura",
      href: "https://nitter.net/VeriPura"
    }
  ],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (listed as participant, Trade & Supply Chain track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    },
    {
      label: "VeriPura Litepaper (Medium)",
      href: "https://medium.com/@info_73854/veripura-litepaper-9db4c91629e0",
      date: "2025-05",
      deleted: true,
      lastSeen: "2025-05"
    },
    {
      label: "Investor site — IOTA stack mentioned",
      href: "https://investors.veripura.com/",
      date: "2026-04-23"
    }
  ],
  description: "Pre-shipment food import compliance verification SaaS — FDA FSMA, EUDR, FSMA 204, EU 2017/625, TRACES NT, UK FRCR. Anchoring compliance verdicts + VCs for attestations. Seed-phase startup; MasterZ × IOTA Hackathon participant (Trade & Supply Chain track) — did not place in the 2026-04-17 finale.",
  stack: [
    "Rebased",
    "TWIN",
    "Identity"
  ],
  firstAnnounced: "2025-05",
  lastConfirmed: "2026-04-23",
  watchSignals: "Modules: veripura_* / phyto_cert* / compliance_verdict*; or VCs of type <…>::credentials::* with a veripura.com issuer URL.",
  sharedRailNote: "Anchors via TWIN verifiable_storage + mints VCs via IOTA Identity — no new deployer expected. Usage lifts TWIN + Identity TX/holder counts."
}
