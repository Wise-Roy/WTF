"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { SectionWrapper, Tagline, SectionHeading, ProductCard, ProductSkeleton, Button } from "@/components/common";
import { useReveal } from "@/hooks";
import { DbProduct } from "@/types";

function Carousel({ products }: { products: DbProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const currentTranslate = useRef(0);
  const prevTranslate = useRef(0);
  const animRef = useRef<number>(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);

  const count = products.length;

  const getCardWidth = useCallback(() => {
    if (typeof window === "undefined") return 340;
    if (window.innerWidth < 640) return Math.min(280, window.innerWidth * 0.75);
    if (window.innerWidth < 1024) return 320;
    return 360;
  }, []);

  const getGap = useCallback(() => {
    if (typeof window === "undefined") return 24;
    if (window.innerWidth < 640) return 16;
    return 24;
  }, []);

  const snapToIndex = useCallback((idx: number) => {
    const cardWidth = getCardWidth();
    const gap = getGap();
    const step = cardWidth + gap;
    const clamped = Math.max(0, Math.min(count - 1, idx));
    setActiveIndex(clamped);
    const target = -(clamped * step);
    currentTranslate.current = target;
    prevTranslate.current = target;
    if (trackRef.current) {
      trackRef.current.style.transition = "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)";
      trackRef.current.style.transform = `translateX(${target}px)`;
    }
  }, [count, getCardWidth, getGap]);

  const startAnimLoop = useCallback(() => {
    const loop = () => {
      if (trackRef.current) {
        trackRef.current.style.transform = `translateX(${currentTranslate.current}px)`;
      }
      if (isDragging.current) {
        animRef.current = requestAnimationFrame(loop);
      }
    };
    animRef.current = requestAnimationFrame(loop);
  }, []);

  const handleDragStart = useCallback((clientX: number) => {
    isDragging.current = true;
    startX.current = clientX;
    lastX.current = clientX;
    lastTime.current = Date.now();
    velocity.current = 0;
    if (trackRef.current) {
      trackRef.current.style.transition = "none";
    }
    startAnimLoop();
  }, [startAnimLoop]);

  const handleDragMove = useCallback((clientX: number) => {
    if (!isDragging.current) return;
    const diff = clientX - startX.current;
    currentTranslate.current = prevTranslate.current + diff;

    const now = Date.now();
    const dt = now - lastTime.current;
    if (dt > 0) {
      velocity.current = (clientX - lastX.current) / dt;
    }
    lastX.current = clientX;
    lastTime.current = now;
  }, []);

  const handleDragEnd = useCallback(() => {
    isDragging.current = false;
    cancelAnimationFrame(animRef.current);

    const cardWidth = getCardWidth();

    const movedBy = currentTranslate.current - prevTranslate.current;
    const velocityThreshold = 0.3;

    let newIndex = activeIndex;
    if (Math.abs(movedBy) > cardWidth * 0.2 || Math.abs(velocity.current) > velocityThreshold) {
      if (movedBy < 0 || velocity.current < -velocityThreshold) {
        newIndex = Math.min(count - 1, activeIndex + 1);
      } else {
        newIndex = Math.max(0, activeIndex - 1);
      }
    }

    snapToIndex(newIndex);
  }, [activeIndex, count, getCardWidth, snapToIndex]);

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX);
  }, [handleDragStart]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    handleDragMove(e.clientX);
  }, [handleDragMove]);

  const onMouseUp = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  const onMouseLeave = useCallback(() => {
    if (isDragging.current) handleDragEnd();
  }, [handleDragEnd]);

  // Touch events
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    handleDragStart(e.touches[0].clientX);
  }, [handleDragStart]);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    handleDragMove(e.touches[0].clientX);
  }, [handleDragMove]);

  const onTouchEnd = useCallback(() => {
    handleDragEnd();
  }, [handleDragEnd]);

  // Wheel horizontal scroll
  useEffect(() => {
    const track = trackRef.current?.parentElement;
    if (!track) return;

    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        if (e.deltaX > 20) snapToIndex(activeIndex + 1);
        else if (e.deltaX < -20) snapToIndex(activeIndex - 1);
      }
    };

    track.addEventListener("wheel", onWheel, { passive: false });
    return () => track.removeEventListener("wheel", onWheel);
  }, [activeIndex, snapToIndex]);

  // Init position via ref callback
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = "translateX(0px)";
    }
  }, []);

  const cardWidth = getCardWidth();
  const gap = getGap();

  return (
    <div className="mt-16">
      {/* Carousel viewport */}
      <div
        className="relative overflow-visible select-none"
        style={{ perspective: "1200px" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          ref={trackRef}
          className="flex will-change-transform"
          style={{
            gap: `${gap}px`,
            paddingLeft: `calc(50% - ${cardWidth / 2}px)`,
            paddingRight: `calc(50% - ${cardWidth / 2}px)`,
          }}
        >
          {products.map((product, i) => {
            const diff = i - activeIndex;
            const absDiff = Math.abs(diff);
            const scale = absDiff === 0 ? 1 : absDiff === 1 ? 0.88 : 0.78;
            const opacity = absDiff === 0 ? 1 : absDiff === 1 ? 0.7 : 0.5;
            const z = absDiff === 0 ? 50 : absDiff === 1 ? 0 : -30;

            return (
              <div
                key={product.id}
                className="shrink-0 transition-all duration-400 ease-out will-change-transform"
                style={{
                  width: `${cardWidth}px`,
                  transform: `scale(${scale}) translateZ(${z}px)`,
                  opacity,
                  zIndex: 10 - absDiff,
                  pointerEvents: absDiff === 0 ? "auto" : "none",
                }}
              >
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination dots */}
      <div className="flex items-center justify-center gap-2 mt-8">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => snapToIndex(i)}
            className={`rounded-full transition-all duration-300 ${
              i === activeIndex
                ? "w-6 h-2 bg-[#C6FF00]"
                : "w-2 h-2 bg-black/20 hover:bg-black/40"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
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
