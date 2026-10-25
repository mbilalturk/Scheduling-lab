import { fcfs, sjf, srtf, roundRobin } from "./algorithms.js";
import { calculateMetrics } from "./metrics.js";
import { validateInput } from "./validation.js";
import type { Algorithm, Process, SimulationResult } from "./types.js";

const algorithms = { FCFS: fcfs, SJF: sjf, SRTF: srtf, RR: roundRobin };

export function simulate(
  processes: readonly Process[],
  algorithm: Algorithm,
  quantum = 2,
): SimulationResult {
  const input = validateInput(processes, algorithm, quantum);
  const timeline = algorithms[algorithm](input, quantum);
  return { timeline, ...calculateMetrics(input, timeline) };
}
