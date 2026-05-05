import type { AnnouncedEntry } from '../announced.interface'

export const omneon: AnnouncedEntry = {
  id: "omneon",
  name: "Omneon",
  tier: "if",
  hackathons: [
    {
      event: "IOTA APAC Moveathon",
      result: "winner",
      date: "2025-06",
      note: "DeF(A)i Track ($8,000)."
    }
  ],
  onchain: "none",
  category: "Misc",
  subcategory: null,
  officialUrl: "https://omneon.xyz/",
  socials: [],
  announcements: [
    {
      label: "APAC Moveathon Winners (DeF(A)i Track, $8k)",
      href: "https://blog.iota.org/apac-moveathon-winners/",
      date: "2025-06"
    }
  ],
  description: "DeFi-focused project — DeF(A)i Track winner at IOTA APAC Moveathon ($8,000). Full scope TBC from project site.",
  stack: [
    "Move",
    "EVM"
  ],
  firstAnnounced: "2025-06",
  lastConfirmed: "2025-06",
  watchSignals: "Mainnet deployer shipping omneon* modules."
}
