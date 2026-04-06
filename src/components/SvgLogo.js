import React, { useRef, useState, useEffect } from "react";

/**
 * SvgLogo — Renders an SVG from a URL with automatic whitespace cropping.
 *
 * How it works:
 *   1. Fetches the raw SVG content from the URL
 *   2. Renders it via dangerouslySetInnerHTML
 *   3. Uses getBBox() to measure the actual ink bounds (ignoring whitespace)
 *   4. Rewrites the viewBox to crop tightly to the visible content
 *   5. Caches the normalized result so it only measures once per URL
 *
 * The result: every logo gets a tight bounding box regardless of how
 * much whitespace the original SVG file has. Click targets, alignment,
 * and spacing are all consistent.
 *
 * Props:
 *   url    — URL to the SVG file (from a CRA import like: import x from "./logo.svg")
 *   width  — Maximum width for the container (the actual width may be smaller)
 *   height — Height for the container
 *   style  — Additional styles for the container
 */

// Global cache: URL → normalized SVG markup
// Persists across mounts/unmounts so each SVG is only measured once
const svgCache = new Map();

export default function SvgLogo({ url, width, height, style }) {
  const ref = useRef(null);
  const [svgHtml, setSvgHtml] = useState(() => svgCache.get(url) || "");
  const isNormalized = useRef(svgCache.has(url));

  // ── Step 1: Fetch the raw SVG content ──
  useEffect(() => {
    // Reset if URL changes
    isNormalized.current = svgCache.has(url);

    if (svgCache.has(url)) {
      setSvgHtml(svgCache.get(url));
      return;
    }

    if (!url) return;

    fetch(url)
      .then((res) => res.text())
      .then((text) => setSvgHtml(text))
      .catch((err) => console.warn("SvgLogo: failed to fetch", url, err));
  }, [url]);

  // ── Step 2: Normalize with getBBox after the raw SVG renders ──
  useEffect(() => {
    if (!svgHtml || isNormalized.current || !ref.current) return;

    const frame = requestAnimationFrame(() => {
      const svg = ref.current?.querySelector("svg");
      if (!svg) return;

      try {
        const bbox = svg.getBBox();

        // Skip if content has no measurable size
        if (bbox.width <= 0 || bbox.height <= 0) {
          isNormalized.current = true;
          return;
        }

        // ── Crop the viewBox to the tight ink bounds ──
        svg.setAttribute(
          "viewBox",
          `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
        );
        svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

        // Remove fixed dimensions from the SVG element so it
        // scales fluidly inside the container
        svg.removeAttribute("width");
        svg.removeAttribute("height");

        // Let the SVG fill the container height and derive
        // its width from the content's aspect ratio
        svg.style.height = "100%";
        svg.style.width = "auto";
        svg.style.maxWidth = "100%";
        svg.style.display = "block";

        // Cache the normalized markup
        const result = svg.outerHTML;
        svgCache.set(url, result);
        isNormalized.current = true;

        // Re-render with the clean version
        setSvgHtml(result);
      } catch (e) {
        console.warn("SvgLogo: getBBox normalization failed —", e);
        isNormalized.current = true;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [svgHtml, url]);

  if (!svgHtml) return null;

  return (
    <div
      ref={ref}
      dangerouslySetInnerHTML={{ __html: svgHtml }}
      style={{
        maxWidth: width,
        height: height || "auto",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
    />
  );
}
