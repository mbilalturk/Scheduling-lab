import type { DraftProcess } from "../../application/simulationState.js";

interface Props {
  rows: readonly DraftProcess[];
  onEdit: (
    key: number,
    field: "id" | "arrival" | "burst",
    value: string,
  ) => void;
  onAdd: () => void;
  onRemove: (key: number) => void;
}
export function ProcessEditor({ rows, onEdit, onAdd, onRemove }: Props) {
  return (
    <section aria-labelledby="processes-heading">
      <div className="subheading">
        <h3 id="processes-heading">
          Processes <span className="count">{rows.length}</span>
        </h3>
        <button
          type="button"
          className="text-button"
          onClick={onAdd}
          disabled={rows.length >= 100}
        >
          + Add process
        </button>
      </div>
      <p className="helper">Input order breaks ties after arrival time.</p>
      <div className="editor-scroll">
        <table className="editor-table">
          <thead>
            <tr>
              <th scope="col">ID</th>
              <th scope="col">Arrival</th>
              <th scope="col">Burst</th>
              <th scope="col">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.key}>
                {(["id", "arrival", "burst"] as const).map((field) => (
                  <td key={field}>
                    <input
                      aria-label={`${field === "id" ? "Process ID" : field === "arrival" ? "Arrival time" : "CPU burst"}, row ${index + 1}`}
                      type={field === "id" ? "text" : "number"}
                      min={field === "arrival" ? 0 : 1}
                      step={1}
                      maxLength={field === "id" ? 80 : undefined}
                      value={row[field]}
                      onChange={(event) =>
                        onEdit(row.key, field, event.target.value)
                      }
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </td>
                ))}
                <td>
                  <button
                    type="button"
                    className="remove-button"
                    aria-label={`Remove process row ${index + 1}`}
                    onClick={() => onRemove(row.key)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden="true"
                    >
                      <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 10v7m4-7v7" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && (
        <p className="empty-rows">
          No processes yet. Add a process or load an example.
        </p>
      )}
    </section>
  );
}
