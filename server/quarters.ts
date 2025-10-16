import { Context } from "hono";
import postgres from "postgres";
import { must } from "../shared/must";
import { ensureSeededOnDemand } from "./seed";

function getSQL() {
  const conn = must(
    process.env.ZERO_UPSTREAM_DB,
    "required env var ZERO_UPSTREAM_DB"
  );
  return postgres(conn);
}

export async function getQuarterSeries(c: Context) {
  const sql = getSQL();
  try {
    // Ensure tables exist and seed if empty before querying
    await ensureSeededOnDemand();
    const rows = await sql<[{ quarter: string; value: number }]>`
      select quarter, value from value_quarters order by quarter asc`;
    const labels = rows.map((r) => r.quarter);
    const values = rows.map((r) => Number(r.value));
    return c.json({ labels, values });
  } finally {
    await sql.end({ timeout: 5 });
  }
}
