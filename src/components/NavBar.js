import React, { useEffect, useState } from "react";
import SvgLogo from "./SvgLogo";
import { etherfiNavUrl } from "../config/logos";
import { TOKENS } from "../config/theme";

const NAV_ITEMS = [
  ["Home", "home"],
  ["Manifesto", "manifesto"],
  ["Portfolio", "portfolio"],
  ["Team", "team"],
  ["News", "news"],
];

export default function NavBar({ page, go, scrolled }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const handler = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [menuOpen]);

  const handleGo = (key) => {
    setMenuOpen(false);
    go(key);
  };

  const navLink = (label, key) => (
    <button
      key={key}
      type="button"
      className="nav-item"
      data-active={page === key}
      onClick={() => handleGo(key)}
    >
      {label}
    </button>
  );

  return (
    <nav
      className="site-nav"
      data-menu-open={menuOpen}
      style={{
        background: scrolled || menuOpen ? TOKENS.bg.elevated : "transparent",
        borderBottom: `1px solid ${scrolled || menuOpen ? TOKENS.border.subtle : "transparent"}`,
        transition: `background ${TOKENS.motion.base}, border-color ${TOKENS.motion.base}`,
      }}
    >
      <div className="site-nav__inner">
        <button
          type="button"
          className="site-nav__brand"
          onClick={() => handleGo("home")}
          aria-label="ether.fi Ventures home"
        >
          <SvgLogo
            url={etherfiNavUrl}
            width="clamp(172px, 30vw, 300px)"
            height="48px"
          />
        </button>

        <button
          type="button"
          className="site-nav__toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-controls="site-nav-links"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>

        <div id="site-nav-links" className="site-nav__links">
          {NAV_ITEMS.map(([label, key]) => navLink(label, key))}
          <div
            className="site-nav__investor-cta"
            aria-label="Investors coming soon"
          >
            <button
              type="button"
              className="site-nav__investors"
              aria-disabled="true"
            >
              Investors
            </button>
            <span className="site-nav__coming-soon">Coming Soon</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
