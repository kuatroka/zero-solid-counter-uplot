# Proposal: Add Counter Route with uPlot Charts

## Why
Mirror the example SvelteKit route (counter + 10 charts) in this Solid app to visualize seeded quarterly data and a persistent counter.

## What Changes
- New client route `/counter` that renders a counter and 10 uPlot charts.
- New API endpoints: `GET/POST /api/counter` and `GET /api/quarters` backed by Postgres.
- Lightweight in-app router switch based on `window.location.pathname`.
- Chart factory and Solid wrapper for uPlot.

## Impact
- Affected code: `server/index.ts`, `server/counter.ts`, `server/quarters.ts`, `app/CounterPage.tsx`, `app/charts/*`, `app/services/*`, `package.json` (uplot dep)
- Affected specs: `ui-counter-charts`, `api-counter`, `api-quarters`

