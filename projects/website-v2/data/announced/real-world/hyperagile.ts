import type { AnnouncedEntry } from '../announced.interface'

export const hyperagile: AnnouncedEntry = {
  id: "hyperagile",
  name: "HyperAgile",
  tier: "if",
  hackathons: [
    {
      event: "IOTA APAC Moveathon",
      result: "winner",
      date: "2025-06",
      note: "1st place ($35,000)."
    }
  ],
  onchain: "none",
  category: "Real World",
  subcategory: "Framework",
  industries: [
    "Warehouse robotics",
    "Supply chain automation",
    "Industrial middleware"
  ],
  officialUrl: "https://hyperagile-on-iota.vercel.app/",
  socials: [],
  announcements: [
    {
      label: "APAC Moveathon Winners (1st place, $35k)",
      href: "https://blog.iota.org/apac-moveathon-winners/",
      date: "2025-06"
    }
  ],
  description: "Middleware-as-a-Service platform bridging industrial robotic automation in warehouses with IOTA. 1st place in IOTA APAC Moveathon ($35,000).",
  stack: [
    "Move",
    "EVM"
  ],
  firstAnnounced: "2025-06",
  lastConfirmed: "2025-06",
  watchSignals: "Mainnet deployer shipping hyperagile* / warehouse* / robot_ctl* modules, or Kiosk integrations for industrial assets."
}
