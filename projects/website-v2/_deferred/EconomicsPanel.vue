<script setup lang="ts">
import { computed, markRaw, ref } from 'vue'
import { Line } from 'vue-chartjs'
import { lineOptions, chartPalette } from '~/utils/chartTheme'
import { fmtIota, fmtNum } from '~/utils/format'
import type { ChartOptions } from 'chart.js'

interface RollingWindow {
  epochs: number
  avgGasBurned: number
  avgStorageNetInflow: number
  avgStorageFeesIn: number
  avgStorageRebatesOut: number
  avgTransactions: number
  avgStakeRewards: number
}

interface Aggregates {
  asOf: { epoch: number; capturedAt: string }
  current: {
    epoch: number
    totalSupply: number
    circulatingSupply: number
    totalStaked: number
    storageFundTotal: number
    referenceGasPrice: number
    storagePrice: number
    epochGasBurned: number
    epochTransactions: number
    epochStorageFeesIn: number
    epochStorageRebatesOut: number
    epochStakeRewards: number
    epochNonRefundableBalance: number
  }
  cumulative: {
    gasBurned: number
    storageFeesIn: number
    storageRebatesOut: number
    storageNetLocked: number
    stakeRewards: number
    transactions: number
  }
  rolling: { last7d: RollingWindow; last30d: RollingWindow }
}

const { $api } = useApi()
const { data: agg } = await useAsyncData<Aggregates | null>(
  'snapshots-aggregates',
  () => $api<Aggregates | null>('/snapshots/aggregates'),
)

// Calibration source: 7-day rolling average. Reflects current ecosystem
// behaviour (tx mix, gas usage) rather than the lifetime average, which is
// distorted by early-launch volume that's ~4× today's per-tx burn.
const baseline = computed(() => {
  if (!agg.value || agg.value.rolling.last7d.epochs === 0) return null
  const r = agg.value.rolling.last7d
  return {
    txPerDay: r.avgTransactions,
    compCostPerTx: r.avgTransactions > 0 ? r.avgGasBurned / r.avgTransactions : 0,
    storageCostPerTx: r.avgTransactions > 0 ? r.avgStorageFeesIn / r.avgTransactions : 0,
    mintPerDay: r.avgStakeRewards,
  }
})

// Historical "what fraction of storage fees stayed locked" — the cumulative
// equivalent of the user's permanent-lock slider, for default calibration.
const historicalLockPct = computed(() => {
  if (!agg.value) return 20
  const c = agg.value.cumulative
  if (c.storageFeesIn === 0) return 20
  return Math.round((c.storageNetLocked / c.storageFeesIn) * 100)
})

const DEFAULTS = {
  txMultExp: 0,
  compMult: 100,
  storMult: 100,
  refGasPrice: 1000,
  nonRefRate: 0,
  horizonYears: 10,
}

const mode = ref<'simple' | 'advanced'>('simple')
const txMultExp = ref(DEFAULTS.txMultExp)
const compMult = ref(DEFAULTS.compMult)
const storMult = ref(DEFAULTS.storMult)
const permLockPct = ref(historicalLockPct.value)
const refGasPrice = ref(DEFAULTS.refGasPrice)
const nonRefRate = ref(DEFAULTS.nonRefRate)
const horizonYears = ref(DEFAULTS.horizonYears)

// Slider 0–100 → 1×–10000× exponential. Steps land on round powers of 10
// at 25/50/75/100 so the labels under the slider tell a clean story.
const txMultiplier = computed(() => Math.pow(10, txMultExp.value / 25))
const compMultiplier = computed(() => compMult.value / 100)
const storMultiplier = computed(() => storMult.value / 100)

