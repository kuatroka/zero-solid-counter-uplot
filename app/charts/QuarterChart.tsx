import { createEffect, onCleanup, onMount } from "solid-js";
import uPlot from "uplot";
import { ChartKind, createQuarterChart, updateQuarterChart } from "./factory";
import "uplot/dist/uPlot.min.css";

export function QuarterChart(props: {
  kind: ChartKind;
  title: string;
  labels: string[];
  values: number[];
}) {
  let el!: HTMLDivElement;
  let chart: uPlot | undefined;

  onMount(() => {
    chart = createQuarterChart(props.kind, el, props.labels, props.values, props.title);
  });

  onCleanup(() => {
    chart?.destroy();
  });

  // Reactive updates when data changes
  createEffect(() => {
    // Access to track reactivity
    const labels = props.labels;
    const values = props.values;
    if (chart && labels && values && labels.length && values.length) {
      updateQuarterChart(chart, labels, values);
    }
  });

  return <div ref={el} style={{ width: "100%" }} />;
}

export default QuarterChart;
