import React, { useEffect } from "react";
import SvgLogo from "./SvgLogo";
import { LOGO_MAP } from "../config/logos";
import { TOKENS } from "../config/theme";

/**
 * Modal — portfolio company detail popup.
 * Restyled per design spec: flat surface (no blur, no shadow), 4px
 * radius, ghost actions. Logic unchanged.
 */
export default function Modal({ d, onClose }) {
  useEffect(() => {
    if (!d) return;
    const handler = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [d, onClose]);

  if (!d) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ×
        </button>

        <div style={{ marginBottom: 32, display: "flex", justifyContent: "flex-start" }}>
          <SvgLogo url={LOGO_MAP[d.id]} width="200px" height="48px" />
        </div>

        <span className="eyebrow" style={{ display: "block", marginBottom: 16 }}>
          {d.tag}
        </span>

        <p
          style={{
            fontFamily: TOKENS.font.serif,
            fontSize: 20,
            fontWeight: 400,
            lineHeight: 1.5,
            letterSpacing: "-0.01em",
            color: TOKENS.text.primary,
            margin: "0 0 var(--space-48)",
          }}
        >
          {d.desc}
        </p>

        <div className="modal-actions">
          <a
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost"
          >
            Website
          </a>

          {d.tw && (
            <a
              href={"https://x.com/" + d.tw}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost modal-actions__icon"
              aria-label="Open X profile"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          )}

          {d.stage && (
            <span className="eyebrow" style={{ marginLeft: "auto" }}>
              {d.stage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
