import type { AnnouncedEntry } from '../announced.interface'

export const textileTracer: AnnouncedEntry = {
  id: "textile-tracer",
  name: "Textile Tracer",
  tier: "if",
  hackathons: [
    {
      event: "MasterZ × IOTA Hackathon",
      result: "winner",
      date: "2026-04-17",
      note: "Trade & Supply Chain track cohort (2026-02-26, listed as \"T-shirt Tracer\"); 1st place at finale."
    }
  ],
  onchain: "none",
  category: "Real World",
  subcategory: "Application",
  industries: [
    "Textiles",
    "Supply chain",
    "Sustainability",
    "Product passports"
  ],
  officialUrl: "https://blog.iota.org/masterz-hackathon-finale/",
  socials: [],
  announcements: [
    {
      label: "IOTA Foundation blog: \"Build Now — MasterZ Hackathon\" (cohort, Trade & Supply Chain track, as \"T-shirt Tracer\")",
      href: "https://blog.iota.org/build-now-masterz-hackathon/",
      date: "2026-02-26"
    },
    {
      label: "MasterZ × IOTA Hackathon Finale (1st place, top 5)",
      href: "https://blog.iota.org/masterz-hackathon-finale/",
      date: "2026-04-17"
    }
  ],
  description: "Fully verifiable tracing from factory to closet to recycling — digital product passports for textiles addressing EU sustainability mandates. 1st place in MasterZ × IOTA Hackathon. Cohort name was \"T-shirt Tracer\"; renamed before finale.",
  stack: [
    "Move"
  ],
  firstAnnounced: "2026-02-26",
  lastConfirmed: "2026-04-17",
  watchSignals: "Mainnet deployer shipping textile* / tracer* / garment* / passport* modules."
}
