import type { AnnouncedEntry } from '../announced.interface'

export const figo: AnnouncedEntry = {
  id: "figo",
  name: "Figo",
  tier: "if",
  hackathons: [
    {
      event: "IOTA APAC Moveathon",
      result: "winner",
      date: "2025-06",
      note: "2nd place + Payments/Consumer Track ($33,000)."
    }
  ],
  onchain: "none",
  category: "NFT",
  subcategory: "Collection",
  industries: [
    "Consumer collectibles",
    "NFC-linked assets",
    "Phygital / dynamic NFTs"
  ],
  officialUrl: "https://figo-r1.vercel.app/",
  socials: [],
  announcements: [
    {
      label: "APAC Moveathon Winners (2nd place + Payments/Consumer Track, $33k)",
      href: "https://blog.iota.org/apac-moveathon-winners/",
      date: "2025-06"
    }
  ],
  description: "Merges physical collectible figures with digital assets via NFC-tagged items and Dynamic NFTs. 2nd place in IOTA APAC Moveathon + Payments & Consumer Track winner.",
  stack: [
    "Move",
    "EVM"
  ],
  firstAnnounced: "2025-06",
  lastConfirmed: "2025-06",
  watchSignals: "Mainnet deployer shipping figo* / nfc_tag* / dynamic_nft* / phygital* modules."
}
