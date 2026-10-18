"use client";

import { useState, useEffect } from "react";
import { useStarCursor } from "@/hooks/useStarCursor";

export function StarCursorEffect() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setEnabled(!mq.matches);
    const handler = (e: MediaQueryListEvent) => setEnabled(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const { canvasRef, cursorRef } = useStarCursor(enabled);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="star-cursor-canvas"
        aria-hidden="true"
        style={{ display: enabled ? undefined : "none" }}
      />
      <div
        ref={cursorRef}
        className="star-cursor"
        aria-hidden="true"
        style={{ display: enabled ? undefined : "none" }}
      >
        ✦
      </div>
    </>
  );
}
