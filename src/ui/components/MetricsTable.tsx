import type { ProcessMetrics } from "../../core/types.js";
import { processColors } from "../format.js";

export function MetricsTable({
  metrics,
}: {
  metrics: readonly ProcessMetrics[];
}) {
  return (
    <section className="metrics-panel" aria-labelledby="metrics-heading">
      <div className="panel-heading">
        <div>
          <h3 id="metrics-heading">Process metrics</h3>
        </div>
        <span className="quiet-badge">Input order preserved</span>
      </div>
      <div
        className="table-scroll"
        tabIndex={0}
        role="region"
        aria-label="Scrollable process metrics"
      >
        <table className="metrics-table">
          <thead>
            <tr>
              {[
                "Process",
                "Arrival",
                "Burst",
                "First start",
                "Completion",
                "Turnaround",
                "Waiting",
                "Response",
              ].map((label) => (
                <th scope="col" key={label}>
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((row, index) => (
              <tr key={row.id}>
                <th scope="row" title={row.id}>
                  <span className="process-label">
                    <i
                      style={{
                        background: processColors[index % processColors.length],
                      }}
                    />
                    {row.id}
                  </span>
                </th>
                {(
                  [
                    "arrival",
                    "burst",
                    "firstStart",
                    "completion",
                    "turnaround",
                    "waiting",
                    "response",
                  ] as const
                ).map((key) => (
                  <td key={key}>{row[key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="table-note">
        Exact per-process values · Average values are rounded to 3 decimal
        places.
      </p>
    </section>
  );
}
