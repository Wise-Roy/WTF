Build a premium cinematic website loading sequence as a single self-contained HTML file (HTML + CSS + vanilla JS, no libraries).

=== LOGO RULES (CRITICAL — HIGHEST PRIORITY) ===
- Load my logo from [YOUR_LOGO_FILE.svg or .png — white, transparent background].
- The logo must be preserved EXACTLY: never redesign, redraw, distort, morph, recolor, or add any text/symbols to it.
- Transform it ONLY via scale, rotation, position, and opacity — never via skew, non-uniform scaling, path edits, or filters that change its shape.
- The logo appears twice: a "traveler" instance (animated through the sequence) and a final static instance inside the navbar. Both must be pixel-identical.
- Keep the logo rendered as vector/DOM (SVG or img), NOT inside the particle canvas, so it stays razor-sharp at every scale.

=== SEQUENCE (total ~11 seconds, one continuous master timeline driven by requestAnimationFrame) ===
1. DARK INTRO (0–0.15s): near-black background (#040404). Nothing else.
2. LOGO APPEARS (0.15–1.5s): logo fades in at screen center, small (~35–40% of max size), subtle soft white glow (layered drop-shadow). Ease-out cubic.
3. ORBITAL STAR FIELD BUILDS (0.7–3.3s): glowing white stars + fine dust particles revolve around the logo in 3 clean circular orbits of different radii/speeds. Particle opacity and orbit radius ramp up smoothly with in-out easing. Some particles slightly warm-white (255,230,195) for elegance. Add hairline circular orbit guide rings at very low opacity (~4%). Twinkle via sine oscillation per particle. Elegant and celestial — NOT a chaotic explosion. No random jitter; every particle follows deterministic circular motion.
4. SPIN + ENLARGE (3.3–6.0s): the logo rotates exactly 360° around its own center while scaling up to maximum size (~70% of viewport width, capped by height), using quartic in-out easing for a dramatic, cinematic accelerate-then-decelerate feel. Orbit speed and radius expand slightly in sync. Rotation must end precisely at 0° so the logo settles upright.
5. HERO HOLD (6.0–7.35s): logo holds at max size, perfectly sharp and centered, with a brief gentle glow bloom (subtle, no shake).
6. TRAVEL TO NAVBAR (7.35–9.35s): logo glides from center to its exact final position in the top navigation bar (measure the navbar logo element's bounding rect live), while scaling down proportionally to navbar size. Use quintic in-out easing — the most refined curve of the whole sequence. No arcs, no overshoot.
7. PARTICLE DISSOLVE (7.6–9.65s): the entire star field's center point drifts toward the navbar and its radius contracts, while global particle opacity fades to zero — the particles dissolve BEHIND the travelling logo. Ambient background dust fades out too.
8. SETTLE (9.35–10.8s): at the exact moment the traveler aligns with the navbar slot, swap it invisibly for the real navbar logo (opacity 1), give it one soft glow pulse, fade in a hairline bottom border on the navbar and a faint radial floor glow. Logo ends completely stable, sharp, ready for content. Then stop the animation loop cleanly (cancelAnimationFrame, clear canvas, hide traveler).

=== TECHNICAL REQUIREMENTS ===
- Implement the timeline as time-based keyframe tracks with a generic interpolation function (track(t, [[time, value, easeFn], ...])) — NOT CSS keyframe animations for the logo/particles.
- Custom easing functions: outCubic, inCubic, inOutCubic, inOutQuart, inOutQuint.
- Particles on a full-screen <canvas> with 'lighter' composite blending; pre-render soft radial-gradient glow sprites and 4-point star-sparkle sprites offscreen once, then drawImage them (fast, no per-frame gradient creation).
- Devicepixelratio-aware canvas (capped at 2), handles window resize (recompute canvas size and max logo scale responsively).
- Particles move by angular velocity integrated with delta-time (clamped dt), so speed is frame-rate independent and never jumps.
- Navbar logo destination measured from the DOM (getBoundingClientRect) just before travel begins.

=== FINISHING LAYER ===
- Fixed vignette overlay (radial gradient, transparent center → rgba(0,0,0,.55) edges).
- Subtle animated film grain overlay (SVG feTurbulence noise as data-URI background, ~5% opacity, stepping positions every ~0.9s).
- Z-index order: background glow < canvas particles < traveling logo < vignette < navbar < grain.

=== ACCESSIBILITY & FALLBACK ===
- If prefers-reduced-motion: reduce → skip the entire sequence and show the settled navbar logo immediately.

=== STYLE ===
Premium fashion brand. Dark, minimal, sophisticated, high-end editorial. White-on-black only (white logo, white/warm-white particles). Smooth cinematic easing throughout. No camera shake, no randomness in motion paths, no extra typography, no extra symbols, no color changes.