import { useReducer } from "react";
import {
  createInitialState,
  simulationReducer,
} from "../application/simulationState.js";
import { ConfigurationForm } from "./components/ConfigurationForm.js";
import { SimulationResults } from "./components/SimulationResults.js";

export function App() {
  const [state, dispatch] = useReducer(simulationReducer, undefined, () =>
    simulationReducer(createInitialState(), { type: "run" }),
  );
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
          Scheduling Lab
        </a>
        <span className="course-label">CSE513 · Assignment 01</span>
      </header>
      <main>
        <div className="intro">
          <h1>CPU scheduling simulator</h1>
          <p>Configure one experiment. Run it. Inspect the result.</p>
        </div>
        <div className="workbench">
          <ConfigurationForm state={state} onAction={dispatch} />
          <SimulationResults outcome={state.outcome} />
        </div>
        <footer>
          <p>
            Single CPU · One burst per process · No I/O · Zero context-switch
            cost
          </p>
          <p>
            Time in abstract units. This simulates scheduling policies, not
            Ubuntu’s actual scheduler.
          </p>
        </footer>
      </main>
    </>
  );
}
