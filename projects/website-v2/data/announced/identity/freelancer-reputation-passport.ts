import type { AnnouncedEntry } from '../announced.interface'

export const freelancerReputationPassport: AnnouncedEntry = {
  id: "freelancer-reputation-passport",
  name: "Freelancer Reputation Passport",
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
  description: "Verifiable freelance reputation. MasterZ × IOTA Hackathon cohort participant.",
  stack: [],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-02-26"
}
