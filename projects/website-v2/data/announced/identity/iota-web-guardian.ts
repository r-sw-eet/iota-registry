import type { AnnouncedEntry } from '../announced.interface'

export const iotaWebGuardian: AnnouncedEntry = {
  id: "iota-web-guardian",
  name: "IOTA Web Guardian",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "winner",
      date: "2026-04-17",
      note: "AI track cohort (2026-02-26); 3rd place at finale."
    }
  ],
  onchain: "none",
  category: "Identity",
  subcategory: "Credentials",
  industries: [
    "Creator economy",
    "AI content licensing"
  ],
  officialUrl: "https://blog.iota.org/masterz-hackathon-finale/",
  socials: [],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, AI track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    },
    {
      label: "MasterZ × IOTA Hackathon Finale (3rd place, top 5)",
      href: "https://blog.iota.org/masterz-hackathon-finale/",
      date: "2026-04-17"
    }
  ],
  description: "Protecting creators in the age of AI — requires AI systems to authenticate and compensate for content access. 3rd place in MasterZ × IOTA Hackathon.",
  stack: [
    "Move",
    "Identity"
  ],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-04-17",
  watchSignals: "Mainnet deployer shipping guardian* / ai_access* / content_license* modules, or Identity VCs for AI-access attestations."
}
