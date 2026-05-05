import type { AnnouncedEntry } from '../announced.interface'

export const vectramarket: AnnouncedEntry = {
  id: "vectramarket",
  name: "VectraMarket",
  tier: "technical",
  onchain: "none",
  category: "DeFi",
  subcategory: null,
  industries: [
    "Prediction markets",
    "Trading"
  ],
  officialUrl: "https://vectramarket.com/",
  socials: [
    {
      label: "X / @shortaktien (operator)",
      href: "https://x.com/shortaktien"
    }
  ],
  announcements: [
    {
      label: "Operator announcement — @shortaktien (Lord Alexander) on X",
      href: "https://x.com/shortaktien/status/2049564705593933831",
      date: "2026-04-29"
    }
  ],
  description: "Trading platform on IOTA testnet (initial testing phase, 2026-04-29) — surfaces a Market Maker (MM) role and feedback-driven phased rollout; community reply suggests betting / prediction-market mechanics. Same operator as My2Cents (Team ShortAktien on the mainnet ecosystem registry — see `api/src/ecosystem/teams/misc/shortaktien.ts`). vectramarket.com unreachable as of 2026-05-05; classification awaits site coming back up + an explorer-side testnet trace.",
  stack: [
    "Move"
  ],
  firstAnnounced: "2026-04-29",
  lastConfirmed: "2026-05-05",
  watchSignals: "Confirm testnet deployer + package once vectramarket.com is back; look for ‹vectra*› / ‹market*› / ‹mm*› modules on the Rebased testnet. No first-party X handle linked yet — surface @VectraMarket-style account if one appears."
}
