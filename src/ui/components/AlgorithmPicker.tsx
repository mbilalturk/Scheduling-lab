import type { Algorithm } from "../../core/types.js";
import { useId } from "react";

export const algorithmInfo: Record<
  Algorithm,
  { name: string; description: string; kind: string }
> = {
  FCFS: {
    name: "First come, first served",
    description:
      "Choose the earliest arrival. A running process finishes its entire burst.",
    kind: "Non-preemptive",
  },
  SJF: {
    name: "Shortest job first",
    description:
      "Choose the shortest ready burst when the CPU becomes free. Ties use arrival, then input order.",
    kind: "Non-preemptive",
  },
  SRTF: {
    name: "Shortest remaining time",
    description:
      "Preempt only for a strictly shorter remaining time. Keep the current process on equality.",
    kind: "Preemptive",
  },
  RR: {
    name: "Round Robin",
    description:
      "Share the CPU in time slices. Boundary arrivals join the queue before the unfinished runner.",
    kind: "Time-sharing",
  },
};

interface Props {
  algorithm: Algorithm;
  onChange: (algorithm: Algorithm) => void;
  quantum: string;
  onQuantumChange: (value: string) => void;
}
export function AlgorithmPicker({
  algorithm,
  onChange,
  quantum,
  onQuantumChange,
}: Props) {
  const groupId = useId();
  return (
    <fieldset className="policy-fields">
      <legend>Scheduling policy</legend>
      <div className="algorithm-picker">
        {(Object.keys(algorithmInfo) as Algorithm[]).map((id) => (
          <label
            key={id}
            className={`algorithm-option ${algorithm === id ? "selected" : ""}`}
          >
            <input
              type="radio"
              name={groupId}
              value={id}
              checked={algorithm === id}
              onChange={() => onChange(id)}
              aria-label={`${id} · ${algorithmInfo[id].name}`}
            />
            <span>
              <b className="algorithm-code">{id}</b>
              <span className="algorithm-name">{algorithmInfo[id].name}</span>
            </span>
          </label>
        ))}
      </div>
      <p className="policy-note" id={`${groupId}-hint`}>
        {algorithmInfo[algorithm].description}
      </p>
      {algorithm === "RR" && (
        <div className="quantum-row">
          <div>
            <label htmlFor={`${groupId}-quantum`}>Time quantum</label>
            <p className="helper" id={`${groupId}-quantum-hint`}>
              Maximum CPU time per turn.
            </p>
          </div>
          <input
            id={`${groupId}-quantum`}
            aria-label="Time quantum"
            aria-describedby={`${groupId}-quantum-hint`}
            type="number"
            min="1"
            step="1"
            value={quantum}
            onChange={(event) => onQuantumChange(event.target.value)}
          />
        </div>
      )}
    </fieldset>
  );
}
