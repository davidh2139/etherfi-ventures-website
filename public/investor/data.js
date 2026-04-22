// Portfolio data. Edit here to update positions.
// Where a strategic token grant accompanies a cash investment (Hyperbeat,
// ETHGas), the two tranches are reported as a single "Investment" bucket:
// cash deployed reflects only the paid portion; token allocation and
// equity percentage aggregate paid + granted.

window.PORTFOLIO = {
  fundName: 'ether.fi Ventures Fund I LP',
  asOfISO: new Date().toISOString().slice(0, 10),

  // Live token price sources. Fallbacks used if CoinGecko is unreachable.
  priceSources: {
    RESOLV: { coingeckoId: 'resolv',   fallback: 0.039 },
    GWEI:   { coingeckoId: 'ethgas-2', fallback: 0.054 },
  },

  positions: [
    {
      id: 'hyperbeat',
      company: 'Hyperbeat',
      subtitle: 'Hyperliquid ecosystem · beHYPE LST',
      position: 'Seed',
      status: 'Pre-TGE',
      tokenLive: false,
      cashDeployed: 1_000_000,
      tokenPct: 0.10, // 2.5% paid + 7.5% strategic grant
      tokenCount: null,
      entryTokenFDV: 40_000_000,
      hasEquity: true,
      equityPct: 0.10, // 2.5% paid + 7.5% strategic grant
      equityFDV: 40_000_000,
      vesting: {
        label: '12-month cliff (no release); 1/36 monthly thereafter to month 48',
        startDate: null, // TGE pending
        cliffMonths: 12,
        cliffPct: 0,
        monthlyPct: 1 / 36,
        endMonths: 48,
        tgeLabel: 'TGE pending',
      },
      notes:
        '$1M deployed for 2.5% equity + 2.5% token allocation at $40M entry FDV. Strategic relationship adds 7.5% equity and 7.5% token allocation with no cash cost, bringing the combined position to 10% equity / 10% token.',
    },
    {
      id: 'rise',
      company: 'Rise Chain',
      subtitle: 'Surge Labs · L1 infrastructure',
      position: 'Seed',
      status: 'Pre-TGE',
      tokenLive: false,
      cashDeployed: 250_000,
      tokenPct: 0.00714,
      tokenCount: null,
      entryTokenFDV: 35_000_000,
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
      subtitle: 'Synthetic USD / yield-bearing stablecoin',
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
      subtitle: 'Ethereum preconfirmation infrastructure',
      position: 'Seed',
      status: 'Live — in lock-up',
      tokenLive: true,
      tokenSymbol: 'GWEI',
      totalSupply: 10_000_000_000,
      cashDeployed: 1_000_000,
      tokenPct: 0.02, // 1% SAFT + 1% strategic grant
      tokenCount: 200_000_000, // 100M SAFT + 100M strategic
      entryTokenFDV: 100_000_000,
      entryTokenPositionValue: 1_000_000, // paid portion: 1% × $100M
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
      notes:
        '$1M SAFT purchased 1% of supply (100M GWEI) at $100M entry FDV. Strategic relationship adds a further 1% grant (100M GWEI) with no cash cost, bringing the combined position to 2% / 200M GWEI. The strategic tranche begins vesting Apr 15, 2026; the displayed schedule reflects the SAFT timeline.',
    },
    {
      id: 'symbiotic',
      company: 'Symbiotic',
      subtitle: 'Universal restaking protocol · via GPRP Holdings SPV',
      position: 'Series A',
      status: 'Pre-TGE',
      tokenLive: false,
      cashDeployed: 100_267,
      tokenPct: null,
      tokenCount: null,
      entryTokenFDV: null,
      hasEquity: true,
      equityPct: null,
      equityFDV: 300_000_000,
      vesting: null,
      notes:
        'Invested via GPRP Holdings SPV alongside Lemniscap and co-investors. Tokens pass through pro rata upon warrant exercise. Series A closed April 2025 at ~$300M pre-money.',
    },
  ],
};
