import type { AnnouncedEntry } from '../announced.interface'

export const deadMansSwitch: AnnouncedEntry = {
  id: "dead-mans-switch",
  name: "Dead Man’s Switch",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "participant",
      date: "2026-02-26",
      note: "Infrastructure track cohort; did not reach top 5 finale."
    }
  ],
  onchain: "none",
  category: "Infrastructure",
  subcategory: "Framework",
  officialUrl: "https://blog.iota.org/build-now-masterz-hackathon/",
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, Infrastructure track)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    }
  ],
  description: "Automated digital asset contingency system. MasterZ × IOTA Hackathon cohort participant.",
  stack: [],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-02-26"
}
