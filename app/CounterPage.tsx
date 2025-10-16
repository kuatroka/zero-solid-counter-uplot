import { createSignal, For, onMount, Show } from "solid-js";
import { A } from "@solidjs/router";
import * as counterService from "./services/counter";
import * as chartDataService from "./services/quarters";
import type { ChartSeries } from "./services/quarters";
import QuarterChart from "./charts/QuarterChart";
import { chartMetaList } from "./charts/factory";

export default function CounterPage() {
  const [counter, setCounter] = createSignal(0);
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [series, setSeries] = createSignal<ChartSeries>({ labels: [], values: [] });
  const [initialLoading, setInitialLoading] = createSignal(true);

  onMount(async () => {
    try {
      const [c, s] = await Promise.all([
        counterService.getValue(),
        chartDataService.getChartSeries(),
      ]);
      setCounter(c);
      setSeries(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      console.error(e);
    } finally {
      setInitialLoading(false);
    }
  });

  async function inc() {
    if (loading()) return;
    setLoading(true);
    setError(null);
    const prev = counter();
    setCounter(prev + 1);
    try {
      setCounter(await counterService.increment());
    } catch (e) {
      setCounter(prev);
      setError(e instanceof Error ? e.message : "Failed to increment");
    } finally {
      setLoading(false);
    }
  }

  async function dec() {
    if (loading()) return;
    setLoading(true);
    setError(null);
    const prev = counter();
    setCounter(prev - 1);
    try {
      setCounter(await counterService.decrement());
    } catch (e) {
      setCounter(prev);
      setError(e instanceof Error ? e.message : "Failed to decrement");
    } finally {
      setLoading(false);
    }
  }

  const primary = () => chartMetaList[0];
  const others = () => chartMetaList.slice(1);

  return (
    <div style={{ padding: "16px", "max-width": "1200px", margin: "0 auto" }}>
      <A href="/" style={{ "text-decoration": "none" }}>← Back</A>
      <h1>Counter with Charts</h1>
      <p>Solid + Hono + uPlot demo mirroring the SvelteKit example.</p>

      <Show when={!initialLoading()} fallback={<p>Loading…</p>}>
        <Show when={error()}>
          {(msg) => (
            <div style={{ padding: "8px", background: "#fee2e2", color: "#991b1b" }}>{msg()}</div>
          )}
        </Show>

        <div style={{ display: "flex", gap: "12px", "align-items": "center", margin: "12px 0" }}>
          <button
            type="button"
            onClick={dec}
            style={{
              width: "48px",
              height: "48px",
              "font-size": "28px",
              display: "inline-flex",
              "align-items": "center",
              "justify-content": "center",
              "background-color": "#1f2937",
              color: "white",
              border: "none",
              "border-radius": "8px",
              cursor: loading() ? "default" : "pointer",
              "pointer-events": loading() ? "none" : "auto",
            }}
          >
            -
          </button>
          <div style={{ "font-size": "24px", width: "80px", "text-align": "center" }}>{counter()}</div>
          <button
            type="button"
            onClick={inc}
            style={{
              width: "48px",
              height: "48px",
              "font-size": "28px",
              display: "inline-flex",
              "align-items": "center",
              "justify-content": "center",
              "background-color": "#1f2937",
              color: "white",
              border: "none",
              "border-radius": "8px",
              cursor: loading() ? "default" : "pointer",
              "pointer-events": loading() ? "none" : "auto",
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: "grid", gap: "12px" }}>
          <Show when={primary()}>
            {(m) => (
              <div style={{ border: "1px solid #e5e7eb", padding: "8px", "border-radius": "6px" }}>
                <h2 style={{ margin: "4px 0" }}>{m().title}</h2>
                <p style={{ margin: "4px 0", color: "#6b7280" }}>{m().description}</p>
                <QuarterChart
                  kind={m().key as any}
                  title={m().title}
                  labels={series().labels}
                  values={series().values}
                />
              </div>
            )}
          </Show>

          <div
            style={{
              display: "grid",
              gap: "12px",
              "grid-template-columns": "repeat(auto-fill, minmax(360px, 1fr))",
            }}
          >
            <For each={others()}>
              {(m) => (
                <div style={{ border: "1px solid #e5e7eb", padding: "8px", "border-radius": "6px" }}>
                  <h3 style={{ margin: "4px 0" }}>{m.title}</h3>
                  <p style={{ margin: "4px 0", color: "#6b7280" }}>{m.description}</p>
                  <QuarterChart
                    kind={m.key as any}
                    title={m.title}
                    labels={series().labels}
                    values={series().values}
                  />
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  );
}
