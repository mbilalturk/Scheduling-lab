import { useId, useState } from "react";
import { workloads, type WorkloadKey } from "../../workloads.js";

interface Props {
  active: WorkloadKey | "custom";
  onLoad: (workload: WorkloadKey) => void;
}
export function WorkloadControls({ active, onLoad }: Props) {
  const [selected, setSelected] = useState<WorkloadKey>(
    active === "custom" ? "A" : active,
  );
  const pickerId = useId();
  return (
    <div className="workload-controls">
      <label htmlFor={pickerId}>Example to load</label>
      <div className="example-row">
        <select
          id={pickerId}
          value={selected}
          onChange={(event) => setSelected(event.target.value as WorkloadKey)}
        >
          <optgroup label="Assignment workloads">
            <option value="A">Workload A</option>
            <option value="B">Workload B</option>
          </optgroup>
          <optgroup label="Additional tests">
            <option value="idle">Test 1 · Idle CPU</option>
            <option value="tie">Test 2 · Simultaneous ties</option>
            <option value="preemption">Test 3 · SRTF preemption</option>
          </optgroup>
        </select>
        <button
          type="button"
          className="load-test"
          onClick={() => onLoad(selected)}
        >
          Load example
        </button>
      </div>
      <p className="helper example-description">
        {active === "custom"
          ? "Custom workload. Edit any value to explore a different schedule."
          : workloads[active].description}
      </p>
    </div>
  );
}
