export function fmtNum(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k'
  return String(Math.round(n))
}

export function fmtUsd(n: number | null | undefined): string {
  if (n == null || n === 0) return '—'
  if (n >= 1_000_000_000) return '$' + (n / 1_000_000_000).toFixed(1) + 'B'
  if (n >= 1_000_000) return '$' + (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return '$' + (n / 1_000).toFixed(1) + 'k'
  return '$' + n.toFixed(0)
}

export function fmtIota(n: number | null | undefined): string {
  if (n == null) return '—'
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M IOTA'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k IOTA'
  return n.toFixed(0) + ' IOTA'
}

export function fmtPct(n: number | null | undefined): string {
  if (n == null) return '—'
  const sign = n > 0 ? '+' : ''
  return sign + n.toFixed(1) + '%'
}

export function shortAddr(addr: string | null | undefined): string {
  if (!addr) return '—'
  if (addr.length < 14) return addr
  return addr.slice(0, 8) + '…' + addr.slice(-4)
}

export function relativeTime(ts: string | number | Date | null | undefined): string {
  if (!ts) return '—'
  const then = new Date(ts).getTime()
  if (!isFinite(then)) return '—'
  const delta = Date.now() - then
  const sec = Math.floor(delta / 1000)
  if (sec < 60) return sec + 's ago'
  const min = Math.floor(sec / 60)
  if (min < 60) return min + 'm ago'
  const hr = Math.floor(min / 60)
  if (hr < 24) return hr + 'h ago'
  const day = Math.floor(hr / 24)
  if (day < 30) return day + 'd ago'
  const mo = Math.floor(day / 30)
  if (mo < 12) return mo + 'mo ago'
  return Math.floor(mo / 12) + 'y ago'
}

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function explorerPackageUrl(addr: string): string {
  return `https://explorer.iota.org/object/${addr}?network=mainnet`
}

/**
 * API returns logo paths like `/logos/gamifly.png` — rooted paths that resolve
 * against the frontend origin. Logos live in `public/logos/` so Nuxt serves
 * them directly. Pass through external URLs unchanged.
 */
export function absoluteLogo(path: string | null | undefined): string | null {
  if (!path) return null
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path
  return path
}
