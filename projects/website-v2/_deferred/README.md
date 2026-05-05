# `_deferred/` — out of active import paths, kept for restore

Components and code paths pulled out of the website-v2 build for the 2026-05-05 launch. Code is preserved (not deleted) and lives outside Nuxt's auto-discovery roots so it's not bundled.

## What's here

- `EconomicsPanel.vue` — deflation projection panel. Calculation isn't ready yet (per `plans/v2-todo.md`). Restore by moving back to `../components/EconomicsPanel.vue` and re-adding the `<EconomicsPanel />` reference in `pages/index.vue` once the calc is finalised.

## L2 (in-place gating, no file moves)

L2 projects are gated out of the active surface in `pages/index.vue` (`ecosystem.l2` reads replaced with `[]`, L2 filter button removed). The api still emits `l2[]` in the `/ecosystem` response — the legacy `iota-trade-scanner.net` site still consumes it. No api/code changes were made.

To restore L2 in v2: revert the `pages/index.vue` edits that touched `ecosystem.value?.l2` and the `<button … L2 …>` lines.
