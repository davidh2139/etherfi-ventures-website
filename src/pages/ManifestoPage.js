import React from "react";

const CYAN = "#29BCFA";
const MONO = "'JetBrains Mono', ui-monospace, Menlo, Monaco, Consolas, monospace";

const STATS = [
  { v: "$5B+",     label: "TVL",              desc: "Balance sheet that matters in every integration conversation." },
  { v: "$500M+",   label: "DEPLOYABLE",       desc: "Anchor deposits, launch LPs, first institutional counterparties." },
  { v: "300,000+", label: "USERS",            desc: "A distribution channel startups spend years trying to build." },
  { v: "$1B+",     label: "CARD VOL / YR",    desc: "A working consumer crypto business with real surface area." },
];

const BODY = {
  fontSize: 18,
  lineHeight: 1.6,
  color: "rgba(255,255,255,0.82)",
  margin: "0 0 22px",
};

const BODY_LARGE = {
  ...BODY,
  fontSize: 21,
  lineHeight: 1.55,
  color: "rgba(255,255,255,0.92)",
  margin: "0 0 26px",
};

const EMPHASIS = {
  color: "#ffffff",
  fontWeight: 600,
  borderBottom: `1px dashed ${CYAN}aa`,
  paddingBottom: 1,
};

function SectionLabel({ n, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "72px 0 22px" }}>
      <span style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.22em",
        color: CYAN,
        fontWeight: 500,
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}>
        §{n.toString().padStart(2, "0")} · {children}
      </span>
      <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
    </div>
  );
}

