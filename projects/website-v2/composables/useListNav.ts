// Shared nav state for the Projects/Teams/Unattributed/Announced list +
// detail pages. Persists the active tab, the full ordered list of IDs the
// user is navigating through, and their filter/sort state — so that:
//
//   1. Clicking "Back to dashboard" from a detail page returns to the same
//      tab with the same filters applied (no lost context).
//   2. Detail pages can render prev / next arrows that walk the list in
//      the user's current sort order.
//
// Storage is sessionStorage (per-tab lifetime, cleared when the browser
// tab closes). The value is a single JSON blob under NAV_KEY so saves
// are one write; readers destructure what they need.

export type ListTabKey = 'projects' | 'teams' | 'unattributed' | 'announced'

export type NavState = {
  tab: ListTabKey
  // IDs in current filtered + sorted order, keyed by tab:
  //   projects → project.slug
  //   teams → team.id
  //   unattributed → cluster.deployer
  //   announced → entry.id
  orderedIds: string[]
  // Filter state — only keys actually in use on the home page. Unknown
  // keys on read are ignored; missing keys fall back to defaults.
  filters: Record<string, unknown>
}

const NAV_KEY = 'iota-registry.listnav.v1'

export function saveListNav(state: NavState): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(NAV_KEY, JSON.stringify(state))
  } catch {
    // quota / private mode — silently degrade, nav is a nice-to-have
  }
}

export function readListNav(): NavState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(NAV_KEY)
    if (!raw) return null
    return JSON.parse(raw) as NavState
  } catch {
    return null
  }
}

// Compute adjacent IDs for a detail page in the current tab. If the detail
// page wasn't reached from the list (sessionStorage empty or tab mismatch),
// returns all nulls and prev/next arrows are hidden.
export function useAdjacentInList(currentTab: ListTabKey, currentId: string) {
  const nav = readListNav()
  if (!nav || nav.tab !== currentTab) {
    return { prev: null as string | null, next: null as string | null, total: 0, index: -1 }
  }
  const ids = nav.orderedIds
  const idx = ids.indexOf(currentId)
  if (idx === -1) {
    return { prev: null as string | null, next: null as string | null, total: ids.length, index: -1 }
  }
  return {
    prev: idx > 0 ? ids[idx - 1] : null,
    next: idx < ids.length - 1 ? ids[idx + 1] : null,
    total: ids.length,
    index: idx,
  }
}
