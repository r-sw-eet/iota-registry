import type { AnnouncedEntry } from '../announced.interface'

export const sentinelai: AnnouncedEntry = {
  id: "sentinelai",
  name: "SentinelAI",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "participant",
      date: "2026-02-26",
      note: "AI track cohort; did not reach top 5 finale."
    }
  ],
  onchain: "none",
  category: "Misc",
  subcategory: "AI",
  officialUrl: "https://blog.iota.org/build-now-masterz-hackathon/",
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, AI track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    }
  ],
  description: "Decentralized AI content trust layer. MasterZ × IOTA Hackathon cohort participant.",
  stack: [],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-02-26"
}
