import React from "react";
import useCryptoDecrypt from "../hooks/useCryptoDecrypt";
import MatrixRain from "../components/MatrixRain";

export default function HomePage() {
  const fullSentence = "We invest at the frontier of finance and technology that's being transformed by digital assets.";
  const typed = useCryptoDecrypt(fullSentence, 28);   // fast decrypt

  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        background: "#0a0a1f",          // dark Matrix background
        color: "#e0f8ff",
        overflow: "hidden",
      }}
    >
      {/* MATRIX RAIN — bytes dropping from top */}
      <MatrixRain opacity={0.15} />

      {/* STATIC LINE — top left */}
      <div
        style={{
          position: "absolute",
          top: "200px",
          left: "60px",
          maxWidth: "750px",
          zIndex: 2,
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 5.5vw, 62px)",
            fontWeight: 700,
            margin: 0,
            letterSpacing: -1.5,
            lineHeight: 1.12,
            color: "#ffffff",
          }}
        >
          We are{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #29BCFA, #6464E4, #B45AFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
            }}
          >
            ether.fi Ventures
          </span>
          , a crypto-native venture firm built by{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #29BCFA, #6464E4, #B45AFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              display: "inline-block",
              animation: "cryptoGlitch 1.6s infinite linear",
            }}
          >
            founders
          </span>{" "}
          for{" "}
          <span
            style={{
              background: "linear-gradient(90deg, #29BCFA, #6464E4, #B45AFA)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: 700,
              display: "inline-block",
              animation: "cryptoGlitch 1.6s infinite linear",
            }}
          >
            founders
          </span>
          .
        </h1>
      </div>

      {/* TYPED LINE — decrypts on top of the rain */}
      <div
        style={{
          position: "absolute",
          top: "48%",
          left: "750px",
          maxWidth: "820px",
          zIndex: 2,
        }}
      >
        <h2
          style={{
            fontSize: "clamp(24px, 3.5vw, 38px)",
            fontWeight: 400,
            margin: 0,
            letterSpacing: -0.5,
            lineHeight: 1.35,
            fontFamily: "monospace",           // Matrix code font
            textShadow: "0 0 12px #29BCFA",    // glow
            minHeight: "1.6em",
          }}
        >
          {typed.displayed}
          <span
            style={{
              opacity: typed.done ? 0 : 1,
              transition: "opacity 0.3s",
              fontWeight: 300,
            }}
          >
            |
          </span>
        </h2>
      </div>
    </section>
  );
}