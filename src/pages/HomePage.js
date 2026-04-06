import React from "react";
import MatrixRain from "../components/MatrixRain";

export default function HomePage() {
  return (
    <section
      style={{
        position: "relative",
        height: "100vh",
        minHeight: 600,
        background: "#0a0a1f",           // dark background
        color: "#e0f8ff",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* MATRIX RAIN — always visible here */}
      <MatrixRain opacity={0.20} />

      {/* CENTERED TWO-LINE HEADLINE */}
      <div
        style={{
          textAlign: "center",
          maxWidth: "1500px",
          padding: "0 40px",
          zIndex: 2,
        }}
      >
        {/* First line */}
        <h1
          style={{
            fontSize: "clamp(42px, 6vw, 68px)",
            fontWeight: 700,
            margin: "0 0 20px 0",
            letterSpacing: -1.8,
            lineHeight: 1.15,
            fontFamily: "monospace",
          }}
        >
          We are{" "}
          <span
            className="glitch"
            data-text="ether.fi ventures"
            style={{
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            ether.fi ventures
          </span>
          .
        </h1>

        {/* Second line */}
        <h2
          style={{
            fontSize: "clamp(28px, 4vw, 42px)",
            fontWeight: 400,
            margin: 0,
            letterSpacing: -0.8,
            lineHeight: 1.3,
            fontFamily: "monospace",
          }}
        >
          A crypto-native venture firm built by{" "}
          <span
            className="glitch"
            data-text="founders"
            style={{
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            founders
          </span>{" "}
          for{" "}
          <span
            className="glitch"
            data-text="founders"
            style={{
              fontWeight: 700,
              display: "inline-block",
            }}
          >
            founders
          </span>
          .
        </h2>
      </div>
    </section>
  );
}