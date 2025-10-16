import uPlot from "uplot";

export interface ChartMeta {
  key: string;
  title: string;
  description: string;
  height?: number;
}

export interface ChartBuildResult {
  series: uPlot.Series[];
  data: uPlot.AlignedData;
  extra?: Partial<Pick<uPlot.Options, "bands" | "scales" | "axes">>;
}

export type ChartKind =
  | "bars"
  | "line"
  | "area"
  | "scatter"
  | "step"
  | "spline"
  | "cumulative"
  | "movingavg"
  | "band"
  | "dual";

const DEFAULT_HEIGHT = 320;
const DEFAULT_PADDING: uPlot.Padding = [12, 28, 40, 10];

const BAR_OPTIONS = { size: [0.6, Infinity] as [number, number], align: 0 };

function labelsToIndices(labels: string[]): number[] {
  return labels.map((_, i) => i);
}

function movingAverage(values: number[], window = 4): number[] {
  return values.map((_, idx) => {
    const start = Math.max(0, idx - window + 1);
    const slice = values.slice(start, idx + 1);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
  });
}

function cumulative(values: number[]): number[] {
  let t = 0;
  return values.map((v) => (t += v));
}

function baseAxes(labels: string[]): uPlot.Axis[] {
  return [
    {
      stroke: "#9ca3af",
      grid: { stroke: "rgba(148,163,184,0.2)" },
      ticks: { stroke: "#d1d5db" },
      values: (_: uPlot, ticks: number[]) =>
        ticks.map((t) => labels[Math.round(t)] ?? ""),
    },
    { stroke: "#9ca3af", grid: { stroke: "rgba(148,163,184,0.2)" } },
  ];
}

function makeBaseOptions(params: {
  title: string;
  labels: string[];
  width: number;
  height?: number;
}): uPlot.Options {
  return {
    title: params.title,
    width: Math.max(600, params.width),
    height: params.height ?? DEFAULT_HEIGHT,
    padding: DEFAULT_PADDING,
    legend: { show: true },
    scales: { x: { time: false }, y: {} },
    axes: baseAxes(params.labels),
    series: [{}],
  };
}

const factories: Record<ChartKind, (labels: string[], values: number[]) => ChartBuildResult> = {
  bars: (_labels, values) => ({
    series: [
      {
        label: "Value",
        spanGaps: false,
        paths: uPlot.paths.bars!(BAR_OPTIONS),
        fill: "rgba(37,99,235,0.35)",
        stroke: "#2563eb",
        points: { show: false },
      },
    ],
    data: [values],
  }),
  line: (_l, values) => ({
    series: [
      { label: "Value", stroke: "#2563eb", width: 2, points: { show: true, size: 6 } },
    ],
    data: [values],
  }),
  area: (_l, values) => ({
    series: [
      {
        label: "Value",
        stroke: "#7c3aed",
        width: 2,
        fill: "rgba(124,58,237,0.25)",
        points: { show: true, size: 5 },
      },
    ],
    data: [values],
  }),
  scatter: (_l, values) => ({
    series: [
      {
        label: "Value",
        stroke: "#16a34a",
        width: 0,
        points: { show: true, size: 7 },
        paths: uPlot.paths.points!(),
      },
    ],
    data: [values],
  }),
  step: (_l, values) => ({
    series: [
      {
        label: "Value",
        stroke: "#dc2626",
        width: 2,
        paths: uPlot.paths.stepped!({ align: 1 }),
        points: { show: true, size: 4 },
      },
    ],
    data: [values],
  }),
  spline: (_l, values) => ({
    series: [
      {
        label: "Value",
        stroke: "#ea580c",
        width: 2,
        paths: uPlot.paths.spline!(),
        points: { show: false },
      },
    ],
    data: [values],
  }),
  cumulative: (_l, values) => ({
    series: [
      { label: "Quarterly", stroke: "#2563eb", width: 1 },
      { label: "Cumulative", stroke: "#111827", width: 2 },
    ],
    data: [values, cumulative(values)],
  }),
  movingavg: (_l, values) => ({
    series: [
      { label: "Value", stroke: "#7c3aed", width: 1 },
      { label: "MA(4)", stroke: "#111827", width: 2 },
    ],
    data: [values, movingAverage(values, 4)],
  }),
  band: (_l, values) => {
    const ma = movingAverage(values, 4);
    const lo = ma.map((v) => v * 0.9);
    const hi = ma.map((v) => v * 1.1);
    const bands: uPlot.Band[] = [
      { series: [1, 2], fill: "rgba(99,102,241,0.12)" },
    ];
    return {
      series: [
        { label: "MA Lo", stroke: "#a5b4fc", width: 1 },
        { label: "MA Hi", stroke: "#6366f1", width: 1 },
      ],
      data: [lo, hi],
      extra: { bands },
    };
  },
  dual: (_l, values) => {
    const right = movingAverage(values, 8);
    const scales = { y: {}, y2: { range: (u: uPlot, m: number, M: number) => [m, M] } } as Record<string, Partial<uPlot.Scale>>;
    const axes: uPlot.Axis[] = [baseAxes([])[0], { side: 1 }];
    return {
      series: [
        { label: "Value", stroke: "#22c55e", width: 1, points: { show: false } },
        { label: "MA(8)", stroke: "#1f2937", width: 2, scale: "y2" },
      ],
      data: [values, right],
      extra: { scales, axes },
    };
  },
};

export const chartMetaList: ChartMeta[] = [
  { key: "bars", title: "Quarterly Values · Column", description: "Baseline columnar view of raw quarterly values." },
  { key: "line", title: "Quarterly Trend · Line", description: "Line emphasizing momentum quarter-to-quarter." },
  { key: "area", title: "Quarterly Total · Area", description: "Line with soft fill for magnitude emphasis." },
  { key: "scatter", title: "Quarterly Distribution · Scatter", description: "Points-only distribution across quarters." },
  { key: "step", title: "Quarterly Changes · Step", description: "Discrete shifts per quarter." },
  { key: "spline", title: "Quarterly Trend · Spline", description: "Smoothed interpolation." },
  { key: "cumulative", title: "Cumulative Performance", description: "Running total alongside raw values." },
  { key: "movingavg", title: "Moving Average (4)", description: "Smoother trend indicator." },
  { key: "band", title: "MA Confidence Band", description: "±10% band around MA(4)." },
  { key: "dual", title: "Dual Axis", description: "Raw vs MA(8) with separate axis." },
];

export function createQuarterChart(
  kind: ChartKind,
  el: HTMLElement,
  labels: string[],
  values: number[],
  title?: string
): uPlot {
  const factory = factories[kind];
  const width = el.clientWidth;
  const base = makeBaseOptions({ title: title ?? "Quarterly", labels, width });
  const built = factory(labels, values);
  if (built.extra?.bands) base.bands = built.extra.bands as uPlot.Band[];
  if (built.extra?.scales)
    base.scales = { ...(base.scales ?? {}), ...(built.extra.scales as Record<string, uPlot.Scale>) };
  if (built.extra?.axes) base.axes = built.extra.axes as uPlot.Axis[];
  base.series = [{}, ...built.series];
  const data: uPlot.AlignedData = [labelsToIndices(labels), ...built.data];
  const chart = new uPlot(base, data, el);
  (chart as any).__kind = kind;
  return chart;
}

export function updateQuarterChart(chart: uPlot, labels: string[], values: number[]) {
  const kind = (chart as any).__kind as ChartKind;
  const built = factories[kind](labels, values);
  const data: uPlot.AlignedData = [labelsToIndices(labels), ...built.data];
  chart.setData(data);
}

