export interface ChartSeries {
  labels: string[];
  values: number[];
}

export async function getChartSeries(): Promise<ChartSeries> {
  const res = await fetch("/api/quarters");
  if (!res.ok) throw new Error(`Failed to fetch quarters: ${res.status}`);
  return (await res.json()) as ChartSeries;
}

