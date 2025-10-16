## 1. Implementation
- [x] 1.1 Add idempotent seeding util `server/seed.ts`
- [x] 1.2 Wire seeding into `server/index.ts` on startup (guarded by file existence)
- [x] 1.3 Add Docker init SQL `01_init_pb_seed.sql`
- [ ] 1.4 Manual sanity check with local Postgres

## 2. Validation
- [ ] 2.1 Re-run seed to confirm no duplicates
- [ ] 2.2 Drop tables and re-run to confirm regeneration
