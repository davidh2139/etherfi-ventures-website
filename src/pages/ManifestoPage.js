import React from "react";
import { BRAND } from "../config/theme";

const CYAN = "#29BCFA";

const bodyStyle = {
  fontSize: 18,
  lineHeight: 1.65,
  color: "rgba(255,255,255,0.85)",
  margin: "0 0 20px",
};

const subheadStyle = {
  fontSize: 24,
  fontWeight: 600,
  letterSpacing: -0.5,
  color: "#ffffff",
  margin: "44px 0 18px",
};

const emphasisStyle = {
  fontSize: 28,
  fontWeight: 600,
  color: CYAN,
  letterSpacing: -0.5,
  margin: "32px 0 40px",
};

const strongStyle = {
  color: "#ffffff",
  fontWeight: 600,
};

const STATS = [
  { v: "$5B+", label: "TVL — a balance sheet that matters in every integration and partnership conversation." },
  { v: "$500M+", label: "Capital deployable into protocols — anchor deposits, launch LPs, first institutional counterparties." },
  { v: "300,000+", label: "Users — a distribution channel most crypto startups would spend years and tens of millions trying to build." },
  { v: "$1B+", label: "Annualized card volume — a working consumer crypto business with real surface area to plug product into." },
];

export default function ManifestoPage() {
  return (
    <section style={{ minHeight: "100vh", padding: "120px 0 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 40px", color: "#ffffff" }}>

        <div
          style={{
            fontSize: 12,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: CYAN,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          Manifesto
        </div>

        <h1
          style={{
            fontSize: "clamp(44px, 6vw, 66px)",
            fontWeight: 700,
            letterSpacing: -1.5,
            lineHeight: 1.1,
            margin: "0 0 36px",
          }}
        >
          Crypto will eat the world.
        </h1>

        <p style={bodyStyle}>
          Stablecoins have become one of the fastest-growing payment rails in history. Tokenized treasuries went from zero to tens of billions in twenty-four months. Onchain perpetuals are compounding against their centralized competitors every quarter. Regulatory clarity in the US and Europe has closed the overhang that kept a decade of institutional capital on the sidelines.
        </p>
        <p style={bodyStyle}>
          The next decade of financial services, consumer fintech, and market structure will be rebuilt onchain — and most of the winners haven't been founded yet.
        </p>

        <div style={emphasisStyle}>We exist to back them.</div>

        <h2 style={subheadStyle}>Here's what we believe</h2>
        <p style={bodyStyle}>
          In a market where protocols fork in a weekend and infrastructure is commoditizing toward zero, <span style={strongStyle}>distribution is the moat</span>. The teams that win are the teams that figure out how to acquire users and hold them. Every question we ask in diligence circles back to the same one: how do you get to a million users, and what keeps them there?
        </p>

        <h2 style={subheadStyle}>That's where we come in.</h2>
        <p style={bodyStyle}>
          Most crypto funds give you money and a tweet. We have something they don't: a first-class partnership with <span style={strongStyle}>ether.fi</span> — the largest liquid restaking protocol in the world and one of the largest DeFi platforms, period. That partnership is operational leverage we put to work for the founders we back from day one:
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 16,
            margin: "32px 0 48px",
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={i}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 12,
                padding: "22px 20px",
              }}
            >
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 700,
                  color: CYAN,
                  letterSpacing: -0.8,
                  marginBottom: 8,
                }}
              >
                {s.v}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: "rgba(255,255,255,0.65)",
                  lineHeight: 1.5,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>

        <h2 style={subheadStyle}>We are not career VCs. We are operators.</h2>
        <p style={bodyStyle}>
          ether.fi did <span style={strongStyle}>$50M+ in revenue in 2025</span>. Before ether.fi, our founding team built <span style={strongStyle}>Top Hat</span>, one of the most widely-used student engagement platforms in higher education, reaching over 3 million students. Different industries. Same playbook: distribution.
        </p>
        <p style={bodyStyle}>
          When we push back on your GTM, it's because we've already run the experiment. When we make an intro, it's to someone we've worked with.
        </p>

        <h2 style={subheadStyle}>How we invest</h2>
        <p style={bodyStyle}>
          We lead, co-lead, and follow pre-seed through Series A across the Ethereum and DeFi ecosystem. We invest on fundamentals, not strategic fit. We write first checks, take real positions, and don't spray.
        </p>

        <h2 style={subheadStyle}>What we promise you</h2>
        <p style={bodyStyle}>
          A decision in days, not months. Real access to ether.fi's users, balance sheet, and integrations from day one — not a promise of intros later. Working sessions on the stuff that actually moves a company in its first eighteen months: GTM, token design, compliance, hiring, BD.
        </p>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 40,
            marginTop: 56,
          }}
        >
          <p style={{ ...bodyStyle, fontSize: 19 }}>
            ether.fi is building the financial system for the onchain economy. <span style={strongStyle}>ether.fi Ventures backs the founders building alongside it.</span>
          </p>

          <div
            style={{
              background: "linear-gradient(135deg, rgba(41,188,250,0.08), rgba(0,80,174,0.14))",
              border: "1px solid " + CYAN + "30",
              borderRadius: 16,
              padding: "36px 28px",
              marginTop: 32,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "clamp(22px, 3vw, 26px)",
                fontWeight: 600,
                margin: "0 0 10px",
                color: "#ffffff",
                letterSpacing: -0.3,
              }}
            >
              If that's you — send us your deck.
            </div>
            <div
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.75)",
                margin: "0 0 22px",
              }}
            >
              We'll read it tonight.
            </div>
            <a
              href="mailto:ventures@ether.fi"
              style={{
                display: "inline-block",
                background: BRAND.cyan,
                color: "#ffffff",
                padding: "13px 30px",
                borderRadius: 10,
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                letterSpacing: 0.2,
              }}
            >
              ventures@ether.fi
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
