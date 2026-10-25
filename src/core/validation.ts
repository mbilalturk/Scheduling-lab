import type { Process } from "./types.js";

export function validateInput(
  processes: unknown,
  algorithm: unknown,
  quantum: unknown,
): readonly Process[] {
  if (
    typeof algorithm !== "string" ||
    !["FCFS", "SJF", "SRTF", "RR"].includes(algorithm)
  )
    throw new Error("Select a valid scheduling algorithm.");
  if (!Array.isArray(processes)) throw new Error("Provide a process list.");
  if (!processes.length) throw new Error("Add at least one process.");
  if (processes.length > 100)
    throw new Error("This simulator supports at most 100 processes.");
  if (
    algorithm === "RR" &&
    (typeof quantum !== "number" ||
      !Number.isSafeInteger(quantum) ||
      quantum <= 0)
  ) {
    throw new Error("Round Robin quantum must be a positive safe integer.");
  }
  const ids = new Set<string>();
  const normalized: Process[] = processes.map(
    (value: unknown, index: number) => {
      if (!value || typeof value !== "object")
        throw new Error(`Process ${index + 1} is invalid.`);
      const p = value as Record<string, unknown>;
      const id = typeof p.id === "string" ? p.id.trim() : "";
      if (!id || id.length > 80)
        throw new Error(
          `Process ${index + 1}: ID must contain 1 to 80 characters.`,
        );
      if (ids.has(id)) throw new Error(`Process IDs must be unique: ${id}.`);
      ids.add(id);
      if (
        typeof p.arrival !== "number" ||
        !Number.isSafeInteger(p.arrival) ||
        p.arrival < 0
      ) {
        throw new Error(
          `${id}: arrival time must be a nonnegative safe integer.`,
        );
      }
      if (
        typeof p.burst !== "number" ||
        !Number.isSafeInteger(p.burst) ||
        p.burst <= 0
      ) {
        throw new Error(`${id}: CPU burst must be a positive safe integer.`);
      }
      return { id, arrival: p.arrival, burst: p.burst };
    },
  );
  const horizon =
    Math.max(...normalized.map((p) => p.arrival)) +
    normalized.reduce((sum, p) => sum + p.burst, 0);
  // Keep interval arithmetic AND the sums used for averages exactly representable.
  if (
    !Number.isSafeInteger(horizon) ||
    horizon > Math.floor(Number.MAX_SAFE_INTEGER / normalized.length)
  ) {
    throw new Error(
      "The workload exceeds the safe numeric range; reduce arrival times or CPU bursts.",
    );
  }
  if (
    algorithm === "RR" &&
    typeof quantum === "number" &&
    normalized.reduce((sum, p) => sum + Math.ceil(p.burst / quantum), 0) > 10000
  ) {
    throw new Error(
      "This workload exceeds 10,000 Round Robin slices; increase the quantum or reduce CPU bursts.",
    );
  }
  return normalized;
}
