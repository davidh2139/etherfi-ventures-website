import React from "react";
import SvgLogo from "./SvgLogo";
import { etherfiNavUrl } from "../config/logos";
import { TOKENS } from "../config/theme";

/**
 * NavBar — fixed at the top, transparent over the hero, resolves to
 * --bg-elevated with a hairline bottom border once the page has
 * scrolled. Height 72. Wordmark left, links center-right, one ghost
 * CTA on the far right.
 */
export default function NavBar({ page, go, scrolled }) {
  const navLink = (label, key) => (
    <button
      key={key}
      type="button"
      className="nav-item"
      data-active={page === key}
      onClick={() => go(key)}
    >
      {label}
    </button>
  );

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height: 72,
        background: scrolled ? TOKENS.bg.elevated : "transparent",
        borderBottom: `1px solid ${scrolled ? TOKENS.border.subtle : "transparent"}`,
        transition: `background ${TOKENS.motion.base}, border-color ${TOKENS.motion.base}`,
      }}
    >
      <div
        style={{
          maxWidth: "var(--content-max)",
          margin: "0 auto",
          paddingLeft: "var(--gutter)",
          paddingRight: "var(--gutter)",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box",
        }}
      >
        {/* Wordmark */}
        <span
          onClick={() => go("home")}
          style={{
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
            lineHeight: 0,
          }}
        >
          <SvgLogo url={etherfiNavUrl} width="220px" height="36px" />
        </span>

        {/* Nav + CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navLink("Home", "home")}
          {navLink("Manifesto", "manifesto")}
          {navLink("Portfolio", "portfolio")}
          {navLink("Team", "team")}
          {navLink("News", "news")}
          <a href="/investor/" className="btn-ghost" style={{ marginLeft: 8 }}>
            Investors
          </a>
        </div>
      </div>
    </nav>
  );
}
