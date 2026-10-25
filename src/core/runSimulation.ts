import type { Process, SchedulingOptions, SimulationResult } from "./types.js";
import { simulate } from "./simulate.js";

/** React-facing contract. The legacy positional API stays available to original tests. */
export function runSimulation(
  processes: readonly Process[],
  options: SchedulingOptions,
): SimulationResult {
  const quantum = options.algorithm === "RR" ? (options.quantum ?? NaN) : 2;
  return simulate(processes, options.algorithm, quantum);
}
