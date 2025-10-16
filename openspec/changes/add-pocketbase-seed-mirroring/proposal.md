# Proposal: Mirror PocketBase Migrations for Seed Data

## Why
Replicate the data seeding logic from the referenced PocketBase `migrations.go` into this app's Postgres upstream so fresh/dev environments work out-of-the-box.

## What Changes
- Add idempotent seed initializer that mirrors `value_quarters` and `counters` data.
- Auto-run seeding at server startup only when the referenced file exists locally.
- Provide a Docker init SQL for first-time DB initialization.

## Impact
- Affected specs: `data-seeding`
- Affected code: `server/index.ts`, `server/seed.ts`, root `01_init_pb_seed.sql`

