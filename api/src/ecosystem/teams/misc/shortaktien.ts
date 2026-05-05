import { Team } from '../team.interface';

export const shortaktien: Team = {
  id: 'shortaktien',
  name: 'ShortAktien',
  description:
    'IOTA-native developer building consumer dApps under the @shortaktien (Lord Alexander) banner. Currently shipping a decentralized social-media platform on mainnet (My2Cents) and a market-making / prediction-market platform on testnet (VectraMarket).',
  urls: [
    { label: 'X / @shortaktien', href: 'https://x.com/shortaktien' },
    { label: 'Personal site (unreachable as of 2026-05-05)', href: 'https://shortaktien.de' },
    { label: 'My2Cents (mainnet app)', href: 'https://my2c.eu' },
    { label: 'My2Cents (alt domain)', href: 'https://my2cents.app' },
    { label: 'VectraMarket (testnet)', href: 'https://vectramarket.com' },
  ],
  deployers: [
    // My2Cents v1 — mainnet `twitter` module package + same keypair on testnet
    { address: '0x74419d1ef99cf48e89d0ebc94af562a23a014157c66f6d2758499eeaff8b6100', network: 'mainnet' },
    { address: '0x74419d1ef99cf48e89d0ebc94af562a23a014157c66f6d2758499eeaff8b6100', network: 'testnet' },
    // My2Cents v2 — mainnet `twitter_v2` module package, distinct keypair
    { address: '0x78dffeb19c7f5d0be20f6622cbf7555c0c3945042c6922a7a7939188415e2260', network: 'mainnet' },
  ],
  attribution: `
Team identified via two flagship products that share a public face (@shortaktien, "Lord Alexander") and a documented IOTA-Move stack:

1. **My2Cents** — decentralized social media on IOTA mainnet ("Powered by IOTA & MOVE", "Beta 0.2.0 Mainnet" per \`my2c.eu\`). The on-chain footprint is two packages:
   - v1: \`0x54f706fc809e4a4b91ec02e6ff004176bd8c089516fbef2611f1891ad027ad3e\` — single \`twitter\` module — deployer \`0x74419d1ef99cf48e89d0ebc94af562a23a014157c66f6d2758499eeaff8b6100\`, published 2025-09-30. Same keypair also published the testnet sibling at \`0x24535b310549d8c0646c3fb3ba3ee49d4d23e3be9dbae364ac88b2d217f04a36\` on 2025-04-13. Module exposes entry functions \`create_tweet\`, \`like_tweet\`, \`retweet\`, \`set_username\`, \`subscribe\`, \`unlike_tweet\`, \`unsubscribe\`, \`withdraw_earnings\` and structs \`Tweet\`, \`TweetLike\`, \`Retweet\`, \`Subscription\`, \`UserProfile\`, \`TwitterPlatform\` — i.e. a full posts/likes/retweets/subscribe/withdraw social surface, despite the marketing name "Jars of Cents" and "tweets."
   - v2: \`0xbe387a1fdc6aa217a226bf25d66c158b51a1e84e0db06488260d1bbfd6860038\` — single \`twitter_v2\` module — deployer \`0x78dffeb19c7f5d0be20f6622cbf7555c0c3945042c6922a7a7939188415e2260\`, published 2026-02-14. Distinct keypair from v1 — matches the \`v2\` rollout described in the in-app changelog ("0.2.0: Smart contract improvements with v2 rollout"). Both v1 and v2 addresses are referenced from the live \`my2c.eu\` JS bundle (\`/assets/index-*.js\`) under \`counterPackageId\` for mainnet and adjacent v1/v2 constants — irrefutable runtime mapping from app to packages.

2. **VectraMarket** — testnet trading platform announced 2026-04-29 by @shortaktien on X ("VectraMarket is now live in its initial testing phase. The platform runs on the IOTA testnet."). Live at \`vectramarket.com\` (down at the time of registry entry). Treated as testnet-pre-mainnet via the announced-projects registry; on-chain testnet artifacts not yet observed.

Triangulation:
- [x] @shortaktien is the public voice for VectraMarket's launch (X tweet 2026-04-29).
- [x] My2Cents app frontend hardcodes both v1 and v2 mainnet package IDs — no ambiguity that those packages are My2Cents.
- [x] Mainnet v1 deployer + testnet deployer are the same keypair — same team across networks.
- [x] @shortaktien's X bio publicly self-identifies as "IOTA Community Developer" and explicitly links \`my2c.eu\` ("My2Cents: https://my2c.eu") — first-party, citable link from the X handle to the My2Cents brand. VectraMarket attribution to the same operator follows from the operator publishing both announcements from the same X account; user-confirmed on 2026-05-05.
`.trim(),
};
