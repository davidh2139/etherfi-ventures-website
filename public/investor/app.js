(() => {
  const P = window.PORTFOLIO;
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  // ---------- Formatters ----------
  const fmtUSD = (v, opts = {}) => {
    if (v == null || Number.isNaN(v)) return '—';
    const abs = Math.abs(v);
    if (opts.compact && abs >= 1_000_000_000) return '$' + (v / 1_000_000_000).toFixed(2) + 'B';
    if (opts.compact && abs >= 1_000_000) return '$' + (v / 1_000_000).toFixed(abs >= 10_000_000 ? 1 : 2) + 'M';
    if (opts.compact && abs >= 1_000) return '$' + (v / 1_000).toFixed(0) + 'K';
    return v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  };
  const fmtPct = (v, digits = 2) => v == null ? '—' : (v * 100).toFixed(digits) + '%';
  const fmtTokens = (v) => v == null ? '—' : v.toLocaleString('en-US', { maximumFractionDigits: 0 });
  const fmtMultiple = (v) => v == null ? '—' : v.toFixed(2) + 'x';
  const fmtPrice = (v) => v == null ? '—' : '$' + v.toFixed(v < 1 ? 4 : 2);

  const fmtDate = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  const fmtMonthShort = (d) => d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

  // ---------- Vesting math ----------
  function monthsBetween(start, end) {
    const s = new Date(start), e = new Date(end);
    let m = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    if (e.getDate() < s.getDate()) m -= 1;
    return m;
  }

  function vestedFraction(vesting, asOf) {
    if (!vesting || !vesting.startDate) return 0;
    const elapsed = monthsBetween(vesting.startDate, asOf);
    if (elapsed < vesting.cliffMonths) return 0;
    if (elapsed >= vesting.endMonths) return 1;
    const afterCliff = elapsed - vesting.cliffMonths;
    return Math.min(1, vesting.cliffPct + afterCliff * vesting.monthlyPct);
  }

  function vestingSeries(vesting) {
    if (!vesting || !vesting.startDate) return null;
    const points = [];
    const start = new Date(vesting.startDate);
    for (let m = 0; m <= vesting.endMonths; m++) {
      const d = new Date(start);
      d.setMonth(d.getMonth() + m);
      let pct;
      if (m < vesting.cliffMonths) pct = 0;
      else if (m >= vesting.endMonths) pct = 1;
      else pct = Math.min(1, vesting.cliffPct + (m - vesting.cliffMonths) * vesting.monthlyPct);
      points.push({ month: m, date: d, pct });
    }
    return points;
  }

  // ---------- Price fetching ----------
  async function fetchPrices() {
    const ids = [...new Set(Object.values(P.priceSources).map(s => s.coingeckoId))].join(',');
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
    const prices = {};
    // seed with fallbacks
    for (const [sym, src] of Object.entries(P.priceSources)) prices[sym] = { usd: src.fallback, stale: true };
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 5000);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const json = await res.json();
      for (const [sym, src] of Object.entries(P.priceSources)) {
        if (json[src.coingeckoId]?.usd != null) {
          prices[sym] = { usd: json[src.coingeckoId].usd, stale: false };
        }
      }
    } catch (e) {
      console.warn('Price fetch failed, using fallbacks:', e.message);
    }
    return prices;
  }

  // ---------- Illiquidity discount (DLOM) ----------
  // Tiered discount for lack of marketability (DLOM) applied tranche-by-tranche
  // to each vesting unlock based on its remaining restriction period. Table is
  // calibrated to Longstaff-style protective put option pricing model outputs
  // at crypto-typical volatility (~80–140% annualized). Per the Fund's approved
  // valuation policy (ASC 820, AICPA Valuation Guide 2019).
  const DLOM_TIERS = [
    { maxYears: 1, dlom: 0.30 }, // 0–1 year remaining
    { maxYears: 2, dlom: 0.45 }, // 1–2 years
    { maxYears: 3, dlom: 0.55 }, // 2–3 years
    { maxYears: Infinity, dlom: 0.65 }, // 3+ years
  ];

  function dlomForYears(years) {
    for (const tier of DLOM_TIERS) {
      if (years <= tier.maxYears) return tier.dlom;
    }
    return DLOM_TIERS[DLOM_TIERS.length - 1].dlom;
  }

  // Weighted DLOM across the vesting schedule. Each tranche — cliff unlock and
  // each monthly unlock — receives the DLOM tier matching its remaining time
  // to unlock; the weighted average of those DLOMs (by tranche size) is used.
  function weightedDLOM(vesting, todayISO) {
    if (!vesting) return 0;
    // Pre-TGE (no startDate): assume TGE is today so the full schedule is ahead.
    const elapsed = vesting.startDate ? monthsBetween(vesting.startDate, todayISO) : 0;

    let totalWeight = 0;
    let weightedSum = 0;

    if (elapsed < vesting.cliffMonths && vesting.cliffPct > 0) {
      const yearsToUnlock = (vesting.cliffMonths - elapsed) / 12;
      weightedSum += vesting.cliffPct * dlomForYears(yearsToUnlock);
      totalWeight += vesting.cliffPct;
    }

    const firstMonth = Math.max(vesting.cliffMonths + 1, elapsed + 1);
    for (let m = firstMonth; m <= vesting.endMonths; m++) {
      const yearsToUnlock = (m - elapsed) / 12;
      weightedSum += vesting.monthlyPct * dlomForYears(yearsToUnlock);
      totalWeight += vesting.monthlyPct;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  function yearsUntilFullUnlock(vesting, todayISO) {
    if (!vesting) return 0;
    if (!vesting.startDate) return vesting.endMonths / 12;
    const elapsed = monthsBetween(vesting.startDate, todayISO);
    const remaining = Math.max(0, vesting.endMonths - elapsed);
    return remaining / 12;
  }

  // ---------- Position computations ----------
  function enrichPosition(pos, prices) {
    const out = { ...pos };
    out.currentPrice = null;
    out.currentTokenFDV = null;
    out.currentTokenValue = null;
    out.vestedFraction = 0;
    out.vestedTokens = 0;
    out.positionMark = null;
    out.markMultiple = null;

    if (pos.tokenLive && pos.tokenSymbol && prices[pos.tokenSymbol]) {
      const price = prices[pos.tokenSymbol].usd;
      out.currentPrice = price;
      if (pos.totalSupply) out.currentTokenFDV = price * pos.totalSupply;
      if (pos.tokenCount) out.currentTokenValue = price * pos.tokenCount;
    } else if (pos.currentFDV != null) {
      // No live market; mark to the manually-set current FDV (e.g. last round).
      out.currentTokenFDV = pos.currentFDV;
      // Pure-equity positions: cash represents the full pro-rata claim; no
      // separate token value is added on top (would double-count).
      if (!pos.pureEquity && pos.tokenPct != null) {
        out.currentTokenValue = pos.currentFDV * pos.tokenPct;
      }
    }

    if (pos.vesting) {
      out.vestedFraction = vestedFraction(pos.vesting, todayISO);
      if (pos.tokenCount) out.vestedTokens = pos.tokenCount * out.vestedFraction;
    }

    // Position mark methodology — three regimes:
    //
    // (1) pureEquity: cash is the basis for a single pro-rata claim. Mark
    //     equals cash when entry FDV == current FDV (e.g. Symbiotic).
    //
    // (2) hasStrategicGrant: cash is the *paid* basis; the strategic grant
    //     adds tokens that cost nothing. Mark = cash (equity at cost) +
    //     current token value (which captures paid + strategic tokens at
    //     current price). This correctly surfaces the day-1 strategic bonus.
    //
    // (3) default (non-strategic, SAFE+warrant or SAFT): cash was the
    //     combined basis for equity + token warrant. Adding token value on
    //     top of cash would double-count (cash already paid for the warrant
    //     at round). Instead mark by FDV ratio: cash × (currentFDV / entryFDV).
    //     If tokens decline below round, mark correctly shows the loss.
    if (pos.pureEquity) {
      out.positionMark = pos.cashDeployed;
    } else if (pos.hasStrategicGrant) {
      if (pos.cashDeployed === 0) {
        out.positionMark = out.currentTokenValue || 0;
      } else if (!pos.hasEquity) {
        out.positionMark = out.currentTokenValue != null ? out.currentTokenValue : pos.cashDeployed;
      } else {
        out.positionMark = out.currentTokenValue != null
          ? pos.cashDeployed + out.currentTokenValue
          : pos.cashDeployed;
      }
    } else {
      const entryFDV = pos.entryTokenFDV ?? pos.equityFDV;
      const currentFDV = out.currentTokenFDV;
      if (entryFDV && currentFDV && pos.cashDeployed > 0) {
        out.positionMark = pos.cashDeployed * (currentFDV / entryFDV);
      } else {
        out.positionMark = pos.cashDeployed;
      }
    }

    if (pos.cashDeployed > 0 && out.positionMark != null) {
      out.markMultiple = out.positionMark / pos.cashDeployed;
    }

    // Illiquidity discount — three regimes matching the mark methodology:
    //
    // (1) pureEquity: flat haircut on the cash-based mark.
    // (2) hasStrategicGrant: 30%/yr compounded on the locked token portion
    //     only; equity (cash basis) is not further discounted.
    // (3) default (ratio-marked): 30%/yr compounded on the whole mark, since
    //     the mark itself is derived entirely from (locked) token FDV and
    //     the cash is already spent — the only future realizable value is
    //     the locked tokens unlocking at whatever price then prevails.
    if (pos.pureEquity) {
      // Pure-equity positions use a per-position flat haircut (exception to
      // the standard DLOM table, which does not apply to equity under policy).
      const flat = pos.flatDiscount ?? 0;
      out.weightedDLOM = flat;
      out.discountFactor = 1 - flat;
      out.discountedTokenValue = null;
      out.discountedPositionMark = pos.cashDeployed * (1 - flat);
    } else {
      const dlom = weightedDLOM(pos.vesting, todayISO);
      const discountFactor = 1 - dlom;
      out.weightedDLOM = dlom;
      out.discountFactor = discountFactor;
      const vestedFrac = out.vestedFraction || 0;
      // Vested tokens are liquid (no DLOM); locked tokens get the weighted DLOM.
      const blendedFactor = vestedFrac + (1 - vestedFrac) * discountFactor;

      if (pos.hasStrategicGrant) {
        // Equity/cash held at cost is not further discounted; DLOM applies to
        // the locked token portion only.
        let discountedTokenValue = null;
        if (out.currentTokenValue != null) {
          discountedTokenValue = out.currentTokenValue * blendedFactor;
        }
        out.discountedTokenValue = discountedTokenValue;

        if (pos.cashDeployed === 0) {
          out.discountedPositionMark = discountedTokenValue || 0;
        } else if (!pos.hasEquity) {
          out.discountedPositionMark = discountedTokenValue != null ? discountedTokenValue : pos.cashDeployed;
        } else {
          out.discountedPositionMark = discountedTokenValue != null
            ? pos.cashDeployed + discountedTokenValue
            : pos.cashDeployed;
        }
      } else {
        // Non-strategic: whole mark derives from locked token FDV, so DLOM
        // applies to the entire mark.
        out.discountedPositionMark = (out.positionMark || 0) * blendedFactor;
      }
    }

    if (pos.cashDeployed > 0 && out.discountedPositionMark != null) {
      out.discountedMarkMultiple = out.discountedPositionMark / pos.cashDeployed;
    }

    return out;
  }

  // ---------- Rendering ----------
  function renderHeader() {
    document.getElementById('as-of-date').textContent = fmtDate(todayISO);
  }

  function renderSummary(enriched) {
    const F = P.fundLevel || {};
    const committed = F.committedCapital || 0;
    const distributions = F.distributions || 0;
    const vintageYear = F.vintageISO ? new Date(F.vintageISO).getUTCFullYear() : null;

    const totalCash = enriched.reduce((a, p) => a + (p.cashDeployed || 0), 0);
    const currentMark = enriched.reduce((a, p) => a + (p.positionMark || 0), 0);
    const discountedMark = enriched.reduce((a, p) => a + (p.discountedPositionMark || 0), 0);

    // Paid-In Capital. Currently equals invested capital — accrued
    // management fees are not yet modeled. When a fee schedule is added
    // to fundLevel, layer it in here so TVPI/DPI denominators include
    // capital called for fees, not just for investments.
    const paidIn = totalCash;

    // We lead with the post-DLOM (discounted) figures because nothing in the
    // book is liquid and the policy treats the discounted mark as the
    // conservative fair-value basis. Pre-DLOM (gross) figures are shown
    // alongside as a "what if everything were liquid today" reference.
    const grossMOIC = paidIn > 0 ? currentMark / paidIn : null;
    const discountedMOIC = paidIn > 0 ? discountedMark / paidIn : null;
    const grossTVPI = paidIn > 0 ? (distributions + currentMark) / paidIn : null;
    const discountedTVPI = paidIn > 0 ? (distributions + discountedMark) / paidIn : null;
    const dpi = paidIn > 0 ? distributions / paidIn : null;

    const calledPct = committed > 0 ? totalCash / committed : 0;

    const capitalCards = [
      {
        label: 'Committed',
        value: fmtUSD(committed, { compact: true }),
        sub: vintageYear ? `Fund I · ${vintageYear} vintage` : 'Fund I',
      },
      {
        label: 'Paid-In',
        value: fmtUSD(paidIn, { compact: true }),
        sub: `${(calledPct * 100).toFixed(0)}% of committed`,
      },
      {
        label: 'Discounted NAV (Est.)',
        value: fmtUSD(discountedMark, { compact: true }),
        secondary: `Non-Discounted: ${fmtUSD(currentMark, { compact: true })}`,
        sub: 'Internal estimate per fund valuation policy — not official audited NAV',
      },
      {
        label: 'Distributions',
        value: fmtUSD(distributions, { compact: true }),
        sub: 'Cumulative cash returned',
      },
    ];

    const multipleCards = [
      {
        label: 'Discounted MOIC',
        value: fmtMultiple(discountedMOIC),
        secondary: `Non-Discounted: ${fmtMultiple(grossMOIC)}`,
        sub: 'Conservative basis (post-DLOM); non-discounted shown for context',
        positive: discountedMOIC != null && discountedMOIC >= 1,
      },
      {
        label: 'Discounted TVPI',
        value: fmtMultiple(discountedTVPI),
        secondary: `Non-Discounted: ${fmtMultiple(grossTVPI)}`,
        sub: '(Distributions + Discounted NAV) ÷ paid-in',
        positive: discountedTVPI != null && discountedTVPI >= 1,
      },
      {
        label: 'DPI',
        value: fmtMultiple(dpi),
        sub: 'Distributions ÷ paid-in',
      },
    ];

    const renderCards = (cards) => cards.map(c => `
      <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">${c.label}</div>
        <div class="text-2xl font-semibold tracking-tight ${c.positive === true ? 'text-emerald-400' : c.positive === false ? 'text-red-400' : 'text-slate-100'}">${c.value}</div>
        ${c.secondary ? `<div class="text-xs text-slate-500 mt-1.5 font-mono">${c.secondary}</div>` : ''}
        <div class="text-xs text-slate-500 mt-2 leading-relaxed">${c.sub}</div>
      </div>
    `).join('');

    document.getElementById('summary-capital').innerHTML = renderCards(capitalCards);
    document.getElementById('summary-multiples').innerHTML = renderCards(multipleCards);
  }

  function statusBadge(status) {
    const color = status.startsWith('Live')
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    return `<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${color}">${status}</span>`;
  }

  // Column definitions drive the positions table: header rendering, click-to-sort
  // handlers, and default sort direction (text ascending, numeric descending).
  // Trimmed to 8 columns so the table fits at 1280px without scroll. The table
  // shows position-level marks (not asset-level FDVs) so the chain reads
  // top-to-bottom: Investment → Current Mark → Disc. NAV → Disc. MOIC. Asset
  // FDV and entry FDV remain in the per-position detail card.
  const POSITION_COLUMNS = [
    { key: 'company',                  label: 'Company',          align: 'left',  type: 'text',   accessor: p => p.company || '' },
    { key: 'position',                 label: 'Stage',            align: 'left',  type: 'text',   accessor: p => p.position || '' },
    { key: 'cashDeployed',             label: 'Investment',       align: 'right', type: 'number', accessor: p => p.cashDeployed || 0 },
    { key: 'tokenPct',                 label: 'Ownership',        align: 'right', type: 'number', accessor: p => p.tokenPct || 0 },
    { key: 'positionMark',             label: 'Current Mark',     align: 'right', type: 'number', accessor: p => p.positionMark || 0 },
    { key: 'discountedPositionMark',   label: 'Disc. NAV (Est.)', align: 'right', type: 'number', accessor: p => p.discountedPositionMark || 0 },
    { key: 'discountedMarkMultiple',   label: 'Disc. MOIC',       align: 'right', type: 'number', accessor: p => p.discountedMarkMultiple || 0 },
    { key: 'status',                   label: 'Status',           align: 'left',  type: 'text',   accessor: p => p.status || '' },
  ];

  let sortState = { key: 'company', dir: 'asc' };
  let cachedEnriched = [];

  function sortPositions(enriched) {
    const col = POSITION_COLUMNS.find(c => c.key === sortState.key);
    if (!col) return enriched;
    const mult = sortState.dir === 'asc' ? 1 : -1;
    return [...enriched].sort((a, b) => {
      const av = col.accessor(a);
      const bv = col.accessor(b);
      if (col.type === 'text') return mult * String(av).localeCompare(String(bv));
      return mult * (av - bv);
    });
  }

  function renderPositionsTableHead() {
    const tr = document.getElementById('positions-thead');
    tr.innerHTML = POSITION_COLUMNS.map(col => {
      const active = sortState.key === col.key;
      const arrow = active ? (sortState.dir === 'asc' ? '↑' : '↓') : '';
      const alignClass = col.align === 'right' ? 'text-right' : 'text-left';
      const activeClass = active ? 'text-slate-200' : '';
      const arrowSpan = arrow ? ` <span class="text-sky-400">${arrow}</span>` : '';
      return `<th class="${alignClass} font-medium px-4 py-3 whitespace-nowrap cursor-pointer select-none hover:text-slate-200 transition-colors ${activeClass}" data-sort-key="${col.key}">${col.label}${arrowSpan}</th>`;
    }).join('');
    tr.querySelectorAll('th').forEach(th => {
      th.addEventListener('click', () => {
        const key = th.dataset.sortKey;
        if (sortState.key === key) {
          sortState.dir = sortState.dir === 'asc' ? 'desc' : 'asc';
        } else {
          sortState.key = key;
          const col = POSITION_COLUMNS.find(c => c.key === key);
          sortState.dir = col.type === 'number' ? 'desc' : 'asc';
        }
        renderPositionsTableHead();
        renderPositionsTableBody();
      });
    });
  }

  function renderPositionsTableBody() {
    const sorted = sortPositions(cachedEnriched);
    const dash = '<span class="text-slate-500">—</span>';
    const multipleCell = (m) => m == null
      ? dash
      : `<span class="${m >= 1 ? 'text-emerald-400' : 'text-red-400'}">${fmtMultiple(m)}</span>`;

    const rows = sorted.map(p => {
      return `
        <tr class="hover:bg-slate-800/30">
          <td class="px-4 py-3 align-top min-w-[200px]">
            <div class="font-medium text-slate-100">${p.company}</div>
            <div class="text-xs text-slate-500 mt-0.5 line-clamp-2">${p.subtitle}</div>
          </td>
          <td class="px-4 py-3 text-slate-200 whitespace-nowrap">${p.position}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-200 whitespace-nowrap">${p.cashDeployed > 0 ? fmtUSD(p.cashDeployed, { compact: true }) : dash}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-200 whitespace-nowrap">${p.tokenPct != null ? fmtPct(p.tokenPct, 2) : dash}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-100 whitespace-nowrap">${p.positionMark != null ? fmtUSD(p.positionMark, { compact: true }) : dash}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-100 whitespace-nowrap">${p.discountedPositionMark != null ? fmtUSD(p.discountedPositionMark, { compact: true }) : dash}</td>
          <td class="px-4 py-3 text-right font-mono whitespace-nowrap">${multipleCell(p.discountedMarkMultiple)}</td>
          <td class="px-4 py-3 whitespace-nowrap">${statusBadge(p.status)}</td>
        </tr>
      `;
    }).join('');
    document.getElementById('positions-table').innerHTML = rows;

    const totalCash = cachedEnriched.reduce((a, p) => a + (p.cashDeployed || 0), 0);
    const totalMark = cachedEnriched.reduce((a, p) => a + (p.positionMark || 0), 0);
    const totalDiscMark = cachedEnriched.reduce((a, p) => a + (p.discountedPositionMark || 0), 0);
    const totalDiscMultiple = totalCash > 0 ? totalDiscMark / totalCash : null;

    document.getElementById('positions-total').innerHTML = `
      <td class="px-4 py-3 text-slate-400 text-xs uppercase tracking-wider" colspan="2">Totals</td>
      <td class="px-4 py-3 text-right font-mono text-slate-100">${fmtUSD(totalCash, { compact: true })}</td>
      <td class="px-4 py-3 text-right">${dash}</td>
      <td class="px-4 py-3 text-right font-mono text-slate-100">${fmtUSD(totalMark, { compact: true })}</td>
      <td class="px-4 py-3 text-right font-mono text-slate-100">${fmtUSD(totalDiscMark, { compact: true })}</td>
      <td class="px-4 py-3 text-right font-mono">${multipleCell(totalDiscMultiple)}</td>
      <td class="px-4 py-3 text-right">${dash}</td>
    `;
  }

  function renderPositionsTable(enriched) {
    cachedEnriched = enriched;
    renderPositionsTableHead();
    renderPositionsTableBody();
  }

  // Group by company for detail cards
  function renderCompanies(enriched) {
    const byCompany = new Map();
    for (const p of enriched) {
      if (!byCompany.has(p.company)) byCompany.set(p.company, []);
      byCompany.get(p.company).push(p);
    }

    const container = document.getElementById('companies');
    container.innerHTML = [...byCompany.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([company, positions]) => {
      const anyLive = positions.some(p => p.tokenLive);
      const subtitle = positions[0].subtitle;
      const totalCash = positions.reduce((a, p) => a + (p.cashDeployed || 0), 0);
      const totalTokenPct = positions.reduce((a, p) => a + (p.tokenPct || 0), 0);
      const totalPositionMark = positions.reduce((a, p) => a + (p.positionMark || 0), 0);

      const positionCards = positions.map(p => renderPositionDetail(p)).join('');
      const chartIds = positions.filter(p => p.vesting && p.vesting.startDate).map(p => p.id);

      return `
        <article class="rounded-xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div class="p-6 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 class="text-2xl font-semibold tracking-tight text-slate-100">${company}</h3>
              <p class="text-sm text-slate-400 mt-1">${subtitle}</p>
            </div>
            <div class="flex flex-wrap gap-6 text-right">
              <div>
                <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Investment</div>
                <div class="text-base font-mono font-medium text-slate-100">${fmtUSD(totalCash, { compact: true })}</div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Ownership</div>
                <div class="text-base font-mono font-medium text-slate-100">${fmtPct(totalTokenPct, 2)}</div>
              </div>
              ${totalPositionMark > 0 ? `
                <div>
                  <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">Current Mark</div>
                  <div class="text-base font-mono font-medium ${anyLive ? 'text-emerald-400' : 'text-slate-100'}">${fmtUSD(totalPositionMark, { compact: true })}</div>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="divide-y divide-slate-800">
            ${positionCards}
          </div>
          ${positions[0].notes ? `<div class="p-6 text-xs text-slate-400 leading-relaxed border-t border-slate-800 bg-slate-950/40">${positions[0].notes}</div>` : ''}
        </article>
      `;
    }).join('');

    // Render all vesting charts after DOM is updated
    for (const p of enriched) {
      if (p.vesting && p.vesting.startDate) {
        renderVestingChart(p);
      }
    }
  }

  function renderPositionDetail(p) {
    const metrics = [];
    const coloredMultiple = (m) =>
      `<span class="${m >= 1 ? 'text-emerald-400' : 'text-red-400'}">${fmtMultiple(m)}</span>`;

    metrics.push({ label: 'Investment', value: p.cashDeployed > 0 ? fmtUSD(p.cashDeployed) : '—' });
    if (p.tokenPct != null) metrics.push({ label: 'Ownership', value: fmtPct(p.tokenPct, 2) });
    if (!p.pureEquity && p.tokenCount != null) metrics.push({ label: 'Tokens', value: fmtTokens(p.tokenCount) + (p.tokenSymbol ? ' ' + p.tokenSymbol : '') });
    const entryFDV = p.entryTokenFDV ?? p.equityFDV;
    if (entryFDV != null) metrics.push({ label: 'Entry FDV', value: fmtUSD(entryFDV, { compact: true }) });
    if (p.currentPrice != null) metrics.push({ label: 'Current Price', value: fmtPrice(p.currentPrice) + ' / ' + p.tokenSymbol });
    if (p.currentTokenFDV != null) metrics.push({ label: 'Current FDV', value: fmtUSD(p.currentTokenFDV, { compact: true }) });
    // Token Mark only shown for strategic positions where it differs from
    // Current Mark (Current Mark = cash + Token Mark). For non-strategic
    // positions the ratio method makes Current Mark == Token Mark, so the
    // metric would be redundant.
    if (p.hasStrategicGrant && p.currentTokenValue != null) metrics.push({ label: 'Token Mark', value: fmtUSD(p.currentTokenValue, { compact: true }) });
    if (p.positionMark != null && p.cashDeployed > 0) metrics.push({ label: 'Non-Disc. Mark', value: fmtUSD(p.positionMark, { compact: true }) });
    if (p.markMultiple != null) metrics.push({ label: 'Non-Disc. MOIC', value: coloredMultiple(p.markMultiple) });
    if (p.discountedPositionMark != null && p.cashDeployed > 0) metrics.push({ label: 'Disc. NAV (Est.)', value: fmtUSD(p.discountedPositionMark, { compact: true }) });
    if (p.discountedMarkMultiple != null) metrics.push({ label: 'Disc. MOIC', value: coloredMultiple(p.discountedMarkMultiple) });
    if (p.hasEquity && p.equityPct != null) metrics.push({ label: 'Equity', value: fmtPct(p.equityPct, 2) + (p.equityFDV ? ' @ ' + fmtUSD(p.equityFDV, { compact: true }) : '') });

    let vestingBlock = '';
    if (p.vesting && !p.pureEquity) {
      const pctVested = p.vestedFraction;
      const vestedTokens = p.vestedTokens;
      const lockedTokens = (p.tokenCount || 0) - vestedTokens;
      const vestedValue = p.currentPrice != null ? vestedTokens * p.currentPrice : null;
      const lockedValue = p.currentPrice != null ? lockedTokens * p.currentPrice : null;

      const tile = (label, mainValue, sub) => `
        <div class="rounded-lg bg-slate-950/50 border border-slate-800 p-3">
          <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">${label}</div>
          <div class="font-mono text-sm text-slate-100">${mainValue}</div>
          ${sub ? `<div class="text-xs text-slate-500 font-mono mt-0.5">${sub}</div>` : ''}
        </div>
      `;

      vestingBlock = `
        <div class="mt-6 pt-5 border-t border-slate-800/70">
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
            <div class="text-sm font-semibold text-slate-200">Vesting</div>
            <div class="text-xs text-slate-500">${p.vesting.label}</div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            ${tile('Vested', fmtPct(pctVested, 1), p.tokenCount ? fmtTokens(vestedTokens) : null)}
            ${tile('Locked', fmtPct(1 - pctVested, 1), p.tokenCount ? fmtTokens(lockedTokens) : null)}
            ${tile('Liquid Value', vestedValue != null ? fmtUSD(vestedValue, { compact: true }) : '—')}
            ${tile('Locked Value', lockedValue != null ? fmtUSD(lockedValue, { compact: true }) : '—')}
          </div>
          ${p.vesting.startDate ? `
            <div class="rounded-lg bg-slate-950/50 border border-slate-800 p-4">
              <div class="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                <span>${p.vesting.tgeLabel || ''}</span>
                ${p.vesting.firstUnlockLabel ? `<span>·</span><span>${p.vesting.firstUnlockLabel}</span>` : ''}
              </div>
              <div class="h-48"><canvas id="chart-${p.id}"></canvas></div>
            </div>
          ` : `
            <div class="text-xs text-slate-500 italic">${p.vesting.tgeLabel || 'Schedule begins at TGE'}</div>
          `}
        </div>
      `;
    }

    return `
      <div class="p-6">
        <div class="flex items-center justify-between gap-3 mb-5">
          <div class="text-sm font-semibold text-slate-200">${p.position}</div>
          ${statusBadge(p.status)}
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
          ${metrics.map(m => `
            <div>
              <div class="text-xs uppercase tracking-wider text-slate-500 mb-1">${m.label}</div>
              <div class="font-mono text-sm text-slate-100">${m.value}</div>
            </div>
          `).join('')}
        </div>
        ${vestingBlock}
      </div>
    `;
  }

  function renderVestingChart(p) {
    const canvas = document.getElementById(`chart-${p.id}`);
    if (!canvas) return;
    const series = vestingSeries(p.vesting);
    if (!series) return;

    const labels = series.map(pt => fmtMonthShort(pt.date));
    const data = series.map(pt => +(pt.pct * 100).toFixed(2));

    // Find "today" index
    const startDate = new Date(p.vesting.startDate);
    const monthsFromStart = Math.max(0, Math.min(
      p.vesting.endMonths,
      monthsBetween(p.vesting.startDate, todayISO)
    ));
    const todayIdx = monthsFromStart;
    const todayPct = (vestedFraction(p.vesting, todayISO) * 100).toFixed(2);

    const pastData = data.map((v, i) => i <= todayIdx ? v : null);
    const futureData = data.map((v, i) => i >= todayIdx ? v : null);

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Vested',
            data: pastData,
            borderColor: '#1B5E3F',
            backgroundColor: 'rgba(27, 94, 63, 0.08)',
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
          {
            label: 'Upcoming',
            data: futureData,
            borderColor: '#A3A3A3',
            backgroundColor: 'rgba(163, 163, 163, 0.08)',
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
            borderDash: [4, 4],
          },
          {
            label: 'Today',
            data: data.map((v, i) => i === todayIdx ? +todayPct : null),
            borderColor: '#0A0A0A',
            backgroundColor: '#0A0A0A',
            pointRadius: 5,
            pointHoverRadius: 6,
            showLine: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#0A0A0A',
            borderColor: '#262626',
            borderWidth: 1,
            titleColor: '#FFFFFF',
            bodyColor: '#D4D4D4',
            callbacks: {
              title: (items) => items[0]?.label || '',
              label: (ctx) => {
                if (ctx.dataset.label === 'Today') return `Today: ${ctx.parsed.y}%`;
                return `${ctx.dataset.label}: ${ctx.parsed.y}%`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: {
              color: '#737373',
              maxTicksLimit: 8,
              font: { size: 10 },
            },
            grid: { color: 'rgba(229, 229, 229, 0.8)' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: '#737373',
              font: { size: 10 },
              callback: (v) => v + '%',
            },
            grid: { color: 'rgba(229, 229, 229, 0.8)' },
          },
        },
      },
    });
  }

  // ---------- Boot ----------
  async function boot() {
    const prices = await fetchPrices();
    const enriched = P.positions.map(p => enrichPosition(p, prices));
    renderHeader();
    renderSummary(enriched);
    renderPositionsTable(enriched);
    renderCompanies(enriched);
  }

  boot();
})();
