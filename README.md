# Scheduling Lab · React + TypeScript

A browser-based CPU scheduling simulator for CSE513. Implements FCFS, non-preemptive SJF, SRTF and Round Robin with the assignment's exact tie, arrival and quantum-boundary rules.

## Run locally

Requires Node.js **20.19+ in the 20.x line, or 22.12+**, and a modern browser. Tested here on Node 22.20.0. Dependencies are pinned and recorded in package-lock.json.

```sh
npm ci
npm start
```

Open http://127.0.0.1:5174. The development server uses a strict port. Stop with Ctrl+C. On Windows use `npm.cmd` if PowerShell blocks `npm.ps1`.

```sh
npm test          # compile TypeScript core + JS tests, then run Node tests
npm run typecheck # strict checking of core, React and compile-time contract tests
npm run build     # typecheck + production static bundle in dist/
npm run preview   # serve production bundle at http://127.0.0.1:4173
```

The production output is static HTML/CSS/JS. No application backend, database, account or runtime server is needed for hosting. Vite is local development/build tooling. Do not open index.html with file://.

## Architecture and ownership

```text
React components → application reducer/form adapter → pure scheduling core
                            ↓                              ↓
                 draft / error / success        timeline + metrics + averages
                            ↓                              ↓
                       React views ← presentation-only trace/geometry
```

| Path | Responsibility |
| --- | --- |
| src/core/types.ts | Readonly process, interval, result and scheduling option contracts |
| src/core/simulate.ts | Original public API; validate → schedule → derive metrics |
| src/core/runSimulation.ts | Typed options API; RR requires quantum |
| src/core/algorithms.ts | Pure FCFS/SJF/SRTF/RR functions; per-run mutable working state |
| src/core/validation.ts | Runtime validation, normalization and resource bounds |
| src/core/metrics.ts | First start/completion and metrics derived from timeline |
| src/application/simulationState.ts | Draft fields, stable row keys and pure reducer transitions |
| src/ui/App.tsx | React application composition; useReducer owns form/result state |
| src/ui/components/ | Workload editor, algorithm controls, summaries, chart, metrics |
| src/ui/timelineModel.ts | Trace remaining-time and proportional geometry; no scheduling decisions |
| src/workloads.ts | Editable A/B and three student-designed examples |
| tests/manual-cases.js | Original independent hand-calculated expected results |
| type-tests/contracts.ts | Compile-time checks for required quantum and readonly contracts |

Core has no React/DOM/network dependencies. Each algorithm copies inputs into its private working records, so runs cannot leak state. Public `readonly` contracts prevent accidental mutation at compile time; runtime immutability of caller inputs is also tested.

DraftProcess fields are strings to preserve empty input while editing. The application converts them to numeric Process records only on Run. Empty strings become NaN, not zero, and validation explains the error. React row keys are separate from editable process IDs. Input edits atomically replace the previous outcome with draft; an error and an old successful result cannot coexist.

The timeline is authoritative for execution; metrics and the interval inspector derive from it. The inspector does not rerun the scheduler. Selection and zoom are transient presentation state.

## Verification

- The original 63 tests and hand-calculated fixtures were preserved during the TypeScript migration. TypeScript compiles alongside those JS tests into .test-build/, preserving their original .js imports.
- Twelve hand-calculated A/B cases cover FCFS/SJF/SRTF and RR q=1,2,4, with exact timelines, per-process metrics and averages.
- Three additional workloads cover idle gaps, simultaneous ties and SRTF preemption/equality.
- Conservation, arrival, overlap and unnecessary-idle checks run over 320 deterministic workloads.
- New tests cover typed options, draft parsing, stale-result invalidation, row identity, deletion, loading, RR quantum, immutable reducer behavior and chart/trace derivation.
- The current suite has 86 tests, including rendered React regressions for chart keyboard focus and interval tooltip text. On the chart, use Left/Right arrows, Home and End; only one interval is in the Tab sequence.
- Expected values never come from the scheduler under test.
- Test coverage, browser checks and regression examples are documented in [Verification](docs/verification.md). The Node suite is reproducible via npm test; browser checks are not an installed E2E runner.

## Model and limits

- One CPU, one burst per process, no I/O, zero context-switch cost; not Ubuntu's actual scheduler.
- Nonnegative safe-integer arrivals; positive safe-integer bursts and RR quantum.
- Trimmed, case-sensitive, unique IDs of 1–80 characters; up to 100 processes.
- Maximum 10,000 RR execution slices. Excessive workloads are rejected, never silently truncated. Numeric horizons also protect safe arithmetic for average sums.
- Ties: earlier arrival, then input order. SRTF keeps current on equality. RR admits arrivals at the boundary before requeueing its unfinished runner.
- Intervals are [start,end); null process means idle. Consecutive RR slices stay separate.
- Gantt widths are proportional, including idle. Very tiny intervals may be subpixel on large time ranges; the exact paginated trace and previous/next inspector keep every interval accessible. Zoom is presentation only.
- Displayed averages round to three decimals. Form data is transient and resets on reload. No telemetry or remote fonts/assets.

## Static deployment

The repository can be built by a static hosting service using:

- Install: `npm ci`
- Build: `npm run build`
- Publish directory: `dist`

Use a Node version compatible with the engine requirement above. Deploy the generated static files; `npm start` is a local development command, not the production hosting command. Hosting-specific configuration can be added after selecting the provider.

## AI assistance and learning

AI assisted with design, implementation and verification. Original expectations were hand-calculated before simulator execution. Migration retained those expectations and added failing tests before new typed API, application transitions and timeline presentation logic. Expected TDD failures are not represented as accidental implementation bugs.

See [Architecture](docs/react-architecture.md) for the Turkish walkthrough of model boundaries and dependency direction.
