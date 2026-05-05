import type { AnnouncedEntry } from '../announced.interface'

export const docunotary: AnnouncedEntry = {
  id: "docunotary",
  name: "DocuNotary",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "winner",
      date: "2026-04-17",
      note: "Trade & Supply Chain track cohort (2026-02-26, originally \"Invoice certification on IOTA\"); 4th place at finale with broadened \"business document notarization\" scope."
    }
  ],
  onchain: "none",
  category: "Identity",
  subcategory: "Credentials",
  industries: [
    "Business documents",
    "Notarization",
    "Fraud prevention"
  ],
  officialUrl: "https://blog.iota.org/masterz-hackathon-finale/",
  socials: [],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, Trade & Supply Chain track, as invoice certification focus)",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    },
    {
      label: "MasterZ × IOTA Hackathon Finale (4th place, top 5)",
      href: "https://blog.iota.org/masterz-hackathon-finale/",
      date: "2026-04-17"
    }
  ],
  description: "Blockchain-based document notarization enabling instant verification and reducing fraud risks for business documents. 4th place in MasterZ × IOTA Hackathon. Scope broadened from invoice certification (cohort stage) to general business documents (finale).",
  stack: [
    "Move",
    "Identity"
  ],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-04-17",
  watchSignals: "Mainnet deployer shipping notary* / docunotary* / document_hash* modules."
}