const projection = computed(() => {
  if (!baseline.value || !agg.value) return null
  const cur = agg.value.current
  const b = baseline.value

  // Effective per-tx costs scale with the user's multipliers AND with the
  // protocol gas-price knob (relative to the live 1000 NANOS).
  const refScale = refGasPrice.value / DEFAULTS.refGasPrice

  const dailyTxs = b.txPerDay * txMultiplier.value
  const dailyCompBurn = dailyTxs * b.compCostPerTx * compMultiplier.value * refScale
  const dailyStoragePaid = dailyTxs * b.storageCostPerTx * storMultiplier.value * refScale

  const dailyPermLocked = dailyStoragePaid * (permLockPct.value / 100)
  const dailyEphemeral = dailyStoragePaid - dailyPermLocked
  const dailyNonRefBurn = dailyEphemeral * (nonRefRate.value / 100)
  const dailyTotalBurn = dailyCompBurn + dailyNonRefBurn
  const dailyMint = b.mintPerDay
  const dailyNetSupplyChange = dailyMint - dailyTotalBurn
  const dailyNetCirculatingChange = dailyNetSupplyChange - dailyPermLocked

  const days = horizonYears.value * 365
  const finalSupply = cur.totalSupply + dailyNetSupplyChange * days
  const finalCirculating = cur.circulatingSupply + dailyNetCirculatingChange * days
  const finalLocked = cur.storageFundTotal + dailyPermLocked * days

  const totalDeflPct = ((cur.totalSupply - finalSupply) / cur.totalSupply) * 100
  const circDeflPct = ((cur.circulatingSupply - finalCirculating) / cur.circulatingSupply) * 100

  return {
    dailyTxs,
    dailyMint,
    dailyCompBurn,
    dailyNonRefBurn,
    dailyTotalBurn,
    dailyStoragePaid,
    dailyPermLocked,
    dailyNetSupplyChange,
    dailyNetCirculatingChange,
    finalSupply,
    finalCirculating,
    finalLocked,
    totalDeflPct,
    circDeflPct,
    isDeflationarySupply: dailyTotalBurn > dailyMint,
  }
})

