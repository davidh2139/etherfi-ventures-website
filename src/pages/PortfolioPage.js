import React, { useState } from "react";
import SvgLogo from "../components/SvgLogo";
import Modal from "../components/Modal";
import { PORTFOLIO } from "../config/portfolio";
import { LOGO_MAP } from "../config/logos";

/**
 * Split a legacy stage string ("Seed 2024", "Series A 2025") into
 * (stage, round) for the editorial metadata row. Keeps portfolio.js
 * data untouched.
 */
function parseStage(s) {
  if (!s) return { stage: "", round: "" };
  const parts = s.trim().split(" ");
  const last = parts[parts.length - 1];
  const isYear = /^\d{4}$/.test(last);
  return {
    stage: (isYear ? parts.slice(0, -1).join(" ") : s).toUpperCase(),
    round: isYear ? last : "",
  };
}

export default function PortfolioPage() {
  const [sel, setSel] = useState(null);

  return (
    <section className="section" style={{ minHeight: "100vh" }}>
      <div className="container">
        <div className="section-header">
          <span className="eyebrow">Fund I · 2025 vintage</span>
          <h1 style={{ margin: 0 }}>Portfolio Companies</h1>
        </div>
        <hr className="hairline" style={{ marginBottom: "var(--space-48)" }} />

        <div className="portfolio-grid">
          {PORTFOLIO.map((p, i) => {
            const { stage, round } = parseStage(p.stage);
            return (
              <button
                key={i}
                className="portfolio-card"
                onClick={() => setSel(p)}
                aria-label={`View ${p.name}`}
              >
                <div className="portfolio-card__logo">
                  <SvgLogo url={LOGO_MAP[p.id]} width="180px" height="44px" />
                </div>
                <p className="portfolio-card__desc">{p.desc}</p>
                <div className="portfolio-card__meta">
                  {stage && <span className="portfolio-card__stage">{stage}</span>}
                  {round && <span className="portfolio-card__round">{round}</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <Modal d={sel} onClose={() => setSel(null)} />
    </section>
  );
}
