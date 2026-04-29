import React from "react";

const METRICS = [
  {
    label: "Fund I",
    value: "$20M",
    qual: "Committed capital · 2025 vintage",
  },
  {
    label: "Stage",
    value: "Pre-Seed → Series A",
    qual: "Intersection of finance, AI, and crypto",
    valueVariant: "text",
  },
  {
    label: "Portfolio",
    value: "5",
    qual: "Active investments",
  },
  {
    label: "Platform",
    value: "$5B+",
    qual: "ether.fi TVL supporting the book",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__atmosphere" aria-hidden="true" />
        <div className="container hero__content">
          <h1 className="display-hero hero__title">
            A crypto-native venture<br />
            firm built by founders,<br />
            for founders.
          </h1>
          <p className="hero__kicker">
            Backing exceptional founders building the future of crypto, alongside one of the industry's largest operating platforms.
          </p>
        </div>
      </section>

      <section className="metrics">
        <div className="container">
          <div className="metrics__grid">
            {METRICS.map((m, i) => (
              <div key={i} className="metrics__cell">
                <span className="eyebrow">{m.label}</span>
                <span className={`metrics__value${m.valueVariant ? ` metrics__value--${m.valueVariant}` : ""}`}>{m.value}</span>
                <span className="metrics__qual">{m.qual}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
