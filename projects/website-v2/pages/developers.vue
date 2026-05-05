<script setup lang="ts">
const sources = [
  { label: 'IOTA Explorer', desc: 'Official block explorer for IOTA Rebased mainnet — packages, objects, addresses, transactions.', href: 'https://explorer.iota.org/?network=mainnet' },
  { label: 'IOTA JSON-RPC', desc: 'Public mainnet JSON-RPC endpoint — system state, supply, validators.', href: 'https://api.mainnet.iota.cafe' },
  { label: 'IOTA GraphQL', desc: 'Public mainnet GraphQL endpoint — events, packages, epochs.', href: 'https://graphql.mainnet.iota.cafe' },
  { label: 'DefiLlama — IOTA', desc: 'TVL and protocol data for IOTA L1 + IOTA EVM chains.', href: 'https://defillama.com/chain/IOTA' },
  { label: 'IOTA on GitHub', desc: 'Source code for the IOTA node, SDKs, and ecosystem tools.', href: 'https://github.com/iotaledger' },
  { label: 'iota-trade-scanner source', desc: 'Full source, match rules, and team registry for this site.', href: 'https://github.com/suess-ralf/iota-trade-scanner' },
]

const registryEndpoints = [
  { method: 'GET', path: '/ecosystem', desc: 'All indexed projects (L1 + L2) with team, category, packages, metrics.' },
  { method: 'GET', path: '/ecosystem/project/:slug', desc: 'Full project record — modules, addresses, attribution, on-chain counts.' },
  { method: 'GET', path: '/ecosystem/project/:slug/events?limit=N', desc: 'Recent on-chain events emitted by the project\'s modules.' },
  { method: 'GET', path: '/ecosystem/project/:slug/activity', desc: 'Daily event counts, senders, cumulative events, TVL history, event-type distribution.' },
  { method: 'GET', path: '/ecosystem/teams/:id', desc: 'Team record with all owned projects.' },
  { method: 'GET', path: '/ecosystem/growth-ranking', desc: 'Per-project growth deltas across all tracked metrics.' },
  { method: 'GET', path: '/snapshots/latest', desc: 'Current epoch snapshot — supply, staking, storage fund, gas metrics.' },
  { method: 'GET', path: '/snapshots/epochs', desc: 'All historical epoch snapshots since mainnet genesis.' },
]

const snippets = [
  {
    label: 'Get network system state',
    desc: 'Total supply, staking, storage fund, validators, epoch — the main system overview.',
    command: `curl -s -X POST https://api.mainnet.iota.cafe \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"iotax_getLatestIotaSystemState","params":[]}'`,
  },
  {
    label: 'Get protocol config (storage pricing, gas, inflation)',
    desc: 'Storage pricing, validator_target_reward (daily inflation), gas model.',
    command: `curl -s -X POST https://api.mainnet.iota.cafe \\
  -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"iota_getProtocolConfig","params":[]}'`,
  },
  {
    label: 'Epoch gas burn + storage fund flow',
    desc: 'Gas fees burned, storage fund inflows/outflows, and transaction count for a specific epoch. Change the epoch ID to query different days.',
    command: `curl -s -X POST https://graphql.mainnet.iota.cafe \\
  -H 'Content-Type: application/json' \\
  -d '{"query":"{ epoch(id: 331) { epochId totalGasFees totalTransactions fundSize fundInflow fundOutflow netInflow } }"}'`,
  },
  {
    label: 'Discover all Move packages',
    desc: 'Paginate through all deployed packages. Each package has an address and a list of Move modules, written as package::module — used as the GraphQL `emittingModule` filter when querying events.',
    command: `curl -s -X POST https://graphql.mainnet.iota.cafe \\
  -H 'Content-Type: application/json' \\
  -d '{"query":"{ packages(first: 50) { nodes { address storageRebate modules { nodes { name } } } pageInfo { hasNextPage endCursor } } }"}'`,
  },
  {
    label: 'Count events for a specific module',
    desc: 'Example: query events emitted by a package::module. Replace the address/module with any package discovered above.',
    command: `curl -s -X POST https://graphql.mainnet.iota.cafe \\
  -H 'Content-Type: application/json' \\
  -d '{"query":"{ events(filter: { emittingModule: \\"0x6b41121305e1e63bcbdf43e8335d19038c13707818d7dabef65d3d35732a6ed4::stability_pool\\" }, first: 50) { nodes { timestamp type { repr } json sender { address } } pageInfo { hasNextPage endCursor } } }"}'`,
  },
  {
    label: 'DefiLlama TVL for all IOTA protocols',
    desc: 'Fetch all protocols and filter for IOTA/IOTA EVM chains. This is how L2 TVL populates.',
    command: `curl -s 'https://api.llama.fi/protocols' | \\
  python3 -c "import json,sys; [print(p['name'], p.get('chainTvls',{}).get('IOTA EVM', p.get('chainTvls',{}).get('IOTA', 0))) for p in json.load(sys.stdin) if any(c in p.get('chains',[]) for c in ['IOTA','IOTA EVM'])]"`,
  },
]

