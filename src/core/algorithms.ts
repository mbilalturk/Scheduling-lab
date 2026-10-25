import type { Process, TimelineInterval } from "./types.js";

interface WorkingProcess extends Process {
  readonly order: number;
  remaining: number;
}
type Comparator = (a: WorkingProcess, b: WorkingProcess) => number;
type MutableInterval = { id: string | null; start: number; end: number };

// Only validated records enter here. Mutable working state belongs to one call.
const tie: Comparator = (a, b) => a.arrival - b.arrival || a.order - b.order;

function context(processes: readonly Process[]) {
  const pending = processes
    .map((p, order) => ({ ...p, order, remaining: p.burst }))
    .sort(tie);
  const ready: WorkingProcess[] = [];
  const timeline: MutableInterval[] = [];
  let cursor = 0;
  let time = 0;
  return {
    ready,
    timeline,
    get time() {
      return time;
    },
    get nextArrival() {
      return pending[cursor]?.arrival ?? Infinity;
    },
    get hasWork() {
      return cursor < pending.length || ready.length > 0;
    },
    admit() {
      while (cursor < pending.length && pending[cursor]!.arrival <= time)
        ready.push(pending[cursor++]!);
    },
    emit(id: string | null, duration: number, merge = false) {
      const previous = timeline.at(-1);
      if (merge && previous?.id === id && previous.end === time)
        previous.end += duration;
      else timeline.push({ id, start: time, end: time + duration });
      time += duration;
    },
    prepare() {
      this.admit();
      if (!ready.length && cursor < pending.length) {
        this.emit(null, this.nextArrival - time);
        this.admit();
      }
    },
  };
}

function nonPreemptive(
  processes: readonly Process[],
  compare: Comparator,
): readonly TimelineInterval[] {
  const run = context(processes);
  while (run.hasWork) {
    run.prepare();
    run.ready.sort(compare);
    const current = run.ready.shift()!;
    run.emit(current.id, current.burst);
  }
  return run.timeline;
}

export const fcfs = (processes: readonly Process[]) =>
  nonPreemptive(processes, tie);
export const sjf = (processes: readonly Process[]) =>
  nonPreemptive(processes, (a, b) => a.burst - b.burst || tie(a, b));

export function srtf(
  processes: readonly Process[],
): readonly TimelineInterval[] {
  const run = context(processes);
  let current: WorkingProcess | null = null;
  while (run.hasWork) {
    run.prepare();
    run.ready.sort((a, b) => a.remaining - b.remaining || tie(a, b));
    const candidate = run.ready[0]!;
    // Equality never displaces the running process.
    if (!current || candidate.remaining < current.remaining)
      current = candidate;
    // Reconsider only at an arrival or completion, never on every clock tick.
    const duration = Math.min(current.remaining, run.nextArrival - run.time);
    run.emit(current.id, duration, true);
    current.remaining -= duration;
    if (current.remaining === 0) {
      run.ready.splice(run.ready.indexOf(current), 1);
      current = null;
    }
  }
  return run.timeline;
}

export function roundRobin(
  processes: readonly Process[],
  quantum: number,
): readonly TimelineInterval[] {
  const run = context(processes);
  while (run.hasWork) {
    run.prepare();
    const current = run.ready.shift()!;
    const duration = Math.min(current.remaining, quantum);
    // Do not merge adjacent slices, even if only one process is ready.
    run.emit(current.id, duration);
    current.remaining -= duration;
    // Includes arrivals exactly at the quantum boundary, before requeueing.
    run.admit();
    if (current.remaining > 0) run.ready.push(current);
  }
  return run.timeline;
}
