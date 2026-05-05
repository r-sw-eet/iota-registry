import { ProjectDefinition } from '../project.interface';

export const my2centsV2: ProjectDefinition = {
  name: 'My2Cents',
  layer: 'L1',
  category: 'Social',
  subcategory: 'SocialFi',
  description:
    'My2Cents — decentralized social media on IOTA mainnet ("Beta 0.2.0 Mainnet, Powered by IOTA & MOVE"). Tweets, likes, retweets, subscriptions, donations, polls. Likes send IOTA directly to the creator; platform fee is split with the creator (and partly with re-sharers). Media stored on IPFS via web3.storage. Backend ported from lowdb to PostgreSQL in 0.1.1.0; smart contract bumped to v2 in 0.2.0.',
  urls: [
    { label: 'App', href: 'https://my2c.eu' },
    { label: 'Alt domain', href: 'https://my2cents.app' },
  ],
  teamId: 'shortaktien',
  match: {
    packageAddresses: [
      '0xbe387a1fdc6aa217a226bf25d66c158b51a1e84e0db06488260d1bbfd6860038',
    ],
  },
  countTypes: [
    'twitter_v2::Tweet',
    'twitter_v2::TweetLike',
    'twitter_v2::Retweet',
    'twitter_v2::Subscription',
    'twitter_v2::UserProfile',
  ],
  attribution: `
Pinned by package address — the v2 mainnet package ID is hardcoded in the live \`my2c.eu\` JS bundle at \`/assets/index-*.js\` as one of the active v2 constants (\`L="v2"\` branch). Module is named \`twitter_v2\` (single module on the package). Published 2026-02-14 from deployer \`0x78dffeb19c7f5d0be20f6622cbf7555c0c3945042c6922a7a7939188415e2260\`, distinct from v1's deployer.

The \`countTypes\` list mirrors v1's struct shape and is pre-declared so Items / Holders accounting picks up the v2 surface as soon as users mint Tweet / Subscription / etc. objects against the v2 package — the structs aren't in the latest snapshot's \`objectTypeCounts\` yet (only v1 has been probed deeply), but classify-time matching is purely structural so they'll surface automatically once minted.
`.trim(),
};
