import "dotenv/config";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import { handleLogin } from "./login";
import { handleMutate } from "./mutate";
import { handleGetQueries } from "./get-queries";
import { maybeSeedFromPocketbaseMigrations } from "./seed";
import { getCounter, mutateCounter } from "./counter";
import { getQuarterSeries } from "./quarters";

export const app = new Hono().basePath("/api");

// Kick off idempotent seed on startup if the referenced PocketBase
// migrations file is present locally. Errors are logged and ignored.
void maybeSeedFromPocketbaseMigrations().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Seeding from PocketBase migrations failed:", err);
});

app.get("/login", (c) => handleLogin(c));

app.post("/mutate", async (c) => {
  return await c.json(await handleMutate(c));
});

app.post("/get-queries", async (c) => {
  return await c.json(await handleGetQueries(c.req.raw));
});

// Counter endpoints (support trailing slash)
app.get("/counter", (c) => getCounter(c));
app.get("/counter/", (c) => getCounter(c));
app.post("/counter", (c) => mutateCounter(c));
app.post("/counter/", (c) => mutateCounter(c));

// Quarter series for charts (support trailing slash)
app.get("/quarters", (c) => getQuarterSeries(c));
app.get("/quarters/", (c) => getQuarterSeries(c));

export default handle(app);
