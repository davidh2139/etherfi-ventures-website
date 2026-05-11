// Portfolio data. Edit here to update positions.
// Where additional ownership accompanies a cash investment (Hyperbeat,
// ETHGas), the dashboard reports a single "Investment" allocation. Marks
// use the displayed ownership percentage multiplied by token FDV when a
// token allocation exists, otherwise by the latest equity valuation.

window.PORTFOLIO = {
  fundName: 'ether.fi Ventures Fund I LP',
  asOfISO: new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10),

  // Fund-level data feeding the LP summary metrics (Committed / Paid-In /
  // NAV / Distributions / DPI / TVPI). Paid-in capital is currently equal
  // to invested capital — accrued management fees are not yet modeled.
  fundLevel: {
    committedCapital: 20_000_000,
    vintageISO: '2025-06-01',
    distributions: 0,
  },

  // Live token price sources. Fallbacks used if CoinGecko is unreachable.
  priceSources: {
    RESOLV: { coingeckoId: 'resolv',   fallback: 0.039 },
    GWEI:   { coingeckoId: 'ethgas-2', fallback: 0.054 },
  },

  positions: [
    {
      id: 'hyperbeat',
      company: 'Hyperbeat',
      subtitle: 'Hyperliquid-native neobank',
      position: 'Seed',
      status: 'Pre-TGE',
      tokenLive: false,
      hasBundledInvestmentAllocation: true,
      cashDeployed: 1_000_000,
      tokenPct: 0.10, // investment allocation
      tokenCount: null,
      entryTokenFDV: 10_000_000, // $1M cash / 10% investment allocation
      currentFDV: 40_000_000, // latest valuation (round FDV; no markup/markdown since)
      hasEquity: true,
      equityPct: 0.10, // investment allocation
      equityFDV: 10_000_000, // $1M cash / 10% investment allocation
      vesting: {
        label: '12-month cliff (no release); 1/36 monthly thereafter to month 48',
        startDate: null, // TGE pending
        cliffMonths: 12,
        cliffPct: 0,
        monthlyPct: 1 / 36,
        endMonths: 48,
        tgeLabel: 'TGE pending',
      },
    },
    {
      id: 'rise',
      company: 'Rise Chain',
      subtitle: 'On-chain exchange and EVM L2',
      position: 'Seed',
      status: 'Pre-TGE',
      tokenLive: false,
      cashDeployed: 250_000,
      tokenPct: 0.00714,
      tokenCount: null,
      entryTokenFDV: 35_000_000,
      currentFDV: 200_000_000, // most recent raise round valuation
      hasEquity: true,
      equityPct: 0.00714,
      equityFDV: 35_000_000,
      vesting: {
        label: '12-month cliff (25%); 1/48 monthly thereafter to month 48',
        startDate: null,
        cliffMonths: 12,
        cliffPct: 0.25,
        monthlyPct: 1 / 48,
        endMonths: 48,
        tgeLabel: 'TGE pending',
      },
    },
    {
      id: 'resolv',
      company: 'Resolv',
      subtitle: 'Yield-bearing stablecoin',
      position: 'Seed',
      status: 'Live — in lock-up',
      tokenLive: true,
      tokenSymbol: 'RESOLV',
      totalSupply: 1_000_000_000,
      cashDeployed: 200_000,
      tokenPct: 0.002,
      tokenCount: 2_000_000,
      entryTokenFDV: 100_000_000,
      entryTokenPositionValue: 200_000, // 0.2% × $100M
      hasEquity: true,
      equityPct: 0.004,
      equityFDV: 50_000_000,
      tgeDate: '2025-05-27',
      vesting: {
        label: '13-month lock-up; 1/24 monthly thereafter to ~May 2028',
        startDate: '2025-05-27',
        cliffMonths: 13,
        cliffPct: 1 / 24,
        monthlyPct: 1 / 24,
        endMonths: 36,
        tgeLabel: 'TGE: May 27, 2025',
        firstUnlockLabel: 'First unlock: Jun 27, 2026',
      },
    },
    {
      id: 'ethgas',
      company: 'ETHGas',
      subtitle: 'Ethereum blockspace futures',
      position: 'Seed',
      status: 'Live — in lock-up',
      tokenLive: true,
      hasBundledInvestmentAllocation: true,
      tokenSymbol: 'GWEI',
      totalSupply: 10_000_000_000,
      cashDeployed: 1_000_000,
      tokenPct: 0.02, // investment allocation
      tokenCount: 200_000_000, // investment allocation
      entryTokenFDV: 50_000_000, // $1M cash / 2% investment allocation
      entryTokenPositionValue: 1_000_000, // 2% × $50M blended = cash deployed
      hasEquity: false,
      tgeDate: '2026-01-21',
      vesting: {
        label: '12-month cliff (10%); 3.75% monthly thereafter to Jan 2029',
        startDate: '2026-01-21',
        cliffMonths: 12,
        cliffPct: 0.10,
        monthlyPct: 0.0375,
        endMonths: 36,
        tgeLabel: 'TGE: Jan 21, 2026',
        firstUnlockLabel: 'First unlock: Jan 21, 2027',
      },
    },
    {
      id: 'symbiotic',
      company: 'Symbiotic',
      subtitle: 'Universal restaking protocol',
      position: 'Series A',
      status: 'Pre-TGE',
      tokenLive: false,
      cashDeployed: 100_267,
      tokenPct: 100_267 / 350_000_000,  // pro rata with equity: cash / Series A FDV
      tokenCount: null,
      entryTokenFDV: null, // falls back to equityFDV in display
      currentFDV: 350_000_000, // no markup since Series A
      hasEquity: true,
      equityPct: 100_267 / 350_000_000, // cash / Series A FDV
      equityFDV: 350_000_000,
      // Entry and current valuation match, so ownership * valuation equals
      // cash invested. No investment vesting schedule is currently modeled.
      vesting: null,
      notes:
        'Invested alongside Lemniscap and co-investors. Tokens pass through pro rata upon warrant exercise. Series A closed April 2025 at a $350M valuation.',
    },
  ],
};
