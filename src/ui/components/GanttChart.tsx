import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { SimulationResult, SchedulingOptions } from "../../core/types.js";
import { createTraceEntries, intervalGeometry } from "../timelineModel.js";
import { formatNumber, processColors } from "../format.js";

interface Props {
  result: SimulationResult;
  options: SchedulingOptions;
}
export function GanttChart({ result, options }: Props) {
  const [zoom, setZoom] = useState(1);
  const [selected, setSelected] = useState(0);
  const intervalRefs = useRef<Array<SVGGElement | null>>([]);
  const chartRef = useRef<HTMLDivElement>(null);
  const [availableWidth, setAvailableWidth] = useState(768);
  useEffect(() => {
    const element = chartRef.current;
    if (!element) return;
    const observer = new ResizeObserver(() =>
      setAvailableWidth(element.clientWidth),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const hatch = useId().replace(/:/g, "");
  const entries = useMemo(() => createTraceEntries(result), [result]);
  const colors = new Map(
    result.metrics.map((p, i) => [
      p.id,
      processColors[i % processColors.length]!,
    ]),
  );
  const horizon = entries.at(-1)!.end;
  const idle = entries.reduce(
    (sum, e) => sum + (e.id === null ? e.duration : 0),
    0,
  );
  const plotWidth = Math.round(
    Math.max(availableWidth - 48, Math.min(12000, entries.length * 72)) * zoom,
  );
  const current = entries[selected]!;
  const traceStart = Math.floor(selected / 8) * 8;
  function focusInterval(index: number) {
    const next = Math.max(0, Math.min(entries.length - 1, index));
    setSelected(next);
    intervalRefs.current[next]?.focus();
  }
  return (
    <section className="timeline-panel" aria-labelledby="timeline-heading">
      <div className="panel-heading">
        <div>
          <h3 id="timeline-heading">CPU timeline</h3>
        </div>
        <div className="zoom-control" role="group" aria-label="Timeline zoom">
          {[1, 1.5, 2].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={zoom === value}
              onClick={() => setZoom(value)}
            >
              {value}×
            </button>
          ))}
        </div>
      </div>
      <div className="timeline-meta">
        <span>
          <i className="status-dot" /> Finishes at{" "}
          <b>{formatNumber(horizon)}</b>
        </span>
        <span>{formatNumber(horizon - idle)} CPU units</span>
        <span>{formatNumber(idle)} idle units</span>
        <span className="policy-badge">
          {options.algorithm}
          {options.algorithm === "RR" ? ` · q = ${options.quantum}` : ""}
        </span>
      </div>
      <div
        className="chart-scroll"
        ref={chartRef}
        tabIndex={0}
        role="region"
        aria-label="Scrollable proportional Gantt chart"
      >
        <svg
          width={plotWidth + 48}
          height="151"
          viewBox={`0 0 ${plotWidth + 48} 151`}
          role="group"
          aria-label="CPU execution intervals; select a block to inspect it"
        >
          <defs>
            <pattern
              id={hatch}
              patternUnits="userSpaceOnUse"
              width="7"
              height="7"
              patternTransform="rotate(45)"
            >
              <rect width="7" height="7" fill="#f3f0eb" />
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="7"
                stroke="#d5cec4"
                strokeWidth="2"
              />
            </pattern>
          </defs>
          {Array.from({ length: 7 }, (_, i) => {
            const x = 24 + (i * plotWidth) / 6;
            return (
              <g key={i} aria-hidden="true">
                <line
                  x1={x}
                  y1="20"
                  x2={x}
                  y2="113"
                  stroke="#e4ddd3"
                  strokeDasharray="3 4"
                />
                <text
                  x={x}
                  y="137"
                  textAnchor={i === 0 ? "start" : i === 6 ? "end" : "middle"}
                  className="axis-label"
                >
                  {formatNumber((horizon * i) / 6)}
                </text>
              </g>
            );
          })}
          {entries.map((entry) => {
            const geometry = intervalGeometry(entry, horizon, plotWidth);
            const x = 24 + geometry.x;
            return (
              <g
                key={entry.index}
                ref={(node) => {
                  intervalRefs.current[entry.index] = node;
                }}
                role="button"
                tabIndex={selected === entry.index ? 0 : -1}
                aria-label={`${entry.id ?? "Idle"}, ${entry.start} to ${entry.end}, duration ${entry.duration}`}
                aria-pressed={selected === entry.index}
                aria-keyshortcuts="ArrowLeft ArrowRight Home End"
                onClick={() => setSelected(entry.index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    setSelected(entry.index);
                  } else if (
                    event.key === "ArrowRight" ||
                    event.key === "ArrowLeft"
                  ) {
                    event.preventDefault();
                    focusInterval(
                      entry.index + (event.key === "ArrowRight" ? 1 : -1),
                    );
                  } else if (event.key === "Home" || event.key === "End") {
                    event.preventDefault();
                    focusInterval(
                      event.key === "Home" ? 0 : entries.length - 1,
                    );
                  }
                }}
                className="chart-block"
              >
                <title>
                  {`${entry.id ?? "Idle"} · [${entry.start}, ${entry.end}) · ${entry.duration} units`}
                </title>
                <rect
                  x={x}
                  y="34"
                  width={geometry.width}
                  height="66"
                  fill={
                    entry.id === null ? `url(#${hatch})` : colors.get(entry.id)
                  }
                  stroke={selected === entry.index ? "#9b421d" : "#fffdfa"}
                  strokeWidth={selected === entry.index ? 2 : 1.5}
                />
                {geometry.width > 35 && (
                  <text
                    x={x + geometry.width / 2}
                    y="62"
                    textAnchor="middle"
                    className="block-label"
                  >
                    {(entry.id ?? "Idle").length > 10
                      ? (entry.id ?? "Idle").slice(0, 8) + "…"
                      : (entry.id ?? "Idle")}
                  </text>
                )}
                {geometry.width > 60 && (
                  <text
                    x={x + geometry.width / 2}
                    y="83"
                    textAnchor="middle"
                    className="block-duration"
                  >
                    {formatNumber(entry.duration)} u
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <div className="legend">
        {result.metrics.map((p, i) => (
          <span key={p.id} title={p.id}>
            <i
              style={{ background: processColors[i % processColors.length] }}
            />
            {p.id}
          </span>
        ))}
        {idle > 0 && (
          <span>
            <i className="idle-swatch" />
            Idle
          </span>
        )}
      </div>
      <div className="interval-inspector" aria-live="polite">
        <div>
          <span className="eyebrow">
            INTERVAL {selected + 1} / {entries.length}
          </span>
          <p>
            <b>{current.id ?? "CPU idle"}</b>{" "}
            <span className="mono">
              [{current.start}, {current.end})
            </span>
          </p>
          <small>
            {current.duration} time {current.duration === 1 ? "unit" : "units"}{" "}
            ·{" "}
            {current.remaining === null
              ? "No process is ready"
              : current.remaining === 0
                ? "Process completed"
                : `${current.remaining} CPU units remaining`}
          </small>
        </div>
        <div className="inspector-actions">
          <button
            type="button"
            aria-label="Previous interval"
            disabled={selected === 0}
            onClick={() => setSelected(selected - 1)}
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next interval"
            disabled={selected === entries.length - 1}
            onClick={() => setSelected(selected + 1)}
          >
            →
          </button>
        </div>
      </div>
      <details className="trace-details">
        <summary>
          View exact execution trace <span>{entries.length} intervals</span>
        </summary>
        <p className="helper">
          Use Left/Right arrows, Home or End to navigate the chart. Widths use a
          proportional time scale. Very short intervals can be inspected here.
          RR boundaries are retained even for the same process.
        </p>
        <div className="table-scroll">
          <table className="trace-table">
            <thead>
              <tr>
                <th>Interval</th>
                <th>Process</th>
                <th>Start</th>
                <th>End</th>
                <th>Duration</th>
                <th>Remaining</th>
              </tr>
            </thead>
            <tbody>
              {entries.slice(traceStart, traceStart + 8).map((e) => (
                <tr
                  key={e.index}
                  className={e.index === selected ? "current-trace" : ""}
                >
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelected(e.index)}
                      aria-label={`Inspect interval ${e.index + 1}`}
                    >
                      {e.index + 1}
                    </button>
                  </td>
                  <td>{e.id ?? "Idle"}</td>
                  <td>{e.start}</td>
                  <td>{e.end}</td>
                  <td>{e.duration}</td>
                  <td>{e.remaining ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="trace-pagination">
          <span>
            Showing {traceStart + 1}–{Math.min(traceStart + 8, entries.length)}{" "}
            of {entries.length}
          </span>
          <button
            type="button"
            disabled={traceStart === 0}
            onClick={() => setSelected(traceStart - 8)}
          >
            Previous 8
          </button>
          <button
            type="button"
            disabled={traceStart + 8 >= entries.length}
            onClick={() => setSelected(traceStart + 8)}
          >
            Next 8
          </button>
        </div>
      </details>
    </section>
  );
}
