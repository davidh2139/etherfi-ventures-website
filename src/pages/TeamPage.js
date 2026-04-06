import React, { useState } from "react";
import { TEAM_CORE, TEAM_ADV } from "../config/team";

export default function TeamPage() {
  const [sel, setSel] = useState(null);

  function row(m, k) {
    const open = sel === k;
    return (
      <div
        key={k}
        onClick={() => setSel(open ? null : k)}
        style={{
          padding: "20px 0",
          borderBottom: "1px solid #ffffff20",
          cursor: "pointer",
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
          {/* Left: Name */}
          <span style={{ fontSize: 19, fontWeight: 600, color: "#ffffff" }}>
            {m.name}
          </span>

          {/* Right side: Role/Title + X box */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 15, color: "#aaaaaa" }}>
              {m.role || m.title}
            </span>

            {/* X Logo Box - now on the right of the role */}
            {m.tw && (
              <a
                href={"https://x.com/" + m.tw}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  border: "1px solid #ffffff30",
                  backgroundColor: "#ffffff10",
                  color: "#ffffff",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        <div
          style={{
            maxHeight: open ? 280 : 0,
            opacity: open ? 1 : 0,
            overflow: "hidden",
            transition: "all 0.3s ease",
          }}
        >
          <p
            style={{
              fontSize: 18,
              color: "#cccccc",
              lineHeight: 1.8,
              padding: "14px 0 12px",
              margin: 0,
            }}
          >
            {m.bio}
          </p>

          {/* Substack link */}
          {m.substack && (
            <p style={{ margin: "0 0 8px 0" }}>
              <span style={{ color: "#cccccc", fontSize: 18 }}>
                Writing at{" "}
              </span>
              <a
                href={m.substack}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                style={{
                  color: "#29BCFA",
                  textDecoration: "none",
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {m.substack.replace("https://", "")}
              </a>
            </p>
          )}
        </div>
      </div>
    );
  }

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
            fontSize: 36,
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 48px",
          }}
        >
          Team
        </h1>

        {TEAM_CORE.map((m, i) => row(m, "c" + i))}

        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#aaaaaa",
            marginTop: 40,
            marginBottom: 20,
          }}
        >
          Investment Committee Advisors
        </div>

        {TEAM_ADV.map((m, i) => row(m, "a" + i))}
      </div>
    </section>
  );
}