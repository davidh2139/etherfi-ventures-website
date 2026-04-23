import React from "react";

const METRICS = [
  {
    label: "Fund I",
    value: "$20M",
    qual: "Committed capital · 2024 vintage",
  },
  {
    label: "Stage",
    value: "PS → A",
    qual: "Pre-seed to Series A · Ethereum & DeFi",
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
          <span className="eyebrow hero__eyebrow">
            ether.fi Ventures · Fund I
          </span>
          <h1 className="display-hero hero__title">
            A crypto-native venture firm built by founders, for founders.
          </h1>
          <p className="hero__kicker">
            Backing the teams building the onchain financial system — alongside one of the largest operating platforms in crypto.
          </p>
        </div>
      </section>

      <section className="metrics">
        <div className="container">
          <div className="metrics__grid">
            {METRICS.map((m, i) => (
              <div key={i} className="metrics__cell">
                <span className="eyebrow">{m.label}</span>
                <span className="metrics__value">{m.value}</span>
                <span className="metrics__qual">{m.qual}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
