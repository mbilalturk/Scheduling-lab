import type {
  Averages,
  Process,
  ProcessMetrics,
  SimulationResult,
  TimelineInterval,
} from "./types.js";

// Derive presentation-independent facts from the completed timeline.
export function calculateMetrics(
  processes: readonly Process[],
  timeline: readonly TimelineInterval[],
): Pick<SimulationResult, "metrics" | "averages"> {
  const times = new Map<string, { firstStart: number; completion: number }>();
  for (const interval of timeline) {
    if (interval.id === null) continue;
    const previous = times.get(interval.id);
    times.set(interval.id, {
      firstStart: previous?.firstStart ?? interval.start,
      completion: interval.end,
    });
  }
  const metrics: ProcessMetrics[] = processes.map((process) => {
    const { firstStart, completion } = times.get(process.id)!;
    const turnaround = completion - process.arrival;
    return {
      ...process,
      firstStart,
      completion,
      turnaround,
      waiting: turnaround - process.burst,
      response: firstStart - process.arrival,
    };
  });
  const mean = (key: keyof Averages) =>
    metrics.reduce((sum, row) => sum + row[key], 0) / metrics.length;
  const averages: Averages = {
    turnaround: mean("turnaround"),
    waiting: mean("waiting"),
    response: mean("response"),
  };
  return { metrics, averages };
}
