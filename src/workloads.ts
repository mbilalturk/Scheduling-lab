import type { Process } from "./core/types.js";

export type WorkloadKey = "A" | "B" | "idle" | "tie" | "preemption";
export interface Workload {
  readonly description: string;
  readonly processes: readonly Process[];
}
// Editable examples only; tests deliberately keep their own independent fixtures.
export const workloads: Readonly<Record<WorkloadKey, Workload>> = {
  A: {
    description: "Long first job followed by shorter arrivals.",
    processes: [
      { id: "P1", arrival: 0, burst: 8 },
      { id: "P2", arrival: 1, burst: 4 },
      { id: "P3", arrival: 2, burst: 2 },
      { id: "P4", arrival: 4, burst: 1 },
    ],
  },
  B: {
    description: "Simultaneous arrivals, idle intervals and an SRTF equality.",
    processes: [
      { id: "P1", arrival: 2, burst: 3 },
      { id: "P2", arrival: 2, burst: 1 },
      { id: "P3", arrival: 8, burst: 2 },
      { id: "P4", arrival: 9, burst: 1 },
    ],
  },
  idle: {
    description: "Expected idle intervals: [0, 3) and [5, 8).",
    processes: [
      { id: "P1", arrival: 3, burst: 2 },
      { id: "P2", arrival: 8, burst: 1 },
    ],
  },
  tie: {
    description:
      "P2 precedes P1 in input order. SJF/SRTF must first choose P3.",
    processes: [
      { id: "P2", arrival: 0, burst: 2 },
      { id: "P1", arrival: 0, burst: 2 },
      { id: "P3", arrival: 0, burst: 1 },
    ],
  },
  preemption: {
    description:
      "SRTF cuts P1 at time 1, but keeps P2 running on equality at time 2.",
    processes: [
      { id: "P1", arrival: 0, burst: 5 },
      { id: "P2", arrival: 1, burst: 2 },
      { id: "P3", arrival: 2, burst: 1 },
    ],
  },
};
