import React, { useState } from "react";
import { NEWS } from "../config/news";
import { BRAND } from "../config/theme";

export default function NewsPage() {
  const [cat, setCat] = useState("All");
  const cats = ["All", "Portfolio News", "Insights"];
  const filtered =
    cat === "All" ? NEWS : NEWS.filter((n) => n.cat === cat);

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "120px 0 80px",
      }}
    >
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 40px" }}>
        <h1
          style={{
            fontSize: 36,                    // unchanged (as requested)
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 24px",
          }}
        >
          News & Insights
        </h1>

        {/* Filter pills — bigger */}
        <div style={{ display: "flex", gap: 10, marginBottom: 40 }}>
          {cats.map((ct) => {
            const active = cat === ct;
            return (
              <span
                key={ct}
                onClick={() => setCat(ct)}
                style={{
                  fontSize: 15,                    // ~25% bigger
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: "8px 18px",
                  borderRadius: 100,
                  border: "1px solid " + (active ? BRAND.cyan + "60" : "#ffffff30"),
                  color: active ? BRAND.cyan : "#ffffff",
                  background: active ? BRAND.cyan + "12" : "transparent",
                }}
              >
                {ct}
              </span>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <p style={{ fontSize: 18, color: "#aaaaaa" }}>No posts yet.</p>
        )}

        {filtered.map((b, i) => (
          <a
            key={i}
            href={b.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "28px 0",               // more breathing room
              borderBottom: "1px solid #ffffff20",
              textDecoration: "none",
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
              <span style={{ fontSize: 20, fontWeight: 600, color: "#ffffff" }}>
                {b.title}
              </span>
              <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                <span
                  style={{
                    fontSize: 14,               // bigger
                    fontWeight: 600,
                    color: BRAND.cyan,
                    textTransform: "uppercase",
                  }}
                >
                  {b.cat}
                </span>
                <span style={{ fontSize: 15, color: "#aaaaaa" }}>
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