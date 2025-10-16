import { Context } from "hono";
import postgres from "postgres";
import { must } from "../shared/must";

function getSQL() {
  const conn = must(
    process.env.ZERO_UPSTREAM_DB,
    "required env var ZERO_UPSTREAM_DB"
  );
  return postgres(conn);
}

export async function getCounter(c: Context) {
  const sql = getSQL();
  try {
    const rows = await sql<[{ value: number }]>`
      select value from counters where id = 'main'`;
    if (rows.length === 0) {
      await sql`insert into counters (id, value) values ('main', 0)
                on conflict (id) do nothing`;
      return c.json({ value: 0 });
    }
    return c.json({ value: Number(rows[0].value) });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function mutateCounter(c: Context) {
  const sql = getSQL();
  try {
    const body = await c.req.json().catch(() => ({ op: "inc" }));
    const op = body?.op === "dec" ? "dec" : "inc";
    // Ensure row exists.
    await sql`insert into counters (id, value) values ('main', 0)
              on conflict (id) do nothing`;
    const rows = await sql<[{ value: number }]>`
      update counters
      set value = value ${op === "inc" ? sql`+ 1` : sql`- 1`}
      where id = 'main'
      returning value`;
    return c.json({ value: Number(rows[0].value) });
  } finally {
    await sql.end({ timeout: 5 });
  }
}

