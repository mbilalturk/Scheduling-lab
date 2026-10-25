import type { Algorithm } from "../../core/types.js";

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
}
export function AlgorithmPicker({ algorithm, onChange }: Props) {
  return (
    <div
      className="algorithm-picker"
      role="group"
      aria-label="Scheduling algorithm"
    >
      {(Object.keys(algorithmInfo) as Algorithm[]).map((id, index) => (
        <button
          key={id}
          type="button"
          aria-pressed={algorithm === id}
          onClick={() => onChange(id)}
          className={`algorithm-option ${algorithm === id ? "selected" : ""}`}
        >
          <span className="algorithm-top">
            <span className="algorithm-code">{id}</span>
            <span className="algorithm-number">0{index + 1}</span>
          </span>
          <span className="algorithm-name">{algorithmInfo[id].name}</span>
          <span className="algorithm-kind">
            {algorithmInfo[id].kind}
            {algorithm === id && <span aria-hidden="true"> ↗</span>}
          </span>
        </button>
      ))}
    </div>
  );
}
