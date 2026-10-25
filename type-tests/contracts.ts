import { runSimulation } from "../src/core/runSimulation.js";
import type { Process, SimulationResult } from "../src/core/types.js";

declare const processes: readonly Process[];
declare const result: SimulationResult;
runSimulation(processes, { algorithm: "RR", quantum: 2 });
runSimulation(processes, { algorithm: "FCFS" });
// @ts-expect-error RR requires a quantum in the typed API.
runSimulation(processes, { algorithm: "RR" });
// @ts-expect-error Unknown policies cannot cross the typed boundary.
runSimulation(processes, { algorithm: "FIFO" });
// @ts-expect-error Public domain input is readonly.
processes[0]!.burst = 5;
// @ts-expect-error Consumers cannot append to the public timeline.
result.timeline.push({ id: "P1", start: 0, end: 3 });
