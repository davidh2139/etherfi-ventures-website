import React, { useState } from "react";
import SvgLogo from "../components/SvgLogo";
import Modal from "../components/Modal";
import { PORTFOLIO } from "../config/portfolio";
import { LOGO_MAP } from "../config/logos";
import { c } from "../config/theme";

export default function PortfolioPage() {
  const [sel, setSel] = useState(null);

  return (
    <section
      style={{
        minHeight: "100vh",
        padding: "120px 0 80px",
        // background removed
      }}
    >
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 40px" }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 24px",
          }}
        >
          Portfolio Companies
        </h1>
        <hr style={{ border: "none", borderTop: "2px solid #ffffff20", margin: "0 0 40px" }} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {PORTFOLIO.map((p, i) => (
            <div
              key={i}
              onClick={() => setSel(p)}
              style={{
                padding: 24,
                borderRadius: 16,
                border: "1px solid #ffffff20",
                background: "rgba(255,255,255,0.05)",
                cursor: "pointer",
                transition: "all 0.25s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 140,
                overflow: "hidden",
              }}
            >
              <SvgLogo url={LOGO_MAP[p.id]} width="90%" height="80px" />
            </div>
          ))}
        </div>
      </div>

      <Modal d={sel} onClose={() => setSel(null)} />
    </section>
  );
}