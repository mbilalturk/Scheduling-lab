import type { Averages } from "../../core/types.js";
import { formatNumber } from "../format.js";

export function SummaryCards({ averages }: { averages: Averages }) {
  const cards = [
    {
      key: "turnaround",
      name: "Turnaround",
      formula: "Completion − arrival",
      description: "Total time in the system",
    },
    {
      key: "waiting",
      name: "Waiting",
      formula: "Turnaround − CPU burst",
      description: "Total time waiting for CPU",
    },
    {
      key: "response",
      name: "Response",
      formula: "First start − arrival",
      description: "Time until first CPU use",
    },
  ] as const;
  return (
    <div className="summary-grid">
      {cards.map((card) => (
        <section
          className="summary-card"
          key={card.key}
          aria-label={`Average ${card.name.toLowerCase()}`}
        >
          <div className="summary-label">
            <span>AVG. {card.name.toUpperCase()}</span>
          </div>
          <div className="summary-value">
            <strong data-testid={`avg-${card.key}`}>
              {formatNumber(averages[card.key])}
            </strong>
            <span>units</span>
          </div>
          <p>{card.description}</p>
          <div className="summary-formula">{card.formula}</div>
        </section>
      ))}
    </div>
  );
}
