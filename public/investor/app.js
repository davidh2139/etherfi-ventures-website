(() => {
  const P = window.PORTFOLIO;
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);

  // ---------- Formatters ----------
  const fmtUSD = (v, opts = {}) => {
    if (v == null || Number.isNaN(v)) return '—';
    const abs = Math.abs(v);
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
    }

    if (pos.vesting) {
      out.vestedFraction = vestedFraction(pos.vesting, todayISO);
      if (pos.tokenCount) out.vestedTokens = pos.tokenCount * out.vestedFraction;
    }

    // Position mark methodology:
    // - Strategic allocation (no cash): mark = current token value (upside at market)
    // - SAFE + token warrant (hasEquity=true): cash bought equity; token warrant is separate.
    //     Equity held at cost + token allocation at market (if live).
    // - SAFT (no equity): cash bought tokens directly. Mark at current token value if live.
    // - Pre-TGE in all cases: mark at cash cost basis.
    if (pos.cashDeployed === 0) {
      out.positionMark = out.currentTokenValue || 0;
    } else if (!pos.hasEquity) {
      out.positionMark = out.currentTokenValue != null ? out.currentTokenValue : pos.cashDeployed;
    } else {
      out.positionMark = out.currentTokenValue != null
        ? pos.cashDeployed + out.currentTokenValue
        : pos.cashDeployed;
    }

    if (pos.cashDeployed > 0 && out.positionMark != null) {
      out.markMultiple = out.positionMark / pos.cashDeployed;
    }
    return out;
  }

  // ---------- Rendering ----------
  function renderHeader(prices) {
    document.getElementById('as-of-date').textContent = fmtDate(todayISO);
    const header = document.getElementById('prices-header');
    header.innerHTML = Object.entries(prices).map(([sym, p]) => `
      <div class="flex items-center gap-1.5">
        <span class="text-slate-500">${sym}</span>
        <span class="text-slate-200">${fmtPrice(p.usd)}</span>
        ${p.stale ? '<span class="text-amber-500" title="Price fetch failed; using cached value">·</span>' : ''}
      </div>
    `).join('');
  }

  function renderSummary(enriched) {
    const totalCash = enriched.reduce((a, p) => a + (p.cashDeployed || 0), 0);
    const currentMark = enriched.reduce((a, p) => a + (p.positionMark || 0), 0);
    const liveTokenValue = enriched.reduce((a, p) => a + (p.currentTokenValue || 0), 0);
    const markMultiple = totalCash > 0 ? currentMark / totalCash : null;

    const companies = new Set(enriched.map(p => p.company));
    document.getElementById('position-count').textContent = enriched.length;
    document.getElementById('company-count').textContent = companies.size;

    const cards = [
      {
        label: 'Total Deployed',
        value: fmtUSD(totalCash, { compact: true }),
        sub: `${enriched.filter(p => p.cashDeployed > 0).length} cash positions`,
      },
      {
        label: 'Current Mark',
        value: fmtUSD(currentMark, { compact: true }),
        sub: 'Live tokens at market; pre-TGE at cost',
      },
      {
        label: 'Mark Multiple',
        value: fmtMultiple(markMultiple),
        sub: 'Mark ÷ capital deployed',
        positive: markMultiple != null && markMultiple >= 1,
      },
      {
        label: 'Live Token Value',
        value: fmtUSD(liveTokenValue, { compact: true }),
        sub: 'Current market value of live tokens',
      },
    ];

    document.getElementById('summary').innerHTML = cards.map(c => `
      <div class="rounded-xl border border-slate-800 bg-slate-900/50 p-4 sm:p-5">
        <div class="text-xs uppercase tracking-wider text-slate-500 mb-2">${c.label}</div>
        <div class="text-2xl sm:text-3xl font-semibold tracking-tight ${c.positive === true ? 'text-emerald-400' : c.positive === false ? 'text-red-400' : 'text-slate-100'}">${c.value}</div>
        <div class="text-xs text-slate-500 mt-1">${c.sub}</div>
      </div>
    `).join('');
  }

  function statusBadge(status) {
    const color = status.startsWith('Live')
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      : 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    return `<span class="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md border ${color}">${status}</span>`;
  }

  function renderPositionsTable(enriched) {
    const rows = enriched.map(p => {
      const multipleCell = p.markMultiple == null
        ? '<span class="text-slate-500">—</span>'
        : `<span class="${p.markMultiple >= 1 ? 'text-emerald-400' : 'text-red-400'}">${fmtMultiple(p.markMultiple)}</span>`;
      return `
        <tr class="hover:bg-slate-800/30">
          <td class="px-4 py-3">
            <div class="font-medium">${p.company}</div>
            <div class="text-xs text-slate-500">${p.subtitle}</div>
          </td>
          <td class="px-4 py-3 text-slate-300">${p.position}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-200">${p.cashDeployed > 0 ? fmtUSD(p.cashDeployed, { compact: true }) : '<span class="text-slate-500">—</span>'}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-200">${fmtPct(p.tokenPct, 3)}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-300">${p.entryTokenFDV ? fmtUSD(p.entryTokenFDV, { compact: true }) : '<span class="text-slate-500">—</span>'}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-300">${p.currentTokenFDV ? fmtUSD(p.currentTokenFDV, { compact: true }) : '<span class="text-slate-500">—</span>'}</td>
          <td class="px-4 py-3 text-right font-mono text-slate-100">${p.positionMark != null ? fmtUSD(p.positionMark, { compact: true }) : '<span class="text-slate-500">—</span>'}</td>
          <td class="px-4 py-3 text-right font-mono">${multipleCell}</td>
          <td class="px-4 py-3">${statusBadge(p.status)}</td>
        </tr>
      `;
    }).join('');
    document.getElementById('positions-table').innerHTML = rows;

    const totalCash = enriched.reduce((a, p) => a + (p.cashDeployed || 0), 0);
    const totalMark = enriched.reduce((a, p) => a + (p.positionMark || 0), 0);
    const totalMultiple = totalCash > 0 ? totalMark / totalCash : null;
    const multCls = totalMultiple != null && totalMultiple >= 1 ? 'text-emerald-400' : 'text-red-400';
    document.getElementById('positions-total').innerHTML = `
      <td class="px-4 py-3 text-slate-400 text-xs uppercase tracking-wider" colspan="2">Totals</td>
      <td class="px-4 py-3 text-right font-mono text-slate-100">${fmtUSD(totalCash, { compact: true })}</td>
      <td class="px-4 py-3"></td>
      <td class="px-4 py-3"></td>
      <td class="px-4 py-3"></td>
      <td class="px-4 py-3 text-right font-mono text-slate-100">${fmtUSD(totalMark, { compact: true })}</td>
      <td class="px-4 py-3 text-right font-mono ${multCls}">${fmtMultiple(totalMultiple)}</td>
      <td class="px-4 py-3"></td>
    `;
  }

  // Group by company for detail cards
  function renderCompanies(enriched) {
    const byCompany = new Map();
    for (const p of enriched) {
      if (!byCompany.has(p.company)) byCompany.set(p.company, []);
      byCompany.get(p.company).push(p);
    }

    const container = document.getElementById('companies');
    container.innerHTML = [...byCompany.entries()].map(([company, positions]) => {
      const anyLive = positions.some(p => p.tokenLive);
      const subtitle = positions[0].subtitle;
      const totalCash = positions.reduce((a, p) => a + (p.cashDeployed || 0), 0);
      const totalTokenPct = positions.reduce((a, p) => a + (p.tokenPct || 0), 0);
      const totalPositionMark = positions.reduce((a, p) => a + (p.positionMark || 0), 0);

      const positionCards = positions.map(p => renderPositionDetail(p)).join('');
      const chartIds = positions.filter(p => p.vesting && p.vesting.startDate).map(p => p.id);

      return `
        <article class="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          <div class="px-6 py-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 class="text-2xl font-semibold tracking-tight">${company}</h3>
              <p class="text-sm text-slate-400 mt-0.5">${subtitle}</p>
            </div>
            <div class="flex flex-wrap gap-5 text-right">
              <div>
                <div class="text-xs uppercase tracking-wider text-slate-500">Cash</div>
                <div class="font-mono text-slate-100">${fmtUSD(totalCash, { compact: true })}</div>
              </div>
              <div>
                <div class="text-xs uppercase tracking-wider text-slate-500">Token %</div>
                <div class="font-mono text-slate-100">${fmtPct(totalTokenPct, 2)}</div>
              </div>
              ${totalPositionMark > 0 ? `
                <div>
                  <div class="text-xs uppercase tracking-wider text-slate-500">Position Mark</div>
                  <div class="font-mono ${anyLive ? 'text-emerald-400' : 'text-slate-100'}">${fmtUSD(totalPositionMark, { compact: true })}</div>
                </div>
              ` : ''}
            </div>
          </div>
          <div class="divide-y divide-slate-800">
            ${positionCards}
          </div>
          ${positions[0].notes ? `<div class="px-6 py-4 text-xs text-slate-400 border-t border-slate-800 bg-slate-900/60">${positions[0].notes}</div>` : ''}
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
    metrics.push({ label: 'Position', value: p.position });
    metrics.push({ label: 'Cash Deployed', value: p.cashDeployed > 0 ? fmtUSD(p.cashDeployed) : '—' });
    metrics.push({ label: 'Token Allocation', value: p.tokenPct != null ? fmtPct(p.tokenPct, 3) : '—' });
    if (p.tokenCount != null) metrics.push({ label: 'Tokens', value: fmtTokens(p.tokenCount) + (p.tokenSymbol ? ' ' + p.tokenSymbol : '') });
    if (p.entryTokenFDV != null) metrics.push({ label: 'Entry FDV', value: fmtUSD(p.entryTokenFDV, { compact: true }) });
    if (p.currentPrice != null) metrics.push({ label: 'Current Price', value: fmtPrice(p.currentPrice) + ' / ' + p.tokenSymbol });
    if (p.currentTokenFDV != null) metrics.push({ label: 'Current FDV', value: fmtUSD(p.currentTokenFDV, { compact: true }) });
    if (p.currentTokenValue != null) metrics.push({ label: 'Token Value', value: fmtUSD(p.currentTokenValue, { compact: true }) });
    if (p.positionMark != null && p.cashDeployed > 0) metrics.push({ label: 'Position Mark', value: fmtUSD(p.positionMark, { compact: true }) });
    if (p.markMultiple != null) metrics.push({
      label: 'Multiple',
      value: `<span class="${p.markMultiple >= 1 ? 'text-emerald-400' : 'text-red-400'}">${fmtMultiple(p.markMultiple)}</span>`,
    });
    if (p.hasEquity && p.equityPct != null) metrics.push({ label: 'Equity', value: fmtPct(p.equityPct, 3) + (p.equityFDV ? ' @ ' + fmtUSD(p.equityFDV, { compact: true }) : '') });

    let vestingBlock = '';
    if (p.vesting) {
      const pctVested = p.vestedFraction;
      const vestedTokens = p.vestedTokens;
      const lockedTokens = (p.tokenCount || 0) - vestedTokens;
      const vestedValue = p.currentPrice != null ? vestedTokens * p.currentPrice : null;
      const lockedValue = p.currentPrice != null ? lockedTokens * p.currentPrice : null;

      vestingBlock = `
        <div class="mt-5">
          <div class="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-3">
            <div class="text-sm font-medium text-slate-200">Vesting</div>
            <div class="text-xs text-slate-500">${p.vesting.label}</div>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div class="rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Vested</div>
              <div class="font-mono text-slate-100">${fmtPct(pctVested, 1)}</div>
              ${p.tokenCount ? `<div class="text-xs text-slate-500 font-mono">${fmtTokens(vestedTokens)}</div>` : ''}
            </div>
            <div class="rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Locked</div>
              <div class="font-mono text-slate-100">${fmtPct(1 - pctVested, 1)}</div>
              ${p.tokenCount ? `<div class="text-xs text-slate-500 font-mono">${fmtTokens(lockedTokens)}</div>` : ''}
            </div>
            <div class="rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Liquid Value</div>
              <div class="font-mono text-slate-100">${vestedValue != null ? fmtUSD(vestedValue, { compact: true }) : '—'}</div>
            </div>
            <div class="rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2">
              <div class="text-[11px] uppercase tracking-wider text-slate-500">Locked Value</div>
              <div class="font-mono text-slate-100">${lockedValue != null ? fmtUSD(lockedValue, { compact: true }) : '—'}</div>
            </div>
          </div>
          ${p.vesting.startDate ? `
            <div class="relative rounded-xl bg-slate-950/50 border border-slate-800 p-4">
              <div class="flex flex-wrap gap-4 text-xs text-slate-500 mb-3">
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
      <div class="px-6 py-5">
        <div class="flex items-start justify-between gap-4 mb-4">
          <div class="text-sm font-medium text-slate-300">${p.position}</div>
          ${statusBadge(p.status)}
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
          ${metrics.map(m => `
            <div>
              <div class="text-[11px] uppercase tracking-wider text-slate-500 mb-0.5">${m.label}</div>
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
            borderColor: '#34d399',
            backgroundColor: 'rgba(52, 211, 153, 0.1)',
            fill: true,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
            borderWidth: 2,
          },
          {
            label: 'Upcoming',
            data: futureData,
            borderColor: '#64748b',
            backgroundColor: 'rgba(100, 116, 139, 0.05)',
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
            borderColor: '#29BCFA',
            backgroundColor: '#29BCFA',
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
            backgroundColor: '#0f172a',
            borderColor: '#1e293b',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#cbd5e1',
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
              color: '#64748b',
              maxTicksLimit: 8,
              font: { size: 10 },
            },
            grid: { color: 'rgba(30, 41, 59, 0.5)' },
          },
          y: {
            min: 0,
            max: 100,
            ticks: {
              color: '#64748b',
              font: { size: 10 },
              callback: (v) => v + '%',
            },
            grid: { color: 'rgba(30, 41, 59, 0.5)' },
          },
        },
      },
    });
  }

  // ---------- Boot ----------
  async function boot() {
    const prices = await fetchPrices();
    const enriched = P.positions.map(p => enrichPosition(p, prices));
    renderHeader(prices);
    renderSummary(enriched);
    renderPositionsTable(enriched);
    renderCompanies(enriched);
  }

  boot();
})();
