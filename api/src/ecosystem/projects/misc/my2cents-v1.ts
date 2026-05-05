import { ProjectDefinition } from '../project.interface';

export const my2centsV1: ProjectDefinition = {
  name: 'My2Cents (v1)',
  layer: 'L1',
  category: 'Social',
  subcategory: 'SocialFi',
  description:
    'My2Cents v1 — original mainnet release of the decentralized social-media platform on IOTA Move. Single `twitter` module exposing posts, likes, retweets, subscriptions, username registration, and creator earnings withdrawal. Superseded by v2 (`twitter_v2`) on 2026-02-14 but the v1 package is still queryable on-chain.',
  urls: [
    { label: 'App', href: 'https://my2c.eu' },
    { label: 'Alt domain', href: 'https://my2cents.app' },
  ],
  teamId: 'shortaktien',
  match: {
    packageAddresses: [
      '0x54f706fc809e4a4b91ec02e6ff004176bd8c089516fbef2611f1891ad027ad3e',
    ],
  },
  countTypes: [
    'twitter::Tweet',
    'twitter::TweetLike',
    'twitter::Retweet',
    'twitter::Subscription',
    'twitter::UserProfile',
  ],
  attribution: `
Pinned by package address — the v1 mainnet package ID is hardcoded in the live \`my2c.eu\` JS bundle at \`/assets/index-*.js\` as the v1 \`counterPackageId\` (alongside the v2 ID \`0xbe387a…\`). Module is named \`twitter\` (despite the consumer brand being "My 2 Cents") and exposes \`create_tweet\` / \`like_tweet\` / \`retweet\` / \`subscribe\` / \`withdraw_earnings\` — a full social surface.

Split from v2 per the architecturally-disjoint version rule: different deployer keypair (\`0x74419d…\` vs \`0x78dffeb…\`), different module name (\`twitter\` vs \`twitter_v2\`), no cross-calls observed. Both versions live under \`teamId: 'shortaktien'\`.
`.trim(),
};
