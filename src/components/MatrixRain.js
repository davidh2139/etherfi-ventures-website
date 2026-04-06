import React, { useRef, useEffect } from "react";

/**
 * MatrixRain - A lightweight React component that renders the iconic
 * "digital rain" (Matrix) effect using HTML5 Canvas.
 *
 * The animation uses katakana, numbers, and symbols falling down the screen
 * with a subtle trailing fade, giving the classic cyberpunk look.
 *
 * Performance note: The rain updates at ~1/4 speed (every 4 frames) to reduce
 * CPU/GPU usage while keeping smooth visuals.
 *
 * @param {object} props
 * @param {number} [props.opacity=0.20] - Opacity of the entire canvas overlay (0–1).
 *                                        Useful for layering over content without blocking it.
 *
 * @example
 * <MatrixRain opacity={0.15} />
 */
export default function MatrixRain({ opacity = 0.20 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let frame = 0; // Frame counter used for throttling updates

    /**
     * Resizes the canvas to match its container's rendered size.
     * This ensures the animation is crisp on any screen size / DPI.
     */
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      // Recalculate columns whenever the canvas size changes
      columns = Math.floor(canvas.width / fontSize);
      drops = new Array(columns).fill(1);
    };

    // Initial sizing + listen for window resize
    resize();
    window.addEventListener("resize", resize);

    // Characters used in the rain (katakana + alphanumerics + symbols)
    // This gives the authentic "Matrix" aesthetic
    const characters =
      "ｦｱｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*()";

    const fontSize = 14;
    let columns = Math.floor(canvas.width / fontSize);

    // `drops` tracks the vertical position (in rows) of each column's rain drop
    // A new drop starts at the top (value = 1) when the previous one resets
    let drops = new Array(columns).fill(1);

    /**
     * Main animation loop.
     * Uses requestAnimationFrame for smooth 60 fps rendering.
     */
    const draw = () => {
      frame++;

      // Semi-transparent dark overlay creates the "trailing" fade effect
      // Lower alpha = longer trails; higher alpha = cleaner look
      ctx.fillStyle = "rgba(10, 10, 30, 0.08)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text style once per frame
      ctx.fillStyle = "#29BCFA"; // Bright cyan/blue – classic Matrix color
      ctx.font = `${fontSize}px monospace`;

      // Throttle the rain logic to every 4th frame (makes it feel ~2× slower)
      // This significantly reduces CPU usage while keeping the animation fluid
      if (frame % 4 === 0) {
        for (let i = 0; i < drops.length; i++) {
          // Pick a random character
          const text = characters[Math.floor(Math.random() * characters.length)];

          // Draw the character at the current column & drop position
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);

          // Reset the drop to the top when it reaches the bottom
          // The random threshold (0.975) creates occasional "gaps" so the rain
          // doesn't look too uniform
          if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
          }

          // Move the drop down one row
          drops[i]++;
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Start the animation
    draw();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []); // Empty dependency array – effect runs only once on mount

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        opacity: opacity,
        pointerEvents: "none", // Allows clicks to pass through to underlying content
      }}
    />
  );
}