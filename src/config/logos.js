// ============================================================
// LOGOS — Import SVG files as URLs
// ============================================================
//
// CRA automatically turns SVG imports into URLs (like
// "/static/media/risechain.abc123.svg"). SvgLogo then
// fetches the raw content and normalizes it automatically.
//
// HOW TO ADD A NEW LOGO:
//   1. Drop the .svg file into src/assets/logos/
//   2. Add an import line below
//   3. Add it to LOGO_MAP with the portfolio item's id as the key

import riseUrl from "../assets/logos/risechain.svg";
import symbioticUrl from "../assets/logos/symbiotic.svg";
import hyperbeatUrl from "../assets/logos/hyperbeat.svg";
import etherfiNavUrl from "../assets/logos/etherfi.svg";

// Nav bar logo (used directly in NavBar.js)
export { etherfiNavUrl };

// Lookup map — keys must match the "id" field in portfolio.js
export const LOGO_MAP = {
  rise: riseUrl,
  symbiotic: symbioticUrl,
  hyperbeat: hyperbeatUrl,
};
