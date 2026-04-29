import React from "react";

const STATS = [
  { v: "$5B+",    label: "TVL",              desc: "Balance sheet that matters in every integration conversation." },
  { v: "$500M+",  label: "Deployable",       desc: "Anchor deposits, launch LPs, first institutional counterparties." },
  { v: "300,000+",label: "Users",            desc: "A distribution channel startups spend years trying to build." },
  { v: "$1B+",    label: "Card vol / yr",    desc: "A working consumer crypto business with real surface area." },
];

export default function ManifestoPage() {
  return (
    <section className="section" style={{ minHeight: "100vh" }}>
      <div className="container container--prose">
        {/* Masthead */}
        <header className="essay-hero">
          <span className="eyebrow">Manifesto · No. 001</span>
          <h1>Crypto will eat the world.</h1>
        </header>

        <article className="essay">
          <p className="essay-lead">
            Stablecoins have become one of the fastest-growing payment rails in history. Tokenized treasuries went from zero to tens of billions in twenty-four months. Onchain perpetuals are compounding against their centralized competitors every quarter. Regulatory clarity in the US and Europe has closed the overhang that kept a decade of institutional capital on the sidelines.
          </p>
          <p>
            The next decade of financial services, consumer software, infrastructure, and AI will be rebuilt onchain — and most of the winners haven't been founded yet.
          </p>

          <p className="essay-pullquote">We exist to back them.</p>

          <h2>What we believe</h2>
          <p>
            In a market where protocols fork in a weekend and infrastructure is commoditizing toward zero, <em className="essay-emphasis">distribution is the moat</em>. The teams that win are the teams that figure out how to acquire users and hold them.
          </p>
          <p>
            Every question we ask in diligence circles back to the same one:
          </p>
          <p className="essay-pullquote">
            How do you get to a million users, and what keeps them there?
          </p>

          <h2>Where we come in</h2>
          <p>
            Most crypto funds give you money and a tweet. We have something they don't: a first-class partnership with <em className="essay-emphasis">ether.fi</em> — the largest liquid restaking protocol in the world, and one of the largest DeFi platforms, period.
          </p>
          <p>
            That partnership is operational leverage we put to work for the founders we back, from day one.
          </p>

          <aside className="essay-stats">
            {STATS.map((s, i) => (
              <div key={i} className="essay-stats__cell">
                <span className="essay-stats__value">{s.v}</span>
                <span className="essay-stats__label">{s.label}</span>
                <div className="essay-stats__desc">{s.desc}</div>
              </div>
            ))}
          </aside>

          <h2>Not career VCs. Operators.</h2>
          <p>
            ether.fi did <em className="essay-emphasis">$50M+ in revenue in 2025</em>. Before ether.fi, our founding team built <em className="essay-emphasis">Top Hat</em>, one of the most widely-used student engagement platforms in higher education, reaching over 3 million students.
          </p>
          <p>Different industries. Same playbook: distribution.</p>
          <p>
            When we push back on your GTM, it's because we've already run the experiment. When we make an intro, it's to someone we've worked with.
          </p>

          <h2>How we invest</h2>
          <p>
            We lead, co-lead, and follow pre-seed through Series A across crypto — chain-agnostic, sector-agnostic. We invest on fundamentals, not strategic fit. We write first checks, take real positions, and don't spray.
          </p>

          <h2>What we promise</h2>
          <p>
            A decision in days, not months. Real access to ether.fi's users, balance sheet, and integrations from day one — not a promise of intros later. Working sessions on what actually moves a company in its first eighteen months: GTM, token design, compliance, hiring, BD.
          </p>

          <p>
            ether.fi is building the financial system for the onchain economy. <em className="essay-emphasis">ether.fi Ventures backs the founders building alongside it.</em>
          </p>

          <div className="essay-cta">
            <div className="essay-cta__headline">Send us your deck. We'll read it tonight.</div>
            <div className="essay-cta__sub">
              First check to Series A. Chain-agnostic. Distribution-first.
            </div>
            <a href="mailto:ventures@ether.fi" className="essay-cta__link">
              ventures@ether.fi
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
