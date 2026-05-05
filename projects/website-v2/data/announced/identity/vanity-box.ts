import type { AnnouncedEntry } from '../announced.interface'

export const vanityBox: AnnouncedEntry = {
  id: "vanity-box",
  name: "Vanity.box",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "participant",
      date: "2026-02-26",
      note: "Reputation track cohort; did not reach top 5 finale."
    }
  ],
  onchain: "none",
  category: "Identity",
  subcategory: "Reputation",
  officialUrl: "https://blog.iota.org/build-now-masterz-hackathon/",
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, Reputation track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    }
  ],
  description: "Unified self-sovereign identity layer. MasterZ × IOTA Hackathon cohort participant.",
  stack: [],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-02-26"
}
