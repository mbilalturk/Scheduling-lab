/** Validated input, independent of React, HTML fields and execution state. */
export interface Process {
  readonly id: string;
  readonly arrival: number;
  readonly burst: number;
}

export type Algorithm = "FCFS" | "SJF" | "SRTF" | "RR";
export type SchedulingOptions =
  | { readonly algorithm: Exclude<Algorithm, "RR"> }
  | { readonly algorithm: "RR"; readonly quantum: number };

export interface TimelineInterval {
  readonly id: string | null;
  readonly start: number;
  readonly end: number;
}

export interface ProcessMetrics extends Process {
  readonly firstStart: number;
  readonly completion: number;
  readonly turnaround: number;
  readonly waiting: number;
  readonly response: number;
}

export interface Averages {
  readonly turnaround: number;
  readonly waiting: number;
  readonly response: number;
}

export interface SimulationResult {
  readonly timeline: readonly TimelineInterval[];
  readonly metrics: readonly ProcessMetrics[];
  readonly averages: Averages;
}
