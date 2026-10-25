import type {
  Algorithm,
  SchedulingOptions,
  SimulationResult,
} from "../core/types.js";
import { workloads, type WorkloadKey } from "../workloads.js";
import { runSimulation } from "../core/runSimulation.js";

export interface DraftProcess {
  readonly key: number;
  readonly id: string;
  readonly arrival: string;
  readonly burst: string;
}
export interface RunSnapshot {
  readonly result: SimulationResult;
  readonly options: SchedulingOptions;
  readonly workload: WorkloadKey | "custom";
  readonly revision: number;
}
export type Outcome =
  | { readonly status: "draft"; readonly previousRun: RunSnapshot | null }
  | {
      readonly status: "error";
      readonly message: string;
      readonly previousRun: RunSnapshot | null;
    }
  | ({ readonly status: "success" } & RunSnapshot);

/** Read the last successful run independently from the editable draft. */
export function getLastRun(outcome: Outcome): RunSnapshot | null {
  return outcome.status === "success" ? outcome : outcome.previousRun;
}
export interface SimulationState {
  readonly rows: readonly DraftProcess[];
  readonly nextKey: number;
  readonly algorithm: Algorithm;
  readonly quantum: string;
  readonly workload: WorkloadKey | "custom";
  readonly revision: number;
  readonly outcome: Outcome;
}
export type Action =
  | {
      type: "edit";
      key: number;
      field: "id" | "arrival" | "burst";
      value: string;
    }
  | { type: "add" }
  | { type: "remove"; key: number }
  | { type: "load"; workload: WorkloadKey }
  | { type: "algorithm"; algorithm: Algorithm }
  | { type: "quantum"; value: string }
  | { type: "run" };

export function createInitialState(): SimulationState {
  const rows = draftRows("A", 0);
  return {
    rows,
    nextKey: rows.length,
    algorithm: "FCFS",
    quantum: "2",
    workload: "A",
    revision: 0,
    outcome: { status: "draft", previousRun: null },
  };
}

function draftRows(workload: WorkloadKey, firstKey: number): DraftProcess[] {
  return workloads[workload].processes.map((p, index) => ({
    key: firstKey + index,
    id: p.id,
    arrival: String(p.arrival),
    burst: String(p.burst),
  }));
}

const numeric = (text: string): number =>
  text.trim() === "" ? NaN : Number(text);

/** Edits invalidate freshness, not the last successful result or its context. */
export function simulationReducer(
  state: SimulationState,
  action: Action,
): SimulationState {
  const draft: SimulationState = {
    ...state,
    revision: state.revision + 1,
    outcome: { status: "draft", previousRun: getLastRun(state.outcome) },
  };
  switch (action.type) {
    case "edit":
      return {
        ...draft,
        workload: "custom",
        rows: state.rows.map((row) =>
          row.key === action.key
            ? { ...row, [action.field]: action.value }
            : row,
        ),
      };
    case "add": {
      if (state.rows.length >= 100) return state;
      const ids = new Set(state.rows.map((row) => row.id.trim()));
      let number = 1;
      while (ids.has(`P${number}`)) number++;
      return {
        ...draft,
        workload: "custom",
        nextKey: state.nextKey + 1,
        rows: [
          ...state.rows,
          { key: state.nextKey, id: `P${number}`, arrival: "0", burst: "1" },
        ],
      };
    }
    case "remove":
      return {
        ...draft,
        workload: "custom",
        rows: state.rows.filter((row) => row.key !== action.key),
      };
    case "load": {
      const rows = draftRows(action.workload, state.nextKey);
      return {
        ...draft,
        workload: action.workload,
        rows,
        nextKey: state.nextKey + rows.length,
      };
    }
    case "algorithm":
      return { ...draft, algorithm: action.algorithm };
    case "quantum":
      return { ...draft, quantum: action.value };
    case "run": {
      try {
        const input = state.rows.map((row) => ({
          id: row.id,
          arrival: numeric(row.arrival),
          burst: numeric(row.burst),
        }));
        const options: SchedulingOptions =
          state.algorithm === "RR"
            ? { algorithm: "RR", quantum: numeric(state.quantum) }
            : { algorithm: state.algorithm };
        const result = runSimulation(input, options);
        return {
          ...draft,
          outcome: {
            status: "success",
            result,
            options,
            workload: state.workload,
            revision: draft.revision,
          },
        };
      } catch (error) {
        return {
          ...draft,
          outcome: {
            status: "error",
            previousRun: getLastRun(state.outcome),
            message:
              error instanceof Error
                ? error.message
                : "Unable to run this workload.",
          },
        };
      }
    }
  }
}
