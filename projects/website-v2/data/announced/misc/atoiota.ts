import type { AnnouncedEntry } from '../announced.interface'

export const atoiota: AnnouncedEntry = {
  id: "atoiota",
  name: "AToIoTA",
  tier: "if",
  hackathons: [
    {
      event: "IOTA APAC Moveathon",
      result: "winner",
      date: "2025-06",
      note: "3rd place ($15,000)."
    }
  ],
  onchain: "none",
  category: "Misc",
  subcategory: null,
  industries: [
    "AI-assisted trading",
    "Whale tracking",
    "Portfolio analytics"
  ],
  officialUrl: "https://atoiota.xyz/",
  socials: [],
  announcements: [
    {
      label: "APAC Moveathon Winners (3rd place, $15k)",
      href: "https://blog.iota.org/apac-moveathon-winners/",
      date: "2025-06"
    }
  ],
  description: "AI-driven DeFi portfolio management platform — intelligent optimization, whale tracking, and natural-language financial insights. 3rd place in IOTA APAC Moveathon.",
  stack: [
    "Move",
    "EVM"
  ],
  firstAnnounced: "2025-06",
  lastConfirmed: "2025-06",
  watchSignals: "Mainnet deployer shipping atoiota* / portfolio* / whale_watch* modules; or EVM contracts on iota.xyz domain indexing whale addresses."
}
