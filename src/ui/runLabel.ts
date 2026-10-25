import type { WorkloadKey } from "../workloads.js";

const names: Record<WorkloadKey | "custom", string> = {
  A: "Workload A",
  B: "Workload B",
  idle: "Idle CPU test",
  tie: "Simultaneous ties test",
  preemption: "SRTF preemption test",
  custom: "Custom workload",
};
export function workloadLabel(workload: WorkloadKey | "custom") {
  return names[workload];
}
