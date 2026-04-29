// ============================================================
// PORTFOLIO COMPANIES
// ============================================================
//
// Each entry appears as a card on the Portfolio page and in a
// detail modal when clicked.
//
// Fields:
//   id    — unique key, also used to look up the SVG logo in LOGO_MAP
//   name  — display name (used as fallback if no SVG logo)
//   tag   — category label shown in the modal
//   url   — company website URL
//   tw    — Twitter/X handle (without @). Set to "" to hide.
//   desc  — description paragraph for the modal
//   color — accent color (currently used for reference only)

export const PORTFOLIO = [
  {
    id: "rise",
    name: "Rise Chain",
    tag: "Layer 2",
    url: "https://risechain.com",
    tw: "risechain",
    desc: "On-chain exchange and EVM L2.",
    stage: "Seed 2024",
    color: "#a855f7",
  },
  {
    id: "symbiotic",
    name: "Symbiotic",
    tag: "Universal Staking",
    url: "https://symbiotic.fi",
    tw: "symbioticfi",
    desc: "Flexible staking layer connecting capital across blockchain networks.",
    stage: "Series A 2025",
    color: "#0050AE",
  },
  {
    id: "hyperbeat",
    name: "Hyperbeat",
    tag: "Yield Infrastructure",
    url: "https://hyperbeat.org",
    tw: "hyperbeat",
    desc: "Hyperliquid-native neobank.",
    stage: "Seed 2025",
    color: "#ec4899",
  },
];