export default function ManifestoPage() {
  return (
    <section style={{ minHeight: "100vh", padding: "100px 0 80px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "0 40px", color: "#ffffff" }}>

        {/* Top meta bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: "0.24em",
          color: "rgba(255,255,255,0.45)",
          marginBottom: 64,
          textTransform: "uppercase",
        }}>
          <span>Manifesto</span>
          <span style={{ width: 28, height: 1, background: "rgba(255,255,255,0.18)" }} />
          <span>No. 001</span>
          <span style={{ width: 28, height: 1, background: "rgba(255,255,255,0.18)" }} />
          <span>Ether.fi Ventures</span>
        </div>

        {/* Hero */}
        <h1 style={{
          fontFamily: MONO,
          fontSize: "clamp(44px, 7.5vw, 84px)",
          fontWeight: 700,
          letterSpacing: -2,
          lineHeight: 1.02,
          margin: "0 0 64px",
        }}>
          Crypto will eat
          <br />
          the world<span style={{ color: CYAN }}>.</span>
        </h1>

        {/* Lead paragraph with drop cap */}
        <p style={{ ...BODY_LARGE, margin: "0 0 26px" }}>
          <span style={{
            fontFamily: MONO,
            fontSize: 62,
            float: "left",
            lineHeight: 0.88,
            marginRight: 10,
            marginTop: 6,
            color: CYAN,
            fontWeight: 700,
          }}>
            S
          </span>
          tablecoins have become one of the fastest-growing payment rails in history. Tokenized treasuries went from zero to tens of billions in twenty-four months. Onchain perpetuals are compounding against their centralized competitors every quarter. Regulatory clarity in the US and Europe has closed the overhang that kept a decade of institutional capital on the sidelines.
        </p>
        <p style={BODY_LARGE}>
          The next decade of financial services, consumer fintech, and market structure will be rebuilt onchain — and most of the winners haven't been founded yet.
        </p>

        {/* Pull quote */}
        <blockquote style={{
          fontFamily: MONO,
          fontSize: "clamp(26px, 4vw, 40px)",
          fontWeight: 500,
          color: CYAN,
          letterSpacing: -1,
          lineHeight: 1.15,
          margin: "52px 0 0",
          padding: "4px 0 4px 22px",
          borderLeft: `3px solid ${CYAN}`,
        }}>
          We exist to back them.
        </blockquote>

        <SectionLabel n={1}>What we believe</SectionLabel>
        <p style={BODY}>
          In a market where protocols fork in a weekend and infrastructure is commoditizing toward zero, <span style={EMPHASIS}>distribution is the moat</span>. The teams that win are the teams that figure out how to acquire users and hold them.
        </p>
        <p style={{ ...BODY, margin: "0 0 12px" }}>
          Every question we ask in diligence circles back to the same one:
        </p>
        <p style={{
          fontFamily: MONO,
          fontSize: "clamp(18px, 2.4vw, 22px)",
          fontStyle: "italic",
          color: "rgba(255,255,255,0.95)",
          lineHeight: 1.4,
          margin: "0 0 24px",
          paddingLeft: 18,
          borderLeft: `2px solid ${CYAN}66`,
        }}>
          How do you get to a million users, and what keeps them there?
        </p>

        <SectionLabel n={2}>Where we come in</SectionLabel>
        <p style={BODY}>
          Most crypto funds give you money and a tweet. We have something they don't: a first-class partnership with <span style={EMPHASIS}>ether.fi</span> — the largest liquid restaking protocol in the world, and one of the largest DeFi platforms, period.
        </p>
        <p style={BODY}>
          That partnership is operational leverage we put to work for the founders we back, from day one:
        </p>

        {/* Stats row — horizontal, no boxes, hairline dividers */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          borderTop: `1px solid ${CYAN}40`,
          borderBottom: `1px solid ${CYAN}40`,
          margin: "40px 0 48px",
        }}>
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                padding: "26px 22px 22px",
                borderRight: i < STATS.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
              }}
            >
              <div style={{
                fontFamily: MONO,
                fontSize: 34,
                fontWeight: 700,
                color: CYAN,
                letterSpacing: -1.2,
                lineHeight: 1,
              }}>
                {s.v}
              </div>
              <div style={{
                fontFamily: MONO,
                fontSize: 10,
                letterSpacing: "0.22em",
                color: "rgba(255,255,255,0.95)",
                marginTop: 14,
                fontWeight: 500,
              }}>
                {s.label}
              </div>
              <div style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.55)",
                marginTop: 8,
                lineHeight: 1.5,
              }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>

        <SectionLabel n={3}>Not career VCs. Operators.</SectionLabel>
        <p style={BODY}>
          ether.fi did <span style={EMPHASIS}>$50M+ in revenue in 2025</span>. Before ether.fi, our founding team built <span style={EMPHASIS}>Top Hat</span>, one of the most widely-used student engagement platforms in higher education, reaching over 3 million students.
        </p>
        <p style={BODY}>
          Different industries. Same playbook: distribution.
        </p>
        <p style={BODY}>
          When we push back on your GTM, it's because we've already run the experiment. When we make an intro, it's to someone we've worked with.
        </p>

        <SectionLabel n={4}>How we invest</SectionLabel>
        <p style={BODY}>
          We lead, co-lead, and follow pre-seed through Series A across the Ethereum and DeFi ecosystem. We invest on fundamentals, not strategic fit. We write first checks, take real positions, and don't spray.
        </p>

        <SectionLabel n={5}>What we promise</SectionLabel>
        <p style={BODY}>
          A decision in days, not months. Real access to ether.fi's users, balance sheet, and integrations from day one — not a promise of intros later. Working sessions on what actually moves a company in its first eighteen months: GTM, token design, compliance, hiring, BD.
        </p>

        {/* Closing */}
        <div style={{ margin: "80px 0 0" }}>
          <p style={{ ...BODY_LARGE, margin: "0 0 56px" }}>
            ether.fi is building the financial system for the onchain economy. <span style={EMPHASIS}>ether.fi Ventures backs the founders building alongside it.</span>
          </p>

          {/* CTA */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.15)",
            paddingTop: 40,
          }}>
            <div style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.24em",
              color: CYAN,
              marginBottom: 18,
              textTransform: "uppercase",
              fontWeight: 500,
            }}>
              → Send us your deck
            </div>
            <div style={{
              fontFamily: MONO,
              fontSize: "clamp(30px, 5vw, 48px)",
              fontWeight: 600,
              letterSpacing: -1.2,
              lineHeight: 1.1,
              marginBottom: 28,
            }}>
              We'll read it tonight.
            </div>
            <a
              href="mailto:ventures@ether.fi"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontFamily: MONO,
                fontSize: 16,
                fontWeight: 500,
                color: CYAN,
                textDecoration: "none",
                borderBottom: `1px solid ${CYAN}70`,
                paddingBottom: 4,
              }}
            >
              ventures@ether.fi
              <span aria-hidden="true" style={{ fontSize: 18 }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
