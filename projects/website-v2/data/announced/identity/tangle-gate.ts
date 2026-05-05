import type { AnnouncedEntry } from '../announced.interface'

export const tangleGate: AnnouncedEntry = {
  id: "tangle-gate",
  name: "Tangle Gate",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "winner",
      date: "2026-04-17",
      note: "Data Integrity & Privacy track cohort (2026-02-26, listed as \"TangleGate\", scope was \"Secure temporary access control via DID\"); 5th place at finale."
    }
  ],
  onchain: "none",
  category: "Identity",
  subcategory: "Credentials",
  industries: [
    "Critical infrastructure",
    "Identity-based access",
    "Audit trails"
  ],
  officialUrl: "https://blog.iota.org/masterz-hackathon-finale/",
  socials: [],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, Data Integrity & Privacy track, as \"TangleGate\")",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    },
    {
      label: "MasterZ × IOTA Hackathon Finale (5th place, top 5)",
      href: "https://blog.iota.org/masterz-hackathon-finale/",
      date: "2026-04-17"
    }
  ],
  description: "Securing access to critical infrastructure through tamper-proof audit trails and identity-based access controls. 5th place in MasterZ × IOTA Hackathon. Cohort name was \"TangleGate\" (single word).",
  stack: [
    "Move",
    "Identity"
  ],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-04-17",
  watchSignals: "Mainnet deployer shipping gate* / tangle_gate* / access_control* / audit_trail* modules, or Identity VCs for infra access."
}
