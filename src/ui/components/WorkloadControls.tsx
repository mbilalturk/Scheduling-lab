import { useState } from "react";
import { workloads, type WorkloadKey } from "../../workloads.js";

interface Props {
  active: WorkloadKey | "custom";
  onLoad: (workload: WorkloadKey) => void;
}
export function WorkloadControls({ active, onLoad }: Props) {
  const [extra, setExtra] = useState<WorkloadKey>("idle");
  return (
    <section className="workload-controls" aria-labelledby="examples-heading">
      <label id="examples-heading">Start with an example</label>
      <div className="example-buttons">
        <button
          type="button"
          className={active === "A" ? "active" : ""}
          onClick={() => onLoad("A")}
        >
          Workload A <span>4 processes</span>
        </button>
        <button
          type="button"
          className={active === "B" ? "active" : ""}
          onClick={() => onLoad("B")}
        >
          Workload B <span>4 processes</span>
        </button>
      </div>
      <div className="additional-examples">
        <select
          aria-label="Additional test workload"
          value={extra}
          onChange={(event) => setExtra(event.target.value as WorkloadKey)}
        >
          <option value="idle">Test 1 · Idle CPU</option>
          <option value="tie">Test 2 · Simultaneous ties</option>
          <option value="preemption">Test 3 · SRTF preemption</option>
        </select>
        <button
          type="button"
          className="load-test"
          onClick={() => onLoad(extra)}
        >
          Load test
        </button>
      </div>
      <p className="helper example-description">
        {active === "custom"
          ? "Custom workload. Edit any value to explore a different schedule."
          : workloads[active].description}
      </p>
    </section>
  );
}
