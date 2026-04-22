import React, { useState, useEffect, useCallback } from "react";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ManifestoPage from "./pages/ManifestoPage";
import PortfolioPage from "./pages/PortfolioPage";
import TeamPage from "./pages/TeamPage";
import NewsPage from "./pages/NewsPage";
import MatrixRain from "./components/MatrixRain";   // ← NEW IMPORT
import { FONT, c } from "./config/theme";

export default function App() {
  const [page, setPage] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const go = useCallback((p) => {
    setPage(p);
    window.scrollTo(0, 0);
  }, []);

  return (
    <div
      style={{
        position: "relative",           // ← important for layering
        minHeight: "100vh",
        background: "#0a0a1f",          // dark background (Matrix style)
        overflow: "hidden",
        fontFamily: FONT,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* MATRIX RAIN — now global and always visible */}
      <MatrixRain opacity={0.20} />

      {/* ALL CONTENT LAYERED ON TOP OF THE RAIN */}
      <div style={{ position: "relative", zIndex: 2 }}>
        
        {/* ── NAVIGATION BAR ── */}
        <NavBar page={page} go={go} scrolled={scrolled} />

        {/* ── PAGE CONTENT ── */}
        {page === "home" && <HomePage />}
        {page === "manifesto" && <ManifestoPage />}
        {page === "portfolio" && <PortfolioPage />}
        {page === "team" && <TeamPage />}
        {page === "news" && <NewsPage />}

        {/* ── FOOTER ── */}
        <footer
          style={{
            borderTop: "1px solid " + c.border,
            padding: "16px 0",
            background: "#0a0a1f",     // matches dark theme
          }}
        >
          <div
            style={{
              maxWidth: 1140,
              margin: "0 auto",
              padding: "0 40px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: 10, color: "#ffffff" }}>
              2026 ether.fi Ventures
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <a
                href="mailto:ventures@ether.fi"
                style={{ fontSize: 11, color: "#ffffff", textDecoration: "none" }}
              >
                ventures@ether.fi
              </a>
              {/* Twitter/X */}
              <a
                href="https://x.com/etherfi_VC"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", color: "#ffffff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/ether-fi-ventures?trk=public_profile_topcard-current-company"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "flex", alignItems: "center", color: "#ffffff" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}