// Simple view: single total-supply line. No legend, no second series.
const simpleChart = computed(() => {
  if (!projection.value || !agg.value) return { labels: [], datasets: [] }
  const cur = agg.value.current
  const p = projection.value
  const labels: string[] = []
  const data: number[] = []
  for (let y = 0; y <= horizonYears.value; y++) {
    const d = y * 365
    labels.push(y === 0 ? 'today' : `+${y}y`)
    data.push(cur.totalSupply + p.dailyNetSupplyChange * d)
  }
  const isDefl = p.dailyNetSupplyChange < 0
  const stroke = isDefl ? chartPalette.green : chartPalette.accent
  const fillRgba = isDefl ? 'rgba(34, 197, 94, 0.12)' : 'rgba(245, 176, 65, 0.12)'
  return {
    labels,
    datasets: [
      {
        label: 'Total supply',
        data,
        borderColor: stroke,
        backgroundColor: fillRgba,
        fill: true,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }
})

const supplyChart = computed(() => {
  if (!projection.value || !agg.value) return { labels: [], datasets: [] }
  const cur = agg.value.current
  const p = projection.value
  const labels: string[] = []
  const totalLine: number[] = []
  const circLine: number[] = []
  for (let y = 0; y <= horizonYears.value; y++) {
    const d = y * 365
    labels.push(y === 0 ? 'today' : `+${y}y`)
    totalLine.push(cur.totalSupply + p.dailyNetSupplyChange * d)
    circLine.push(cur.circulatingSupply + p.dailyNetCirculatingChange * d)
  }
  return {
    labels,
    datasets: [
      {
        label: 'Total supply',
        data: totalLine,
        borderColor: chartPalette.accent,
        backgroundColor: 'rgba(245, 176, 65, 0.10)',
        fill: false,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2,
      },
      {
        label: 'Circulating',
        data: circLine,
        borderColor: chartPalette.green,
        backgroundColor: 'rgba(34, 197, 94, 0.10)',
        fill: false,
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  }
})

// "Where does the deflationary pressure come from?" — three stacked bands
// summing the cumulative IOTA pulled out of circulating supply by year y.
// Computation burn (true supply destruction) and non-refundable storage burn
// stack with permanently-locked storage (out of circulation but technically
// in the storage fund).
const sourcesChart = computed(() => {
  if (!projection.value) return { labels: [], datasets: [] }
  const p = projection.value
  const labels: string[] = []
  const compLine: number[] = []
  const nonrefLine: number[] = []
  const lockedLine: number[] = []
  for (let y = 0; y <= horizonYears.value; y++) {
    const d = y * 365
    labels.push(y === 0 ? 'today' : `+${y}y`)
    compLine.push(p.dailyCompBurn * d)
    nonrefLine.push(p.dailyNonRefBurn * d)
    lockedLine.push(p.dailyPermLocked * d)
  }
  return {
    labels,
    datasets: [
      {
        label: 'Computation burn',
        data: compLine,
        borderColor: chartPalette.red,
        backgroundColor: 'rgba(239, 68, 68, 0.45)',
        fill: 'origin',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 1.5,
        stack: 'sources',
      },
      {
        label: 'Non-refundable burn',
        data: nonrefLine,
        borderColor: chartPalette.purple,
        backgroundColor: 'rgba(168, 85, 247, 0.45)',
        fill: '-1',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 1.5,
        stack: 'sources',
      },
      {
        label: 'Permanently locked storage',
        data: lockedLine,
        borderColor: chartPalette.blue,
        backgroundColor: 'rgba(59, 130, 246, 0.35)',
        fill: '-1',
        tension: 0.25,
        pointRadius: 0,
        borderWidth: 1.5,
        stack: 'sources',
      },
    ],
  }
})

const simpleChartOpts = markRaw(
  lineOptions({
    plugins: { legend: { display: false } },
  } as Partial<ChartOptions<'line'>>),
)

const supplyChartOpts = markRaw(
  lineOptions({
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: chartPalette.tick,
          font: { family: "'Inter', sans-serif", size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
        },
      },
    },
  } as Partial<ChartOptions<'line'>>),
)

const sourcesChartOpts = markRaw(
  lineOptions({
    plugins: {
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: {
          color: chartPalette.tick,
          font: { family: "'Inter', sans-serif", size: 11 },
          boxWidth: 10,
          boxHeight: 10,
          padding: 12,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: chartPalette.tick, font: { family: "'JetBrains Mono', monospace", size: 10, weight: 500 }, maxTicksLimit: 5 },
      },
      y: {
        stacked: true,
        grid: { color: chartPalette.grid, lineWidth: 0.5 },
        border: { display: false },
        ticks: { color: chartPalette.tick, font: { family: "'JetBrains Mono', monospace", size: 10, weight: 500 }, maxTicksLimit: 4 },
      },
    },
  } as Partial<ChartOptions<'line'>>),
)

function reset() {
  txMultExp.value = DEFAULTS.txMultExp
  compMult.value = DEFAULTS.compMult
  storMult.value = DEFAULTS.storMult
  permLockPct.value = historicalLockPct.value
  refGasPrice.value = DEFAULTS.refGasPrice
  nonRefRate.value = DEFAULTS.nonRefRate
  horizonYears.value = DEFAULTS.horizonYears
}

const horizonOptions = [1, 5, 10, 20]
</script>

<template>
  <div v-if="!agg" class="state">Loading aggregates…</div>
  <template v-else>
    <div class="mode-toggle">
      <button
        class="mode-btn"
        :class="{ active: mode === 'simple' }"
        @click="mode = 'simple'"
      >Simple</button>
      <button
        class="mode-btn"
        :class="{ active: mode === 'advanced' }"
        @click="mode = 'advanced'"
      >Advanced</button>
    </div>

    <!-- ─────────── Simple view ─────────── -->
    <template v-if="mode === 'simple'">
      <p class="lede">
        IOTA mints {{ fmtIota(agg.rolling.last7d.avgStakeRewards) }} for validators every day and
        burns gas from every transaction. Drag the slider to see how usage growth bends the supply curve.
      </p>

      <div class="simple-card">
        <div class="simple-headline" :class="projection?.isDeflationarySupply ? 'deflation' : 'inflation'">
          <div class="lb">Total supply in {{ horizonYears }} years</div>
          <div class="vl">
            <span v-if="projection?.isDeflationarySupply">−{{ projection?.totalDeflPct.toFixed(1) }}%</span>
            <span v-else>+{{ Math.abs(projection?.totalDeflPct ?? 0).toFixed(1) }}%</span>
          </div>
          <div class="dl">
            {{ fmtIota(agg.current.totalSupply) }} today →
            {{ fmtIota(projection?.finalSupply ?? agg.current.totalSupply) }}
            <span class="tag">{{ projection?.isDeflationarySupply ? 'deflationary' : 'inflationary' }}</span>
          </div>
        </div>

        <div class="simple-slider">
          <div class="slider-head">
            <label>Network usage</label>
            <span class="vl-chip">×{{ fmtNum(txMultiplier) }} today's TXs</span>
          </div>
          <input type="range" min="0" max="100" step="1" v-model.number="txMultExp" />
          <div class="scale-row"><span>1×</span><span>10×</span><span>100×</span><span>1k×</span><span>10k×</span></div>
        </div>

        <div class="horizon-row">
          <span class="lb">Time horizon</span>
          <div class="horizon-buttons">
            <button
              v-for="y in horizonOptions"
              :key="y"
              class="horizon-btn"
              :class="{ active: horizonYears === y }"
              @click="horizonYears = y"
            >{{ y }}y</button>
          </div>
        </div>

        <div class="simple-chart">
          <Line :data="simpleChart" :options="simpleChartOpts" />
        </div>
      </div>
    </template>

    <!-- ─────────── Advanced view ─────────── -->
    <template v-else>
    <p class="lede">
      IOTA mints fixed daily inflation for validators and burns gas from every L1 transaction.
      Storage fees that aren't reclaimed sit in the storage fund — economically out of circulation
      until the underlying objects are deleted. Drag the sliders to model when network growth flips
      the supply curve.
    </p>

    <div class="headline">
      <div class="headline-stat" :class="projection?.isDeflationarySupply ? 'deflation' : 'inflation'">
        <div class="lb">In {{ horizonYears }}y · total supply</div>
        <div class="vl">
          <span v-if="projection?.isDeflationarySupply">−{{ projection?.totalDeflPct.toFixed(2) }}%</span>
          <span v-else>+{{ Math.abs(projection?.totalDeflPct ?? 0).toFixed(2) }}%</span>
        </div>
        <div class="dl">{{ fmtIota(projection?.finalSupply ?? agg.current.totalSupply) }} projected</div>
      </div>
      <div class="headline-stat" :class="(projection?.circDeflPct ?? 0) > 0 ? 'deflation' : 'inflation'">
        <div class="lb">In {{ horizonYears }}y · circulating</div>
        <div class="vl">
          <span v-if="(projection?.circDeflPct ?? 0) > 0">−{{ projection?.circDeflPct.toFixed(2) }}%</span>
          <span v-else>+{{ Math.abs(projection?.circDeflPct ?? 0).toFixed(2) }}%</span>
        </div>
        <div class="dl">{{ fmtIota(projection?.finalCirculating ?? agg.current.circulatingSupply) }} projected</div>
      </div>
      <div class="headline-stat neutral">
        <div class="lb">Daily net change</div>
        <div class="vl">
          <span v-if="projection && projection.dailyNetSupplyChange < 0">−{{ fmtIota(Math.abs(projection.dailyNetSupplyChange)) }}</span>
          <span v-else>+{{ fmtIota(projection?.dailyNetSupplyChange ?? 0) }}</span>
        </div>
        <div class="dl">mint − burn at projected scale</div>
      </div>
    </div>

    <div class="calc-grid">
      <div class="sliders">
        <div class="slider-row">
          <div class="slider-head">
            <label>TX volume</label>
            <span class="vl-chip">×{{ fmtNum(txMultiplier) }}</span>
          </div>
          <input type="range" min="0" max="100" step="1" v-model.number="txMultExp" />
          <div class="scale-row"><span>1×</span><span>10×</span><span>100×</span><span>1k×</span><span>10k×</span></div>
        </div>

        <div class="slider-row">
          <div class="slider-head">
            <label>Avg computation cost / tx</label>
            <span class="vl-chip">{{ compMultiplier.toFixed(2) }}× today</span>
          </div>
          <input type="range" min="1" max="1000" step="1" v-model.number="compMult" />
          <div class="scale-row"><span>0.01×</span><span>1×</span><span>10×</span></div>
        </div>

        <div class="slider-row">
          <div class="slider-head">
            <label>Avg storage cost / tx</label>
            <span class="vl-chip">{{ storMultiplier.toFixed(2) }}× today</span>
          </div>
          <input type="range" min="1" max="1000" step="1" v-model.number="storMult" />
          <div class="scale-row"><span>0.01×</span><span>1×</span><span>10×</span></div>
        </div>

        <div class="slider-row">
          <div class="slider-head">
            <label>Storage permanently locked</label>
            <span class="vl-chip">{{ permLockPct }}%</span>
          </div>
          <input type="range" min="0" max="100" step="1" v-model.number="permLockPct" />
          <div class="scale-row"><span>0%</span><span>50%</span><span>100%</span></div>
          <div class="hint">
            Share of new storage fees that never get rebated (regulatory archives, immutable NFTs, package code).
            Historical: ~{{ historicalLockPct }}% on IOTA mainnet so far.
          </div>
        </div>

        <details class="advanced">
          <summary>Protocol parameters (advanced)</summary>
          <div class="slider-row">
            <div class="slider-head">
              <label>Reference gas price</label>
              <span class="vl-chip">{{ refGasPrice }} NANOS</span>
            </div>
            <input type="range" min="100" max="10000" step="100" v-model.number="refGasPrice" />
            <div class="scale-row"><span>100</span><span>1000 (live)</span><span>10000</span></div>
          </div>
          <div class="slider-row">
            <div class="slider-head">
              <label>Non-refundable storage rate</label>
              <span class="vl-chip">{{ nonRefRate }}%</span>
            </div>
            <input type="range" min="0" max="50" step="1" v-model.number="nonRefRate" />
            <div class="scale-row"><span>0% (live)</span><span>25%</span><span>50%</span></div>
          </div>
        </details>

        <div class="horizon-row">
          <span class="lb">Time horizon</span>
          <div class="horizon-buttons">
            <button
              v-for="y in horizonOptions"
              :key="y"
              class="horizon-btn"
              :class="{ active: horizonYears === y }"
              @click="horizonYears = y"
            >{{ y }}y</button>
          </div>
        </div>

        <button class="reset" @click="reset">Reset to today</button>
      </div>

      <div class="charts">
        <div class="chart-card">
          <div class="chart-title">Projected supply</div>
          <div class="chart-body tall">
            <Line :data="supplyChart" :options="supplyChartOpts" />
          </div>
        </div>

        <div class="chart-card">
          <div class="chart-title">
            Sources of supply pressure <span class="hint">cumulative</span>
          </div>
          <div class="chart-body tall">
            <Line :data="sourcesChart" :options="sourcesChartOpts" />
          </div>
        </div>
      </div>
    </div>
    </template>

    <div class="baseline-info">
      <div>
        <span class="lb">Calibrated on</span>
        <span class="vl">7-day rolling average · epoch {{ agg.asOf.epoch }}</span>
      </div>
      <div>
        <span class="lb">Today</span>
        <span class="vl">
          {{ fmtNum(baseline?.txPerDay ?? 0) }} txs/day ·
          {{ fmtIota(agg.rolling.last7d.avgGasBurned) }}/day burned ·
          {{ fmtIota(agg.rolling.last7d.avgStorageNetInflow) }}/day net storage in
        </span>
      </div>
    </div>
  </template>
</template>

<style scoped>
.mode-toggle {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  margin-bottom: 18px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
}
.mode-btn {
  background: transparent;
  border: none;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 6px 14px; border-radius: 6px;
  cursor: pointer;
  transition: color .1s, background .1s;
}
.mode-btn:hover { color: var(--text, #F1F5F9); }
.mode-btn.active {
  color: var(--accent, #F5B041);
  background: var(--accent-soft, rgba(245,176,65,0.10));
}

.simple-card {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 12px;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.simple-headline { padding: 4px 0; }
.simple-headline .lb {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-mute, #94a3b8);
  margin-bottom: 6px;
}
.simple-headline .vl {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 56px; font-weight: 600;
  line-height: 1;
  letter-spacing: -0.02em;
}
.simple-headline.deflation .vl { color: #86efac; }
.simple-headline.inflation .vl { color: #fca5a5; }
.simple-headline .dl {
  margin-top: 10px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px; color: var(--text-mute, #94a3b8);
}
.simple-headline .tag {
  margin-left: 8px;
  display: inline-block;
  font-size: 10px; font-weight: 600;
  letter-spacing: 0.12em;
  padding: 2px 8px; border-radius: 4px;
}
.simple-headline.deflation .tag { background: rgba(34, 197, 94, 0.12); color: #86efac; }
.simple-headline.inflation .tag { background: rgba(239, 68, 68, 0.12); color: #fca5a5; }

.simple-slider { padding: 4px 0; }
.simple-chart { height: 260px; }

.lede {
  color: var(--text-dim, #cbd5e1);
  font-size: 13px; line-height: 1.6;
  margin: 0 0 20px;
}

.headline {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 28px;
}
.headline-stat {
  background: var(--surface, #111A2B);
  border: 1px solid;
  border-radius: 12px;
  padding: 16px 20px;
}
.headline-stat.deflation { border-color: rgba(34, 197, 94, 0.45); }
.headline-stat.inflation { border-color: rgba(239, 68, 68, 0.45); }
.headline-stat.neutral   { border-color: var(--border, #1C2740); }
.headline-stat .lb {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--text-mute, #94a3b8); margin-bottom: 4px;
}
.headline-stat .vl {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 30px; font-weight: 600;
  letter-spacing: -0.01em;
}
.headline-stat.deflation .vl { color: #86efac; }
.headline-stat.inflation .vl { color: #fca5a5; }
.headline-stat.neutral .vl   { color: var(--text, #F1F5F9); }
.headline-stat .dl {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; color: var(--text-mute, #94a3b8); margin-top: 2px;
}

.calc-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(360px, 1.4fr);
  gap: 28px;
  align-items: start;
}
@media (max-width: 880px) { .calc-grid { grid-template-columns: 1fr; } }

.sliders { display: flex; flex-direction: column; gap: 18px; }

.slider-row {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 14px 16px;
}
.slider-head {
  display: flex; justify-content: space-between; align-items: baseline;
  margin-bottom: 8px;
}
.slider-head label {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-mute, #94a3b8);
}
.vl-chip {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px; font-weight: 600;
  padding: 2px 10px; border-radius: 99px;
  background: var(--accent-soft, rgba(245,176,65,0.15));
  color: var(--accent, #F5B041);
}
input[type="range"] {
  width: 100%; appearance: none;
  height: 6px;
  background: var(--chip-bg, #0e1626);
  border-radius: 3px;
  outline: none;
  border: 1px solid var(--border, #1C2740);
}
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--accent, #F5B041);
  cursor: pointer;
  border: 2px solid var(--surface, #111A2B);
  box-shadow: 0 0 0 1px var(--accent, #F5B041);
}
input[type="range"]::-moz-range-thumb {
  width: 16px; height: 16px; border-radius: 50%;
  background: var(--accent, #F5B041);
  cursor: pointer;
  border: 2px solid var(--surface, #111A2B);
}
.scale-row {
  display: flex; justify-content: space-between;
  margin-top: 6px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; color: var(--text-mute, #94a3b8);
  letter-spacing: 0.04em;
}
.hint {
  margin-top: 8px;
  font-size: 11px; line-height: 1.5;
  color: var(--text-mute, #94a3b8);
}

.advanced {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 4px 16px;
}
.advanced summary {
  cursor: pointer;
  padding: 10px 0;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-mute, #94a3b8);
  list-style: none;
}
.advanced summary::-webkit-details-marker { display: none; }
.advanced summary::before { content: '+'; margin-right: 8px; color: var(--accent, #F5B041); }
.advanced[open] summary::before { content: '−'; }
.advanced .slider-row {
  background: transparent;
  border: none;
  border-top: 1px solid var(--border, #1C2740);
  border-radius: 0;
  padding: 14px 0;
}

.horizon-row {
  display: flex; align-items: center; gap: 12px;
  padding: 8px 0;
}
.horizon-row .lb {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  color: var(--text-mute, #94a3b8);
}
.horizon-buttons { display: flex; gap: 6px; }
.horizon-btn {
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; padding: 6px 12px; border-radius: 6px;
  cursor: pointer;
  transition: color .1s, border-color .1s, background .1s;
}
.horizon-btn:hover { color: var(--text, #F1F5F9); }
.horizon-btn.active {
  color: var(--accent, #F5B041);
  border-color: var(--accent, #F5B041);
  background: var(--accent-soft, rgba(245,176,65,0.10));
}

.reset {
  align-self: flex-start;
  background: transparent;
  border: 1px solid var(--border, #1C2740);
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: color .1s, border-color .1s;
}
.reset:hover { color: var(--text, #F1F5F9); border-color: var(--border-strong, #2a3958); }

.charts { display: flex; flex-direction: column; gap: 16px; }
.chart-card {
  background: var(--surface, #111A2B);
  border: 1px solid var(--border, #1C2740);
  border-radius: 10px;
  padding: 16px 18px;
}
.chart-title {
  font-family: var(--font-display, 'Instrument Sans', sans-serif);
  font-size: 14px; font-weight: 600;
  color: var(--text, #F1F5F9);
  margin-bottom: 10px;
  display: flex; justify-content: space-between; align-items: baseline;
}
.chart-title .hint {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 10px; letter-spacing: 0.08em;
  color: var(--text-mute, #94a3b8); font-weight: 400;
  text-transform: uppercase;
}
.chart-body { height: 260px; }
.chart-body.tall { height: 280px; }

.baseline-info {
  margin-top: 24px;
  padding: 14px 18px;
  background: var(--chip-bg, #0e1626);
  border: 1px solid var(--border, #1C2740);
  border-radius: 8px;
  display: flex; flex-wrap: wrap; gap: 6px 24px;
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
}
.baseline-info .lb { color: var(--text-mute, #94a3b8); margin-right: 8px; letter-spacing: 0.04em; }
.baseline-info .vl { color: var(--text, #F1F5F9); }

.state {
  padding: 40px; text-align: center;
  color: var(--text-mute, #94a3b8);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px; letter-spacing: 0.04em;
}
</style>
