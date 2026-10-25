import { useReducer } from "react";
import {
  createInitialState,
  simulationReducer,
} from "../application/simulationState.js";
import {
  AlgorithmPicker,
  algorithmInfo,
} from "./components/AlgorithmPicker.js";
import { WorkloadControls } from "./components/WorkloadControls.js";
import { ProcessEditor } from "./components/ProcessEditor.js";
import { SummaryCards } from "./components/SummaryCards.js";
import { GanttChart } from "./components/GanttChart.js";
import { MetricsTable } from "./components/MetricsTable.js";

export function App() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, () =>
    simulationReducer(createInitialState(), { type: "run" }),
  );
  const { outcome } = state;
  return (
    <>
      <header className="topbar">
        <a className="brand" href="./" aria-label="Scheduling Lab home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="6" y="6" width="12" height="12" rx="2" />
              <path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4" />
            </svg>
          </span>
          <span>
            Scheduling<span className="brand-light">Lab</span>
          </span>
        </a>
        <div className="topbar-right">
          <span className="model-pill">
            <i /> Single CPU model
          </span>
          <span className="course-label">CSE513 / ASSIGNMENT 01</span>
        </div>
      </header>
      <main>
        <section className="intro">
          <div>
            <p className="eyebrow">EXPERIMENT. TRACE. UNDERSTAND.</p>
            <h1>Every process has a timeline.</h1>
            <p className="intro-description">
              Explore how scheduling decisions shape waiting, response, and
              completion.
            </p>
          </div>
          <div className="intro-note">
            <span>04</span>
            <p>
              scheduling
              <br />
              policies, one CPU.
            </p>
          </div>
        </section>
        <AlgorithmPicker
          algorithm={state.algorithm}
          onChange={(algorithm) => dispatch({ type: "algorithm", algorithm })}
        />
        <div className="workspace">
          <aside
            className="configuration panel"
            aria-labelledby="configuration-heading"
          >
            <div className="panel-heading">
              <div>
                <span className="eyebrow">01 / SET UP</span>
                <h2 id="configuration-heading">Your workload</h2>
              </div>
              <span className="quiet-badge">Editable</span>
            </div>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault();
                dispatch({ type: "run" });
              }}
            >
              <WorkloadControls
                active={state.workload}
                onLoad={(workload) => dispatch({ type: "load", workload })}
              />
              <div className="divider" />
              <ProcessEditor
                rows={state.rows}
                onAdd={() => dispatch({ type: "add" })}
                onRemove={(key) => dispatch({ type: "remove", key })}
                onEdit={(key, field, value) =>
                  dispatch({ type: "edit", key, field, value })
                }
              />
              <div className="quantum-row">
                <div>
                  <label htmlFor="quantum">Time quantum</label>
                  <p className="helper">Used by Round Robin only</p>
                </div>
                <input
                  id="quantum"
                  aria-label="Time quantum"
                  type="number"
                  min="1"
                  step="1"
                  value={state.quantum}
                  disabled={state.algorithm !== "RR"}
                  onChange={(event) =>
                    dispatch({ type: "quantum", value: event.target.value })
                  }
                />
              </div>
              <div className="policy-note">
                <span>
                  {state.algorithm} / {algorithmInfo[state.algorithm].kind}
                </span>
                <p>{algorithmInfo[state.algorithm].description}</p>
              </div>
              {outcome.status === "error" && (
                <p className="error-message" role="alert">
                  {outcome.message}
                </p>
              )}
              <button type="submit" className="run-button">
                <span aria-hidden="true">▶</span> Run simulation{" "}
                <span className="run-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
              <p className="limits">100 processes max · 10,000 RR slices max</p>
            </form>
          </aside>
          <section className="results-column" aria-labelledby="results-heading">
            <div className="results-heading">
              <div>
                <span className="eyebrow">02 / OBSERVE</span>
                <h2 id="results-heading">Simulation results</h2>
              </div>
              <span className={`result-status ${outcome.status}`} role="status">
                <i />
                {outcome.status === "success"
                  ? "Simulation complete"
                  : outcome.status === "error"
                    ? "Check your inputs"
                    : "Inputs changed · run to update"}
              </span>
            </div>
            {outcome.status === "success" ? (
              <div data-testid="results">
                <SummaryCards averages={outcome.result.averages} />
                <GanttChart
                  key={state.revision}
                  result={outcome.result}
                  options={outcome.options}
                />
                <MetricsTable metrics={outcome.result.metrics} />
              </div>
            ) : (
              <div className="empty-results panel">
                <span className="empty-icon" aria-hidden="true">
                  ▥
                </span>
                <h3>
                  {outcome.status === "error"
                    ? "Let’s check that workload."
                    : "Ready for a new experiment."}
                </h3>
                <p>
                  {outcome.status === "error"
                    ? "Fix the highlighted input issue and run again."
                    : "Run the simulation to see the timeline and metrics for your current inputs."}
                </p>
                <span>Current policy: {state.algorithm}</span>
              </div>
            )}
            <div className="reading-note">
              <span className="note-icon" aria-hidden="true">
                i
              </span>
              <p>
                <b>First response is not total waiting.</b> A process can start
                immediately, then wait again after its time slice ends. Compare
                both metrics to see the difference.
              </p>
            </div>
          </section>
        </div>
        <footer>
          <span>CPU SCHEDULING LAB</span>
          <p>
            One CPU · One burst per process · No I/O · Zero context-switch cost
            <br />A policy simulator, not Ubuntu’s actual scheduler. Times are
            abstract units.
          </p>
          <span className="footer-note">Built to make decisions visible.</span>
        </footer>
      </main>
    </>
  );
}
