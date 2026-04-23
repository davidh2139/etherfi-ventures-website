import React, { useState } from "react";
import { NEWS } from "../config/news";
import { TOKENS } from "../config/theme";

export default function NewsPage() {
  const [cat, setCat] = useState("All");
  const cats = ["All", "Portfolio News", "Insights"];
  const filtered = cat === "All" ? NEWS : NEWS.filter((n) => n.cat === cat);

  return (
    <section className="section" style={{ minHeight: "100vh" }}>
      <div className="container container--narrow">
        <div className="section-header">
          <span className="eyebrow">Press &amp; writing</span>
          <h1 style={{ margin: 0 }}>News &amp; Insights</h1>
        </div>

        {/* Filter tabs — editorial, not pills */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-24)",
            paddingBottom: "var(--space-24)",
            borderBottom: `1px solid ${TOKENS.border.subtle}`,
            marginBottom: "var(--space-48)",
          }}
        >
          {cats.map((ct) => {
            const active = cat === ct;
            return (
              <span
                key={ct}
                onClick={() => setCat(ct)}
                className="eyebrow"
                style={{
                  cursor: "pointer",
                  color: active ? TOKENS.text.primary : TOKENS.text.tertiary,
                  borderBottom: active
                    ? `1px solid ${TOKENS.accent.primary}`
                    : "1px solid transparent",
                  paddingBottom: 6,
                  transition: `color ${TOKENS.motion.fast}, border-color ${TOKENS.motion.fast}`,
                }}
              >
                {ct}
              </span>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{ color: TOKENS.text.tertiary }}>No posts yet.</p>
        )}

        {filtered.map((b, i) => (
          <a
            key={i}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "var(--space-24) 0",
              borderBottom: `1px solid ${TOKENS.border.subtle}`,
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <span
                style={{
                  fontFamily: TOKENS.font.serif,
                  fontSize: 20,
                  fontWeight: 400,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                  color: TOKENS.text.primary,
                }}
              >
                {b.title}
              </span>
              <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                <span className="eyebrow">{b.cat}</span>
                <span
                  className="numeric"
                  style={{
                    fontSize: 12,
                    color: TOKENS.text.tertiary,
                  }}
                >
                  {b.date}
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
