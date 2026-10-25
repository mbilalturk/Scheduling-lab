import type { SimulationResult, TimelineInterval } from "../core/types.js";

export interface TraceEntry extends TimelineInterval {
  readonly index: number;
  readonly duration: number;
  readonly remaining: number | null;
}
export function createTraceEntries(
  result: SimulationResult,
): readonly TraceEntry[] {
  const remaining = new Map(result.metrics.map((p) => [p.id, p.burst]));
  return result.timeline.map((interval, index) => {
    const duration = interval.end - interval.start;
    if (interval.id !== null)
      remaining.set(interval.id, remaining.get(interval.id)! - duration);
    return {
      ...interval,
      index,
      duration,
      remaining: interval.id === null ? null : remaining.get(interval.id)!,
    };
  });
}
export function intervalGeometry(
  interval: TimelineInterval,
  horizon: number,
  width: number,
) {
  return {
    x: (interval.start / horizon) * width,
    width: ((interval.end - interval.start) / horizon) * width,
  };
}
