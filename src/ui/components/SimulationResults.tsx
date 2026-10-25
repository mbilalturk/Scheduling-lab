import { memo } from "react";
import {
  getLastRun,
  type Outcome,
  type RunSnapshot,
} from "../../application/simulationState.js";
import { GanttChart } from "./GanttChart.js";
import { SummaryCards } from "./SummaryCards.js";
import { MetricsTable } from "./MetricsTable.js";
import { workloadLabel } from "../runLabel.js";

// Editing a draft must not redraw a potentially large, unchanged timeline.
const RunContent = memo(function RunContent({ run }: { run: RunSnapshot }) {
  return (
    <div data-testid="results">
      <GanttChart
        key={run.revision}
        result={run.result}
        options={run.options}
      />
      <SummaryCards averages={run.result.averages} />
      <MetricsTable metrics={run.result.metrics} />
    </div>
  );
});

export function SimulationResults({ outcome }: { outcome: Outcome }) {
  const run = getLastRun(outcome);
  const stale = run !== null && outcome.status !== "success";
  return (
    <section className="results-panel panel" aria-labelledby="results-heading">
      <div className="section-heading">
        <div>
          <div className="section-title">
            <span className="step-number">2</span>
            <h2 id="results-heading">Simulation results</h2>
          </div>
          {run && (
            <p className="result-context" data-testid="result-context">
              {workloadLabel(run.workload)} · {run.options.algorithm}
              {run.options.algorithm === "RR"
                ? ` · q = ${run.options.quantum}`
                : ""}{" "}
              · {run.result.metrics.length} processes
            </p>
          )}
        </div>
        <span className={`result-status ${stale ? "stale" : ""}`} role="status">
          {run ? (stale ? "Previous run" : "Up to date") : "Not run yet"}
        </span>
      </div>
      {stale && (
        <p className="stale-notice" role="status">
          Inputs changed. The results below belong to the previous run.{" "}
          {outcome.status === "error"
            ? "Fix the input error, then update results."
            : "Select Update results to apply your changes."}
        </p>
      )}
      {run ? (
        <RunContent run={run} />
      ) : (
        <div className="empty-results">
          <h3>Ready for your first run.</h3>
          <p>
            Configure the workload and policy above, then run the simulation.
          </p>
        </div>
      )}
    </section>
  );
}
