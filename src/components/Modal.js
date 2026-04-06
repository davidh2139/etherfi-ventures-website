import React from "react";
import SvgLogo from "./SvgLogo";
import { LOGO_MAP } from "../config/logos";

/**
 * Modal — Portfolio company detail popup (larger + everything scaled up)
 */
export default function Modal({ d, onClose }) {
  if (!d) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(10, 10, 31, 0.95)",
        backdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#111827",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "56px 52px 44px",        // bigger padding
          maxWidth: 760,                    // significantly wider
          width: "100%",
          position: "relative",
          boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          color: "#ffffff",
        }}
      >
        {/* Close button */}
        <div
          onClick={onClose}
          style={{
            position: "absolute",
            top: 28,
            right: 32,
            cursor: "pointer",
            fontSize: 38,
            color: "#aaaaaa",
            lineHeight: 1,
          }}
        >
          ×
        </div>

        {/* Logo */}
        <SvgLogo
          url={LOGO_MAP[d.id]}
          width="280px"          // bigger logo
          height="64px"
          style={{ marginBottom: 36, justifyContent: "flex-start" }}
        />

        {/* Tag */}
        <div
          style={{
            fontSize: 21,                     // bigger
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: "#29BCFA",
            marginBottom: 24,
          }}
        >
          {d.tag}
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 23,                     // much larger and easier to read
            color: "#e0f8ff",
            lineHeight: 1.75,
            margin: "0 0 56px",
          }}
        >
          {d.desc}
        </p>

        {/* Links */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16 }}>
            <a
              href={d.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#ffffff",
                textDecoration: "none",
                padding: "14px 32px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                height: 54,
                boxSizing: "border-box",
              }}
            >
              Website
            </a>

            {d.tw && (
              <a
                href={"https://x.com/" + d.tw}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 54,
                  height: 54,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#ffffff",
                  textDecoration: "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>

          {d.stage && (
            <span
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: "#aaaaaa",
                padding: "14px 32px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.3)",
                display: "flex",
                alignItems: "center",
                height: 54,
                boxSizing: "border-box",
              }}
            >
              {d.stage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}