import {
  getLastRun,
  type Action,
  type SimulationState,
} from "../../application/simulationState.js";
import { WorkloadControls } from "./WorkloadControls.js";
import { ProcessEditor } from "./ProcessEditor.js";
import { AlgorithmPicker } from "./AlgorithmPicker.js";
import { workloadLabel } from "../runLabel.js";

interface Props {
  state: SimulationState;
  onAction: (action: Action) => void;
}
export function ConfigurationForm({ state, onAction }: Props) {
  const stale =
    getLastRun(state.outcome) !== null && state.outcome.status !== "success";
  return (
    <form
      className="configuration panel"
      noValidate
      aria-labelledby="configuration-heading"
      onSubmit={(event) => {
        event.preventDefault();
        onAction({ type: "run" });
      }}
    >
      <div className="section-heading">
        <div className="section-title">
          <span className="step-number">1</span>
          <h2 id="configuration-heading">Configure simulation</h2>
        </div>
        <span className="section-note">All inputs for this run</span>
      </div>
      <div className="configuration-body">
        <fieldset className="workload-fields">
          <legend>Workload</legend>
          <WorkloadControls
            active={state.workload}
            onLoad={(workload) => onAction({ type: "load", workload })}
          />
          <ProcessEditor
            rows={state.rows}
            onAdd={() => onAction({ type: "add" })}
            onRemove={(key) => onAction({ type: "remove", key })}
            onEdit={(key, field, value) =>
              onAction({ type: "edit", key, field, value })
            }
          />
        </fieldset>
        <AlgorithmPicker
          algorithm={state.algorithm}
          quantum={state.quantum}
          onChange={(algorithm) => onAction({ type: "algorithm", algorithm })}
          onQuantumChange={(value) => onAction({ type: "quantum", value })}
        />
      </div>
      {state.outcome.status === "error" && (
        <p className="error-message" role="alert">
          {state.outcome.message}
        </p>
      )}
      <div className="action-row">
        <div>
          <span className="summary-label">Next run</span>
          <p className="next-run-summary">
            {workloadLabel(state.workload)} · {state.rows.length} processes ·{" "}
            {state.algorithm}
            {state.algorithm === "RR" ? ` · q = ${state.quantum || "—"}` : ""}
          </p>
        </div>
        <button type="submit" className="run-button">
          <span aria-hidden="true">▶</span>
          {stale ? "Update results" : "Run simulation"}
        </button>
      </div>
      <p className="limits">
        Up to 100 processes · 10,000 Round Robin slices · Integer time units
      </p>
    </form>
  );
}
