"use client";

import { useRef, useEffect, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
}

const COLORS = ["#FFC94D", "#FFC94D", "#FFE08A", "#FFAD33", "#FFC94D"];
const SPAWN_DISTANCE = 10;
const TRAIL_PARTICLES = 2;
const BURST_PARTICLES = 10;

function drawStar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rotation: number,
  opacity: number,
  color: string
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.globalAlpha = opacity;
  ctx.fillStyle = color;

  // Four-point star shape
  ctx.beginPath();
  const outer = size;
  const inner = size * 0.3;
  for (let i = 0; i < 8; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const angle = (i * Math.PI) / 4 - Math.PI / 2;
    if (i === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
    else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
  }
  ctx.closePath();
  ctx.fill();

  // Subtle glow
  if (opacity > 0.3) {
    ctx.globalAlpha = opacity * 0.15;
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 2;
    ctx.fill();
  }

  ctx.restore();
}

export function useStarCursor(enabled: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const lastPosRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef<number>(0);
  const isVisibleRef = useRef(false);
  const overNavRef = useRef(false);

  const spawnParticle = useCallback(
    (x: number, y: number, isBurst: boolean) => {
      const angle = isBurst ? Math.random() * Math.PI * 2 : Math.random() * Math.PI * 2;
      const speed = isBurst ? 1.5 + Math.random() * 3 : 0.2 + Math.random() * 0.8;
      const life = isBurst ? 500 + Math.random() * 400 : 400 + Math.random() * 400;

      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed + (isBurst ? 0 : 0.3),
        size: isBurst ? 2 + Math.random() * 4 : 1.5 + Math.random() * 3,
        opacity: 0.4 + Math.random() * 0.6,
        life,
        maxLife: life,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      // Check if cursor is over the navbar
      const target = e.target as HTMLElement;
      const isOverNav = !!target.closest("nav");

      if (isOverNav !== overNavRef.current) {
        overNavRef.current = isOverNav;
        if (cursorRef.current) {
          cursorRef.current.style.opacity = isOverNav ? "0" : "1";
        }
      }

      if (!isOverNav) {
        if (!isVisibleRef.current) {
          isVisibleRef.current = true;
          if (cursorRef.current) cursorRef.current.style.opacity = "1";
        }

        // Update cursor position directly
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }

        // Spawn particles based on distance traveled
        const dx = e.clientX - lastPosRef.current.x;
        const dy = e.clientY - lastPosRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > SPAWN_DISTANCE) {
          for (let i = 0; i < TRAIL_PARTICLES; i++) {
            spawnParticle(e.clientX, e.clientY, false);
          }
          lastPosRef.current = { x: e.clientX, y: e.clientY };
        }
      } else {
        // Keep position updated so cursor doesn't jump when leaving nav
        if (cursorRef.current) {
          cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
        lastPosRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (overNavRef.current) return;
      for (let i = 0; i < BURST_PARTICLES; i++) {
        spawnParticle(e.clientX, e.clientY, true);
      }
    };

    const onMouseLeave = () => {
      isVisibleRef.current = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
    };

    const onMouseEnter = (e: MouseEvent) => {
      isVisibleRef.current = true;
      mouseRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "1";
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
      }
    };

    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min(time - lastTime, 50); // cap delta
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const particles = particlesRef.current;
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.01; // tiny gravity
        p.rotation += p.rotationSpeed;

        const progress = p.life / p.maxLife;
        const currentOpacity = p.opacity * progress;
        const currentSize = p.size * (0.5 + progress * 0.5);

        drawStar(ctx, p.x, p.y, currentSize, p.rotation, currentOpacity, p.color);
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    document.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [enabled, spawnParticle]);

  return { canvasRef, cursorRef };
}