const copied = ref<number | null>(null)
async function copy(idx: number, text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = idx
    setTimeout(() => { if (copied.value === idx) copied.value = null }, 1800)
  } catch {
    // clipboard denied — ignore silently
  }
}
</script>

<template>
  <div class="dev-page">
    <h1>Developers</h1>
    <p class="lede">
      IOTA Registry is open infrastructure. Everything on this site is derived from public, permissionless sources —
      no API keys, no rate limits, no gated data. Use the registry API, query IOTA directly, or clone the
      full scanner source.
    </p>

    <div class="section">
      <h2>Registry API</h2>
      <p class="sub">Base URL: <code>https://iota-trade-scanner.net/api/v1</code></p>
      <table class="api-table">
        <tbody>
          <tr v-for="ep in registryEndpoints" :key="ep.path">
            <td class="method"><span :class="`m-${ep.method.toLowerCase()}`">{{ ep.method }}</span></td>
            <td class="path"><code>{{ ep.path }}</code></td>
            <td class="desc">{{ ep.desc }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>Upstream sources</h2>
      <p class="sub">Everything here is public and keyless. If a number on the site looks off, verify it against these directly.</p>
      <ul class="source-list">
        <li v-for="s in sources" :key="s.href">
          <a :href="s.href" target="_blank" rel="noopener">{{ s.label }} ↗</a>
          <span class="mute">{{ s.desc }}</span>
        </li>
      </ul>
    </div>

    <div class="section">
      <h2>Query IOTA directly</h2>
      <p class="sub">Copy-paste these to query mainnet from your terminal. No auth, no account.</p>
      <div class="snippets">
        <div v-for="(s, i) in snippets" :key="s.label" class="snippet">
          <div class="snippet-head">
            <div>
              <div class="snippet-title">{{ s.label }}</div>
              <div class="snippet-desc">{{ s.desc }}</div>
            </div>
            <button class="copy" @click="copy(i, s.command)" :class="{ ok: copied === i }">
              {{ copied === i ? '✓ copied' : 'copy' }}
            </button>
          </div>
          <pre><code>{{ s.command }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dev-page { padding-bottom: 60px; max-width: 980px; }
.dev-page h1 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 32px; font-weight: 600; margin: 0 0 8px;
  color: var(--text, #F1F5F9); letter-spacing: -0.01em;
}
.lede {
  color: var(--text-dim, #cbd5e1);
  font-size: 14px; line-height: 1.65;
  max-width: 76ch; margin: 0 0 28px;
}

.section { margin: 32px 0; }
.section h2 {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 18px; font-weight: 600;
  color: var(--text, #F1F5F9);
  margin: 0 0 6px;
}
.section .sub {
  color: var(--text-mute, #94a3b8); font-size: 13px; margin: 0 0 16px;
}
.section code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--accent, #F5B041);
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  padding: 2px 6px; border-radius: 4px;
}

.api-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  overflow: hidden;
}
.api-table td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border, #1C2740);
  vertical-align: top;
}
.api-table tr:last-child td { border-bottom: 0; }
.api-table td.method { width: 58px; }
.api-table td.method span {
  display: inline-block;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
  padding: 2px 6px; border-radius: 3px;
}
.api-table .m-get { background: rgba(34, 197, 94, 0.15); color: #86efac; }
.api-table td.path { width: 320px; white-space: nowrap; }
.api-table td.path code {
  background: transparent;
  border: 0;
  padding: 0;
  color: var(--text, #F1F5F9);
}
.api-table td.desc {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px; line-height: 1.5;
}

.source-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
.source-list li {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  padding: 10px 14px;
  display: flex;
  gap: 12px;
  align-items: baseline;
  flex-wrap: wrap;
}
.source-list a {
  color: var(--accent, #F5B041);
  text-decoration: none;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  flex: 0 0 auto;
}
.source-list a:hover { text-decoration: underline; }
.source-list .mute { color: var(--text-mute, #94a3b8); font-size: 13px; }

.snippets { display: flex; flex-direction: column; gap: 14px; }
.snippet {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 14px 16px;
}
.snippet-head {
  display: flex; gap: 16px; justify-content: space-between; align-items: flex-start;
  margin-bottom: 10px;
}
.snippet-title {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-weight: 600; font-size: 14px; color: var(--text, #F1F5F9);
}
.snippet-desc {
  color: var(--text-mute, #94a3b8); font-size: 12px; margin-top: 2px; line-height: 1.5;
}
.copy {
  flex: 0 0 auto;
  background: transparent;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.04em;
  padding: 4px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all .15s;
}
.copy:hover { color: var(--text, #F1F5F9); border-color: var(--border-strong, #2a3958); }
.copy.ok { color: #86efac; border-color: rgba(34, 197, 94, 0.4); background: rgba(34, 197, 94, 0.08); }
.snippet pre {
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 6px;
  padding: 12px 14px;
  overflow-x: auto;
  margin: 0;
}
.snippet pre code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  color: var(--text-dim, #cbd5e1);
  line-height: 1.55;
  white-space: pre;
  background: transparent;
  border: 0;
  padding: 0;
}
</style>
