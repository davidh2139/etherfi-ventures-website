// Mirror of public/investor/app.js math. Loads the same data.js, fetches live
// CoinGecko prices, and prints every value the dashboard renders so we can
// audit accuracy and consistency.
const fs = require('fs');
const path = require('path');

const dataSrc = fs.readFileSync(path.join(__dirname, '../public/investor/data.js'), 'utf8');
const sandbox = { window: {} };
new Function('window', dataSrc.replace('window.PORTFOLIO', 'window.PORTFOLIO'))(sandbox.window);
const P = sandbox.window.PORTFOLIO;

const today = new Date();
const todayISO = P.asOfISO || toLocalISODate(today);

function toLocalISODate(date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function parseISODateParts(iso) {
  return iso.split('-').map(Number);
}

// formatters
const fmtUSD = (v, opts = {}) => {
  if (v == null || Number.isNaN(v)) return '—';
  const abs = Math.abs(v);
  if (opts.compact && abs >= 1e9) return '$' + (v / 1e9).toFixed(2) + 'B';
  if (opts.compact && abs >= 1e6) return '$' + (v / 1e6).toFixed(abs >= 1e7 ? 1 : 2) + 'M';
  if (opts.compact && abs >= 1e3) return '$' + (v / 1e3).toFixed(0) + 'K';
  return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};
const fmtPct = (v, d = 2) => v == null ? '—' : (v * 100).toFixed(d) + '%';
const fmtMultiple = v => v == null ? '—' : v.toFixed(2) + 'x';

function monthsBetween(a, b) {
  const [sy, sm, sd] = parseISODateParts(a);
  const [ey, em, ed] = parseISODateParts(b);
  let m = (ey - sy) * 12 + (em - sm);
  if (ed < sd) m -= 1;
  return m;
}
function vestedFraction(v, asOf) {
  if (!v || !v.startDate) return 0;
  const el = monthsBetween(v.startDate, asOf);
  if (el < v.cliffMonths) return 0;
  if (el >= v.endMonths) return 1;
  return Math.min(1, v.cliffPct + (el - v.cliffMonths) * v.monthlyPct);
}

const DLOM_TIERS = [
  { maxYears: 1, dlom: 0.30 },
  { maxYears: 2, dlom: 0.45 },
  { maxYears: 3, dlom: 0.55 },
  { maxYears: Infinity, dlom: 0.65 },
];
const dlomForYears = y => DLOM_TIERS.find(t => y <= t.maxYears).dlom;

function weightedDLOM(v, asOf) {
  if (!v) return 0;
  const elapsed = v.startDate ? monthsBetween(v.startDate, asOf) : 0;
  let w = 0, s = 0;
  if (elapsed < v.cliffMonths && v.cliffPct > 0) {
    s += v.cliffPct * dlomForYears((v.cliffMonths - elapsed) / 12);
    w += v.cliffPct;
  }
  const first = Math.max(v.cliffMonths + 1, elapsed + 1);
  for (let m = first; m <= v.endMonths; m++) {
    s += v.monthlyPct * dlomForYears((m - elapsed) / 12);
    w += v.monthlyPct;
  }
  return w > 0 ? s / w : 0;
}

function hasTokenValuation(pos) {
  return pos.tokenPct != null
    || pos.tokenCount != null
    || pos.tokenSymbol != null
    || pos.entryTokenFDV != null;
}

function valuationOwnership(pos, usesTokenValuation) {
  if (usesTokenValuation) {
    if (pos.tokenPct != null) return pos.tokenPct;
    if (pos.tokenCount != null && pos.totalSupply) return pos.tokenCount / pos.totalSupply;
    return null;
  }
  return pos.equityPct ?? null;
}

function enrich(pos, prices) {
  const out = { ...pos, currentPrice: null, currentTokenFDV: null, currentTokenValue: null,
    currentValuation: null, valuationBasis: null, valuationLabel: null, valuationOwnership: null,
    vestedFraction: 0, vestedTokens: 0, positionMark: null, markMultiple: null };
  const usesTokenValuation = hasTokenValuation(pos);
  out.valuationBasis = usesTokenValuation ? 'token' : 'equity';
  out.valuationLabel = usesTokenValuation ? 'Token FDV' : 'Equity Valuation';
  out.valuationOwnership = valuationOwnership(pos, usesTokenValuation);

  if (pos.tokenLive && pos.tokenSymbol && prices[pos.tokenSymbol]) {
    const price = prices[pos.tokenSymbol].usd;
    out.currentPrice = price;
    if (pos.totalSupply) out.currentTokenFDV = price * pos.totalSupply;
  } else if (pos.currentFDV != null) {
    out.currentTokenFDV = pos.currentFDV;
  }
  out.currentValuation = usesTokenValuation
    ? out.currentTokenFDV ?? pos.currentFDV ?? pos.entryTokenFDV ?? pos.equityFDV ?? null
    : pos.currentFDV ?? pos.equityFDV ?? null;
  if (usesTokenValuation && out.currentValuation != null && out.valuationOwnership != null) {
    out.currentTokenValue = out.currentValuation * out.valuationOwnership;
  }
  if (pos.vesting) {
    out.vestedFraction = vestedFraction(pos.vesting, todayISO);
    if (pos.tokenCount) out.vestedTokens = pos.tokenCount * out.vestedFraction;
  }
  if (out.currentValuation != null && out.valuationOwnership != null) {
    out.positionMark = out.currentValuation * out.valuationOwnership;
  } else {
    out.positionMark = pos.cashDeployed;
  }
  if (pos.cashDeployed > 0 && out.positionMark != null) out.markMultiple = out.positionMark / pos.cashDeployed;
  if (usesTokenValuation) {
    const dlom = weightedDLOM(pos.vesting, todayISO);
    out.weightedDLOM = dlom;
    const blended = (out.vestedFraction || 0) + (1 - (out.vestedFraction || 0)) * (1 - dlom);
    out.discountedPositionMark = (out.positionMark || 0) * blended;
  } else {
    const flat = pos.flatDiscount ?? 0;
    out.weightedDLOM = flat;
    out.discountedPositionMark = (out.positionMark || 0) * (1 - flat);
  }
  if (pos.cashDeployed > 0 && out.discountedPositionMark != null) out.discountedMarkMultiple = out.discountedPositionMark / pos.cashDeployed;
  return out;
}

(async () => {
  const ids = [...new Set(Object.values(P.priceSources).map(s => s.coingeckoId))].join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
  const prices = {};
  let priceFetchNote = null;
  for (const [sym, src] of Object.entries(P.priceSources)) prices[sym] = { usd: src.fallback, stale: true };
  try {
    const res = await fetch(url);
    if (res.ok) {
      const j = await res.json();
      for (const [sym, src] of Object.entries(P.priceSources))
        if (j[src.coingeckoId]?.usd != null) prices[sym] = { usd: j[src.coingeckoId].usd, stale: false };
    } else {
      priceFetchNote = `CoinGecko returned HTTP ${res.status}; using fallbacks where needed.`;
    }
  } catch (err) {
    priceFetchNote = `CoinGecko fetch failed (${err.message}); using fallbacks where needed.`;
  }

  console.log('='.repeat(80));
  console.log(`AS OF: ${todayISO}`);
  console.log(`PRICES: ${Object.entries(prices).map(([s, p]) => `${s}=$${p.usd}${p.stale ? ' (FALLBACK)' : ''}`).join(', ')}`);
  if (priceFetchNote) console.log(`PRICE SOURCE NOTE: ${priceFetchNote}`);
  console.log('='.repeat(80));

  const enriched = P.positions.map(p => enrich(p, prices));

  // FUND-LEVEL
  const F = P.fundLevel || {};
  const committed = F.committedCapital || 0;
  const distributions = F.distributions || 0;
  const vintage = F.vintageISO ? new Date(F.vintageISO).getUTCFullYear() : null;
  const totalCash = enriched.reduce((a, p) => a + (p.cashDeployed || 0), 0);
  const totalMark = enriched.reduce((a, p) => a + (p.positionMark || 0), 0);
  const totalDisc = enriched.reduce((a, p) => a + (p.discountedPositionMark || 0), 0);
  const calledPct = committed > 0 ? totalCash / committed : 0;
  const grossMOIC = totalCash > 0 ? totalMark / totalCash : null;
  const discMOIC = totalCash > 0 ? totalDisc / totalCash : null;
  const grossTVPI = totalCash > 0 ? (distributions + totalMark) / totalCash : null;
  const discTVPI = totalCash > 0 ? (distributions + totalDisc) / totalCash : null;
  const dpi = totalCash > 0 ? distributions / totalCash : null;

  console.log('\n--- CAPITAL CARDS ---');
  console.log(`Committed:       ${fmtUSD(committed, { compact: true })}  · Fund I · ${vintage} vintage`);
  console.log(`Paid-In:         ${fmtUSD(totalCash, { compact: true })}  · ${(calledPct * 100).toFixed(0)}% of committed`);
  console.log(`Disc. NAV (Est.):${fmtUSD(totalDisc, { compact: true })}  · Non-Discounted: ${fmtUSD(totalMark, { compact: true })}`);
  console.log(`Distributions:   ${fmtUSD(distributions, { compact: true })}`);

  console.log('\n--- MULTIPLES CARDS ---');
  console.log(`Disc. MOIC:  ${fmtMultiple(discMOIC)}  · Non-Disc: ${fmtMultiple(grossMOIC)}`);
  console.log(`Disc. TVPI:  ${fmtMultiple(discTVPI)}  · Non-Disc: ${fmtMultiple(grossTVPI)}`);
  console.log(`DPI:         ${fmtMultiple(dpi)}`);

  console.log('\n--- POSITIONS TABLE ---');
  console.log(['Company','Stage','Investment','Ownership','Current Mark','Disc. NAV','Disc. MOIC','Status'].map(s => s.padEnd(15)).join(''));
  for (const p of enriched) {
    console.log([
      p.company,
      p.position,
      fmtUSD(p.cashDeployed, { compact: true }),
      fmtPct(p.valuationOwnership, 2),
      fmtUSD(p.positionMark, { compact: true }),
      fmtUSD(p.discountedPositionMark, { compact: true }),
      fmtMultiple(p.discountedMarkMultiple),
      p.status
    ].map(s => String(s).padEnd(15)).join(''));
  }
  const totalDiscMOIC = totalCash > 0 ? totalDisc / totalCash : null;
  console.log(['TOTALS','','',''].concat([
    fmtUSD(totalCash, { compact: true }),
    '—',
    fmtUSD(totalMark, { compact: true }),
    fmtUSD(totalDisc, { compact: true }),
    fmtMultiple(totalDiscMOIC),
    '—'
  ]).map(s => String(s).padEnd(15)).join(''));

  console.log('\n--- PER-POSITION DETAIL ---');
  for (const p of enriched) {
    console.log(`\n[${p.company}] ${p.position} · ${p.status}`);
    console.log(`  Investment:       ${fmtUSD(p.cashDeployed)}`);
    if (p.valuationOwnership != null) console.log(`  Ownership:        ${fmtPct(p.valuationOwnership, 2)}`);
    if (p.valuationBasis === 'token' && p.tokenCount != null) console.log(`  Tokens:           ${p.tokenCount.toLocaleString()} ${p.tokenSymbol || ''}`);
    const eFDV = p.valuationBasis === 'token' ? p.entryTokenFDV ?? p.equityFDV : p.equityFDV ?? p.entryTokenFDV;
    if (eFDV != null) console.log(`  ${p.valuationBasis === 'token' ? 'Entry FDV' : 'Entry Valuation'}:        ${fmtUSD(eFDV, { compact: true })}`);
    if (p.currentPrice != null) console.log(`  Current Price:    $${p.currentPrice.toFixed(p.currentPrice < 1 ? 4 : 2)} / ${p.tokenSymbol}`);
    if (p.currentValuation != null) console.log(`  ${p.valuationLabel}:        ${fmtUSD(p.currentValuation, { compact: true })}`);
    if (p.positionMark != null && p.cashDeployed > 0) console.log(`  Non-Disc. Mark:   ${fmtUSD(p.positionMark, { compact: true })}`);
    if (p.markMultiple != null) console.log(`  Non-Disc. MOIC:   ${fmtMultiple(p.markMultiple)}`);
    if (p.discountedPositionMark != null && p.cashDeployed > 0) console.log(`  Disc. NAV (Est.): ${fmtUSD(p.discountedPositionMark, { compact: true })}`);
    if (p.discountedMarkMultiple != null) console.log(`  Disc. MOIC:       ${fmtMultiple(p.discountedMarkMultiple)}`);
    if (p.valuationBasis === 'equity' && p.hasEquity && p.equityPct != null) console.log(`  Equity:           ${fmtPct(p.equityPct, 2)} @ ${fmtUSD(p.equityFDV, { compact: true })}`);
    console.log(`  Weighted DLOM:    ${(p.weightedDLOM * 100).toFixed(2)}%`);
    console.log(`  Vested Fraction:  ${(p.vestedFraction * 100).toFixed(2)}%`);
    if (p.vesting && p.valuationBasis === 'token') {
      const liquidVal = p.currentPrice != null ? p.vestedTokens * p.currentPrice : null;
      const lockedTokens = (p.tokenCount || 0) - p.vestedTokens;
      const lockedVal = p.currentPrice != null ? lockedTokens * p.currentPrice : null;
      console.log(`  Investment vesting tiles: Vested ${(p.vestedFraction*100).toFixed(1)}% · Locked ${((1-p.vestedFraction)*100).toFixed(1)}% · Liquid ${liquidVal != null ? fmtUSD(liquidVal, {compact:true}) : '—'} · Locked ${lockedVal != null ? fmtUSD(lockedVal, {compact:true}) : '—'}`);
    }
  }

  // Consistency checks
  console.log('\n--- CONSISTENCY CHECKS ---');
  for (const p of enriched) {
    const expected = p.currentValuation != null && p.valuationOwnership != null
      ? p.currentValuation * p.valuationOwnership
      : p.cashDeployed;
    const ok = Math.abs((p.positionMark || 0) - expected) < 1;
    console.log(`  [${p.company}] mark = ownership × ${p.valuationLabel || 'valuation'} ${ok ? 'OK' : 'MISMATCH'} (${fmtUSD(expected, { compact: true })})`);
  }

  console.log('\n--- FORMULA BASIS ---');
  for (const p of enriched) {
    const basis = p.valuationBasis === 'token'
      ? 'token FDV'
      : 'latest equity valuation';
    console.log(`  [${p.company}] ${fmtPct(p.valuationOwnership, 4)} × ${fmtUSD(p.currentValuation, { compact: true })} ${basis} = ${fmtUSD(p.positionMark, { compact: true })}.`);
  }
})();
