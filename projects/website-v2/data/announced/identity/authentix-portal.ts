import type { AnnouncedEntry } from '../announced.interface'

export const authentixPortal: AnnouncedEntry = {
  id: "authentix-portal",
  name: "Authentix Portal",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "participant",
      date: "2026-02-26",
      note: "Data Integrity & Privacy track cohort; did not reach top 5 finale."
    }
  ],
  onchain: "none",
  category: "Identity",
  subcategory: "Credentials",
  officialUrl: "https://blog.iota.org/build-now-masterz-hackathon/",
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, Data Integrity & Privacy track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    }
  ],
  description: "Seamless DID onboarding and authentication. MasterZ × IOTA Hackathon cohort participant.",
  stack: [],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-02-26"
}
