## ADDED Requirements

### Requirement: Mirror PocketBase seed into Postgres
The system SHALL mirror the data defined in the PocketBase `migrations.go` by creating equivalent `value_quarters` and `counters` tables and seeding them with deterministic values.

#### Scenario: Automatic seed on startup when reference exists
- **WHEN** the file `/Users/yo_macbook/Documents/dev/pb_sveltekit_standalone/pocketbase/app/migrations/migrations.go` exists locally
- **THEN** on server startup the system SHALL create the `value_quarters` and `counters` tables if missing
- **AND** it SHALL insert rows for quarters `1999Q1` through `2025Q4` with values in `[1.0, 500000000000.0]`
- **AND** it SHALL ensure a `counters` row with id `main` and value `0`
- **AND** it MUST be idempotent (no duplicate rows on subsequent runs).

#### Scenario: First-time Docker DB initialization
- **WHEN** the Postgres container initializes a fresh data directory
- **THEN** a provided SQL script SHALL create the same tables and seed the same ranges
- **AND** it MUST be safe to re-run without creating duplicates.

