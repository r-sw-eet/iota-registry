import type { AnnouncedEntry } from '../announced.interface'

export const zephyr: AnnouncedEntry = {
  id: "zephyr",
  name: "Zephyr",
  tier: "if",
  hackathons: [
    {
      event: "IOTA APAC Moveathon",
      result: "winner",
      date: "2025-06",
      note: "Community Favorite."
    }
  ],
  onchain: "none",
  category: "DeFi",
  subcategory: "Payments",
  industries: [
    "E-commerce",
    "Consumer payments",
    "Web3 gateway"
  ],
  officialUrl: "https://zeyphr.netlify.app/",
  socials: [],
  announcements: [
    {
      label: "APAC Moveathon Winners (Community Favorite)",
      href: "https://blog.iota.org/apac-moveathon-winners/",
      date: "2025-06"
    }
  ],
  description: "Web3 e-commerce gateway on IOTA EVM — streamlines blockchain use for everyday transactions. Community Favorite at IOTA APAC Moveathon.",
  stack: [
    "EVM"
  ],
  firstAnnounced: "2025-06",
  lastConfirmed: "2025-06",
  watchSignals: "IOTA EVM contracts on zephyr/zeyphr.* domain; any payment-gateway pattern."
}
