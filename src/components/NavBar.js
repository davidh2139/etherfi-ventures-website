import React from "react";
import SvgLogo from "./SvgLogo";
import { etherfiNavUrl } from "../config/logos";

/**
 * NavBar — Fixed top navigation bar with glass effect so Matrix rain shows through.
 */
export default function NavBar({ page, go, scrolled }) {
  function navLink(label, key) {
    const active = page === key;
    return (
      <span
        key={key}
        onClick={() => go(key)}
        style={{
          fontSize: 18,
          fontWeight: 500,
          cursor: "pointer",
          color: "#ffffff",                    // always white
          borderBottom: active
            ? "2px solid #29BCFA"
            : "2px solid transparent",
          paddingBottom: 4,
          transition: "all 0.25s",
        }}
      >
        {label}
      </span>
    );
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        // Glassmorphism effect — always lets rain show through
        background: scrolled 
          ? "rgba(10, 10, 31, 0.75)"     // semi-transparent dark
          : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.1)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          maxWidth: "100%",
          margin: 0,
          padding: "0 60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 68,
        }}
      >
        {/* Logo */}
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
          <SvgLogo url={etherfiNavUrl} width="300px" height="48px" />
        </span>

        {/* Nav links */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          {navLink("Home", "home")}
          {navLink("Portfolio", "portfolio")}
          {navLink("Team", "team")}
          {navLink("News & Insights", "news")}
        </div>
      </div>
    </nav>
  );
}