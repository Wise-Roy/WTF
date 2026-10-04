"use client";

import { useReducedMotion } from "framer-motion";
import { useStarCursor } from "@/hooks/useStarCursor";

export function StarCursorEffect() {
  const prefersReducedMotion = useReducedMotion();
  const enabled = !prefersReducedMotion;
  const { canvasRef, cursorRef } = useStarCursor(enabled);

  if (!enabled) return null;

  return (
    <>
      {/* Canvas for particle rendering */}
      <canvas
        ref={canvasRef}
        className="star-cursor-canvas"
        aria-hidden="true"
      />

      {/* Custom star cursor */}
      <div ref={cursorRef} className="star-cursor" aria-hidden="true">
        ✦
      </div>
    </>
  );
}
