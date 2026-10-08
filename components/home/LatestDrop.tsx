"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, ProductSkeleton, Button } from "@/components/common";
import { useReveal } from "@/hooks";
import { DbProduct } from "@/types";

/*
 * Horizontal 3D carousel — independent from page scroll.
 * Interaction: drag, touch swipe, horizontal wheel/trackpad.
 * 3 cards visible (center active + 2 receded), infinite loop.
 * Continuous interpolation via rAF for 60fps.
 */

function Carousel({ products }: { products: DbProduct[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Continuous position (fractional index) for smooth interpolation
  const posRef = useRef(0); // current interpolated position
  const targetRef = useRef(0); // snap target
  const velRef = useRef(0);
  const rafRef = useRef(0);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartPos = useRef(0);
  const lastDragX = useRef(0);
  const lastDragTime = useRef(0);

  const count = products.length;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Wrap index for infinite loop
  const wrap = useCallback(
    (i: number) => ((i % count) + count) % count,
    [count]
  );

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 340;
    if (window.innerWidth < 640) return Math.min(300, window.innerWidth * 0.78);
    if (window.innerWidth < 1024) return 320;
    return 360;
  }, []);

  const getGap = useCallback(() => {
    if (typeof window === "undefined") return 24;
    return window.innerWidth < 640 ? 16 : 24;
  }, []);

  // Snap to nearest integer position with spring physics
  const snapTo = useCallback(
    (target: number) => {
      targetRef.current = target;
      setActiveIndex(wrap(Math.round(target)));
    },
    [wrap]
  );

  // Animation loop — spring interpolation toward target
  useEffect(() => {
    if (reducedMotion) return;

    const animate = () => {
      if (!isDragging.current) {
        const target = targetRef.current;
        const current = posRef.current;
        const diff = target - current;

        // Spring physics
        const spring = 0.12;
        const damping = 0.78;
        velRef.current = velRef.current * damping + diff * spring;
        posRef.current += velRef.current;

        // Settle
        if (Math.abs(diff) < 0.001 && Math.abs(velRef.current) < 0.001) {
          posRef.current = target;
          velRef.current = 0;
        }
      }

      // Apply transforms to cards
      const viewport = viewportRef.current;
      if (viewport) {
        const cards = viewport.querySelectorAll<HTMLElement>("[data-card-idx]");
        const cardWidth = getCardWidth();
        const gap = getGap();
        const step = cardWidth + gap;
        const centerX = viewport.offsetWidth / 2;
        const pos = posRef.current;

        cards.forEach((card) => {
          const idx = Number(card.dataset.cardIdx);

          // Offset from active position (handle wrapping)
          let offset = idx - pos;
          // Wrap offset to [-count/2, count/2] for infinite loop
          while (offset > count / 2) offset -= count;
          while (offset < -count / 2) offset += count;

          const x = centerX + offset * step - cardWidth / 2;
          const absOffset = Math.abs(offset);

          // 3D depth based on distance from center
          const scale = Math.max(0.7, 1 - absOffset * 0.12);
          const zTranslate = -absOffset * 60;
          const opacity = Math.max(0.3, 1 - absOffset * 0.3);
          const rotateY = offset * -3; // subtle perspective rotation

          // Hide cards too far from center
          const visible = absOffset <= 2.5;

          card.style.transform = `translate3d(${x}px, 0, ${zTranslate}px) scale(${scale}) rotateY(${rotateY}deg)`;
          card.style.opacity = visible ? String(opacity) : "0";
          card.style.zIndex = String(100 - Math.round(absOffset * 10));
          card.style.pointerEvents = absOffset < 0.5 ? "auto" : "none";
        });
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [count, getCardWidth, getGap, reducedMotion]);

  const hasDragged = useRef(false);

  // Drag handlers
  const onDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    hasDragged.current = false;
    dragStartX.current = clientX;
    dragStartPos.current = posRef.current;
    lastDragX.current = clientX;
    lastDragTime.current = Date.now();
    velRef.current = 0;
  }, []);

  const onDragMove = useCallback(
    (clientX: number) => {
      if (!isDragging.current) return;
      const cardWidth = getCardWidth();
      const gap = getGap();
      const step = cardWidth + gap;
      const dx = clientX - dragStartX.current;
      if (Math.abs(dx) > 5) hasDragged.current = true;
      posRef.current = dragStartPos.current - dx / step;

      // Track velocity
      const now = Date.now();
      const dt = now - lastDragTime.current;
      if (dt > 0) {
        velRef.current = -(clientX - lastDragX.current) / step / dt * 16;
      }
      lastDragX.current = clientX;
      lastDragTime.current = now;

      setActiveIndex(wrap(Math.round(posRef.current)));
    },
    [getCardWidth, getGap, wrap]
  );

  const onDragEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;

    // Fling: if velocity is high, go extra card(s)
    const fling = Math.abs(velRef.current) > 0.02 ? Math.sign(velRef.current) : 0;
    const nearest = Math.round(posRef.current + fling);
    snapTo(nearest);
  }, [snapTo]);

  // Forward tap (non-drag click) to element underneath overlay
  const forwardClick = useCallback((clientX: number, clientY: number) => {
    const overlay = viewportRef.current?.querySelector("[data-drag-overlay]") as HTMLElement | null;
    if (overlay) {
      overlay.style.pointerEvents = "none";
      const el = document.elementFromPoint(clientX, clientY) as HTMLElement | null;
      overlay.style.pointerEvents = "auto";
      if (el) {
        const link = el.closest("a");
        if (link) {
          link.click();
          return;
        }
        el.click();
      }
    }
  }, []);

  // Mouse events
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      onDragStart(e.clientX);
      const startClientX = e.clientX;
      const startClientY = e.clientY;
      const onMove = (ev: MouseEvent) => onDragMove(ev.clientX);
      const onUp = () => {
        onDragEnd();
        // If it was a tap (not a drag), forward click to card underneath
        if (!hasDragged.current) {
          forwardClick(startClientX, startClientY);
        }
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onDragStart, onDragMove, onDragEnd, forwardClick]
  );

  // Touch events
  const touchStartCoords = useRef({ x: 0, y: 0 });
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      touchStartCoords.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      onDragStart(e.touches[0].clientX);
    },
    [onDragStart]
  );
  const onTouchMove = useCallback(
    (e: React.TouchEvent) => onDragMove(e.touches[0].clientX),
    [onDragMove]
  );
  const onTouchEnd = useCallback(() => {
    onDragEnd();
    if (!hasDragged.current) {
      forwardClick(touchStartCoords.current.x, touchStartCoords.current.y);
    }
  }, [onDragEnd, forwardClick]);

  // Wheel / trackpad — use deltaY (vertical scroll) over carousel to navigate cards.
  // Avoids macOS browser back/forward gesture conflict with horizontal swipe.
  // Also supports deltaX for external mice with horizontal wheels.
  // Position moves freely during scroll; snaps to nearest card after scrolling stops.
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    let snapTimeout: ReturnType<typeof setTimeout>;

    const onWheel = (e: WheelEvent) => {
      // Pick whichever axis has more movement
      const delta =
        Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 2) return;

      e.preventDefault(); // stop page scroll while over carousel

      const cardWidth = getCardWidth();
      const gap = getGap();
      const step = cardWidth + gap;

      // Move position continuously — no immediate snapping
      const move = delta / step;
      targetRef.current += move;
      posRef.current = targetRef.current;
      velRef.current = 0;
      setActiveIndex(wrap(Math.round(targetRef.current)));

      // Snap to nearest card after scrolling stops
      clearTimeout(snapTimeout);
      snapTimeout = setTimeout(() => {
        snapTo(Math.round(targetRef.current));
      }, 150);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      clearTimeout(snapTimeout);
    };
  }, [getCardWidth, getGap, snapTo, wrap]);

  // Resize recalc
  useEffect(() => {
    const onResize = () => {
      snapTo(Math.round(posRef.current));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [snapTo]);

  const cardWidth = getCardWidth();

  return (
    <div className="mt-16">
      {/* 3D Viewport */}
      <div
        ref={viewportRef}
        className="relative select-none overflow-hidden"
        style={{
          perspective: "1200px",
          height: `calc(${cardWidth}px * 1.55 + 80px)`, // card aspect ~4:5 + info
        }}
      >
        {/* Preserve-3d container for depth */}
        <div
          className="absolute inset-0"
          style={{ transformStyle: "preserve-3d", pointerEvents: "none" }}
        >
          {products.map((product, i) => (
            <div
              key={product.id}
              data-card-idx={i}
              className="absolute top-0 will-change-transform"
              style={{
                width: `${cardWidth}px`,
                transition: reducedMotion ? "none" : undefined,
              }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Transparent drag overlay — captures all pointer/touch events */}
        <div
          data-drag-overlay
          className="absolute inset-0 z-50 cursor-grab active:cursor-grabbing"
          style={{ touchAction: "none" }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        />
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              // Find shortest path for infinite loop
              let diff = i - wrap(Math.round(posRef.current));
              while (diff > count / 2) diff -= count;
              while (diff < -count / 2) diff += count;
              snapTo(posRef.current + diff);
            }}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-6 h-2 bg-[#C6FF00]"
                : "w-2 h-2 bg-black/20 hover:bg-black/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Swipe hint */}
      <p className="text-center text-xs text-black/30 mt-3 uppercase tracking-wider">
        Swipe to browse
      </p>
    </div>
  );
}

export default function LatestDrop() {
  const headerRef = useReveal<HTMLDivElement>();
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?ranked=true&limit=6")
      .then((r) => r.json())
      .then((d) => setProducts(d.data?.products || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <SectionWrapper scheme="dark">
      <div ref={headerRef} className="text-left">
        <Tagline>Latest Releases</Tagline>
        <SectionHeading className="mt-6">Extra, Extra !</SectionHeading>
        <p className="mt-6 max-w-2xl text-lg text-black/70 leading-relaxed">
          Six new designs. Hand-drawn, numbered, and never restocked. Drop 01 is
          live — grab yours before they vanish into the fumes.
        </p>
        <Button href="/shop" className="mt-8">
          Shop all
        </Button>
      </div>

      {loading ? (
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <p className="mt-16 text-center text-black/40 py-12">No products yet.</p>
      ) : (
        <Carousel products={products} />
      )}
    </SectionWrapper>
  );
}
