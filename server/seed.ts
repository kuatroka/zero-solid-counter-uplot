import fs from "fs/promises";
import postgres from "postgres";
import { must } from "../shared/must";

// Path to the PocketBase migrations file we mirror for seeding.
const PB_MIGRATIONS_PATH =
  "/Users/yo_macbook/Documents/dev/pb_sveltekit_standalone/pocketbase/app/migrations/migrations.go";

// Constants mirrored from the PocketBase migration file.
const MIN_VALUE = 1.0;
const MAX_VALUE = 500_000_000_000.0;
const START_YEAR = 1999;
const START_QUARTER = 1;
const END_YEAR = 2025;
const END_QUARTER = 4;

// Small deterministic RNG so runs are repeatable.
function makeLCG(seed: number) {
  let state = seed >>> 0;
  return function rand() {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

export async function maybeSeedFromPocketbaseMigrations() {
  // If the referenced migrations file exists, we seed deterministically.
  // Regardless, we ensure tables exist and seed if empty so charts work.
  let pbFileExists = true;
  try {
    await fs.access(PB_MIGRATIONS_PATH);
  } catch {
    pbFileExists = false;
  }

  const connStr = must(
    process.env.ZERO_UPSTREAM_DB,
    "required env var ZERO_UPSTREAM_DB"
  );
  const sql = postgres(connStr, { max: 1 });

  try {
    await ensureTables(sql);
    await ensureCounter(sql);
    // Seed if PB file exists OR if table currently empty
    const [{ count }] = await sql`select count(*)::int as count from value_quarters`;
    if (pbFileExists || Number(count) === 0) {
      await seedQuarters(sql);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

async function ensureTables(sql: postgres.Sql) {
  await sql`
    create table if not exists value_quarters (
      quarter text primary key,
      value double precision not null
    )`;
  await sql`
    create table if not exists counters (
      id text primary key,
      value double precision not null
    )`;
}

async function ensureCounter(sql: postgres.Sql) {
  await sql`insert into counters (id, value) values ('main', 0)
            on conflict (id) do nothing`;
}

async function seedQuarters(sql: postgres.Sql) {
  const rnd = makeLCG(42);
  const rows: { quarter: string; value: number }[] = [];
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const qStart = year === START_YEAR ? START_QUARTER : 1;
    const qEnd = year === END_YEAR ? END_QUARTER : 4;
    for (let q = qStart; q <= qEnd; q++) {
      const quarter = `${year}Q${q}`;
      const value = rnd() * (MAX_VALUE - MIN_VALUE) + MIN_VALUE;
      rows.push({ quarter, value });
    }
  }
  if (rows.length) {
    await sql`
      insert into value_quarters ${sql(rows, "quarter", "value")}
      on conflict (quarter) do nothing`;
  }
}

export async function ensureSeededOnDemand() {
  const connStr = must(
    process.env.ZERO_UPSTREAM_DB,
    "required env var ZERO_UPSTREAM_DB"
  );
  const sql = postgres(connStr, { max: 1 });
  try {
    await ensureTables(sql);
    await ensureCounter(sql);
    const [{ count }] = await sql`select count(*)::int as count from value_quarters`;
    if (Number(count) === 0) {
      await seedQuarters(sql);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

// Allow manual invocation via `node`/bundler if imported directly.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function runSeed(): Promise<any> {
  return maybeSeedFromPocketbaseMigrations();
}
