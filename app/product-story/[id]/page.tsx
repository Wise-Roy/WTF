"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { DbProduct } from "@/types";
import { useBag } from "@/context/BagContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductStoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [product, setProduct] = useState<DbProduct | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => setProduct(d.data?.product || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/collections");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF9D6] flex items-center justify-center pt-20">
        <div className="h-8 w-8 border-2 border-[#C6FF00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FFF9D6] flex items-center justify-center pt-20">
        <p className="text-[#1a1a1a]/50 text-lg">Product not found.</p>
      </div>
    );
  }

  return <StoryLayout product={product} />;
}

/* ─── Toast ─── */
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#1a1a1a] text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-full border-2 border-[#DF2877] animate-[slideUp_0.3s_ease-out]">
      {message}
    </div>
  );
}

/* ─── Main Layout ─── */
function StoryLayout({ product }: { product: DbProduct }) {
  const images = product.image?.length ? product.image : ["/eg.jpg"];
  const lookCount = images.length;
  const isSoldOut = product.prod_quantity <= 0;

  const [activeIndex, setActiveIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [hintVisible, setHintVisible] = useState(true);
  const [addedState, setAddedState] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const driverRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const { addItem } = useBag();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user || !product.id) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/wishlist");
        const data = await res.json();
        const inList = (data.items || []).some((item: { product_id: string }) => item.product_id === product.id);
        if (!cancelled) setWishlisted(inList);
      } catch {
        // ignore
      }
    })();
    return () => { cancelled = true; };
  }, [user, product.id]);

  const toggleWishlist = async () => {
    if (!user) {
      setToast("SIGN IN TO ADD TO FAVOURITES");
      setTimeout(() => { router.push("/sign-in"); }, 1500);
      return;
    }
    setWishlistLoading(true);
    try {
      if (wishlisted) {
        const res = await fetch("/api/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (res.ok) {
          setWishlisted(false);
          setToast("REMOVED FROM FAVOURITES");
        } else {
          const data = await res.json().catch(() => ({ error: "Failed" }));
          setToast(data.error || "FAILED TO REMOVE");
        }
      } else {
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ product_id: product.id }),
        });
        if (res.ok) {
          setWishlisted(true);
          setToast("ADDED TO FAVOURITES");
        } else if (res.status === 409) {
          setWishlisted(true);
          setToast("ALREADY IN FAVOURITES");
        } else {
          const data = await res.json().catch(() => ({ error: "Failed" }));
          setToast(data.error || "FAILED TO ADD");
        }
      }
    } catch (err) {
      setToast("NETWORK ERROR");
      console.error("Wishlist toggle failed:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  /* ─── Scroll-driven crossfade ─── */
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      const driver = driverRef.current;
      if (!driver) { raf = requestAnimationFrame(update); return; }

      const rect = driver.getBoundingClientRect();
      const vh = window.innerHeight;
      const navH = 64;
      const scrollable = rect.height - vh + navH;
      const scrolled = -rect.top + navH;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));

      const idx = Math.min(lookCount - 1, Math.floor(progress * lookCount));
      setActiveIndex(idx);

      if (progress > 0.01 && hintVisible) setHintVisible(false);

      // Crossfade images
      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = i === idx ? "1" : "0";
        if (!prefersReduced) {
          const localProgress = (progress * lookCount) - idx;
          const drift = (localProgress - 0.5) * 60;
          el.style.transform = i === idx ? `translate3d(0, ${drift}px, 0)` : "";
        }
      });

      // Ghost number drift
      if (ghostRef.current && !prefersReduced) {
        const localProgress = (progress * lookCount) - idx;
        ghostRef.current.style.transform = `translate(-50%, calc(-50% + ${-(localProgress - 0.5) * 40}px))`;
        ghostRef.current.textContent = String(idx + 1).padStart(2, "0");
      }

      // Progress bar
      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [lookCount, hintVisible]);

  const scrollToLook = (idx: number) => {
    const driver = driverRef.current;
    if (!driver) return;
    const rect = driver.getBoundingClientRect();
    const scrollable = rect.height - window.innerHeight + 64;
    const targetScroll = driver.offsetTop - 64 + (scrollable * idx) / lookCount;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  /* ─── Keyboard nav ─── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        scrollToLook(Math.max(0, Math.min(lookCount - 1, activeIndex + dir)));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, lookCount]);

  const handleAddToCart = () => {
    if (isSoldOut || addedState) return;
    addItem({
      id: product.id,
      name: product.prod_name,
      price: product.prod_price,
      image: images[0],
    });
    setAddedState(true);
    setToast(`ADDED — ${product.prod_name} × ${quantity}`);
    setTimeout(() => setAddedState(false), 1500);
  };

  const handleShare = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setToast("LINK COPIED");
  };

  return (
    <div className="bg-[#FFF9D6] min-h-screen">
      {/* Breadcrumb */}
      <div className="sticky top-16 z-30 bg-[#FFF9D6] border-b border-[#1a1a1a]/10">
        <div className="mx-auto max-w-7xl px-6 md:px-12 lg:px-20 py-3 flex items-center justify-between text-xs uppercase tracking-widest text-[#1a1a1a]/60">
          <Link href="/collections" className="hover:text-[#DF2877] transition-colors">
            &larr; Back to Collection
          </Link>
        </div>
      </div>

      {/* ─── Desktop Triptych ─── */}
      <div className="hidden lg:block">
        <div
          ref={driverRef}
          className="relative mx-auto max-w-7xl px-6 xl:px-12"
          style={{ height: `${lookCount * 95}vh` }}
        >
          <div className="grid grid-cols-[1fr_minmax(0,620px)_1fr] gap-6 sticky top-[calc(64px+48px)]" style={{ height: "calc(100vh - 64px - 48px)" }}>

            {/* LEFT CARD — The Details */}
            <div
              className="bg-white border-2 border-[#1a1a1a] rounded-md flex flex-col justify-between overflow-hidden"
              style={{  height: "calc(72vh - 28px)" , alignSelf: "center" }}
            >
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="mt-3 font-heading text-2xl xl:text-3xl uppercase leading-[1.05] text-[#C6FF00]">
                  {product.prod_name}
                </h2>

                {[
                  { label: "Fabric", value: product.prod_fabric },
                  { label: "Fit", value: product.prod_fit },
                  { label: "Care", value: product.prod_care },
                ].filter((s) => s.value).length > 0 && (
                  <div className="mt-6 space-y-3 flex-1">
                    {[
                      { label: "Fabric", value: product.prod_fabric },
                      { label: "Fit", value: product.prod_fit },
                      { label: "Care", value: product.prod_care },
                    ].filter((s) => s.value).map((spec) => (
                      <div key={spec.label} className="border-t border-[#1a1a1a]/10 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#DF2877]">{spec.label}</span>
                        <p className="text-xs text-[#1a1a1a]/70 mt-0.5">{spec.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="border-t border-[#1a1a1a]/10 px-6 py-3">
                <p className="text-[10px] italic text-[#1a1a1a]/40 text-center" style={{ fontFamily: "serif" }}>
                  Scroll the gallery — the sides stay put, only the look changes.
                </p>
              </div>
            </div>

            {/* CENTER — Image Stage */}
            <div
              ref={stageRef}
              className="relative rounded-md overflow-hidden bg-[#f0ede6] self-center"
              style={{ height: "72vh", maxWidth: "620px" }}
            >
              {/* Hint */}
              {hintVisible && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-[#FFF9D6] border border-[#1a1a1a]/20 rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#1a1a1a]/60 animate-pulse">
                  Scroll — only the look changes &darr;
                </div>
              )}

              {/* Ghost number */}
              <span
                ref={ghostRef}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 font-heading text-[20vw] lg:text-[12rem] text-[#1a1a1a]/[0.04] select-none pointer-events-none will-change-transform"
              >
                01
              </span>

              {/* Images */}
              {images.map((src, i) => (
                <div
                  key={i}
                  ref={(el) => { imageRefs.current[i] = el; }}
                  className="absolute inset-0 transition-opacity duration-500 will-change-[transform,opacity]"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  <Image
                    src={src}
                    alt={`${product.prod_name} — look ${i + 1}`}
                    fill
                    className="object-cover object-center"
                    sizes="620px"
                    priority={i === 0}
                  />
                  {/* Per-look overlay */}
                  <div className="absolute inset-0 pointer-events-none">
                    <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-widest text-white/70 drop-shadow-sm">
                      WTF
                    </span>
                    <div className="absolute bottom-4 left-4">
                      <span className="text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm">
                        Look {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    {/* Corner crop marks */}
                    <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-white/30" />
                    <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-white/30" />
                    <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-white/30" />
                    <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-white/30" />
                  </div>
                </div>
              ))}

              {/* HUD */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-[#FFF9D6]/90 backdrop-blur-sm border border-[#1a1a1a]/20 rounded-full px-4 py-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => scrollToLook(Math.max(0, activeIndex - 1))}
                  className="text-[#1a1a1a]/60 hover:text-[#DF2877] transition-colors text-sm"
                  aria-label="Previous look"
                >
                  &larr;
                </button>
                <div className="flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => scrollToLook(i)}
                      aria-label={`Go to look ${i + 1}`}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === activeIndex ? "w-5 bg-[#DF2877]" : "w-2 bg-[#1a1a1a]/20 hover:bg-[#1a1a1a]/40"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-bold tracking-wider text-[#1a1a1a]/60 tabular-nums">
                  {String(activeIndex + 1).padStart(2, "0")} / {String(lookCount).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => scrollToLook(Math.min(lookCount - 1, activeIndex + 1))}
                  className="text-[#1a1a1a]/60 hover:text-[#DF2877] transition-colors text-sm"
                  aria-label="Next look"
                >
                  &rarr;
                </button>
              </div>

              {/* Progress bar */}
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]/10">
                <div ref={progressBarRef} className="h-full bg-[#DF2877] transition-[width] duration-100" style={{ width: 0 }} />
              </div>
            </div>

            {/* RIGHT CARD — The Price */}
            <div
              className="bg-white border-2 border-[#1a1a1a] rounded-md flex flex-col justify-between overflow-hidden"
              style={{ height: "calc(72vh - 28px)", alignSelf: "center" }}
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-baseline gap-3">
                  <span className="font-heading text-3xl text-[#C6FF00]">
                    ₹{product.prod_price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/40">
                    Price / Incl. all taxes
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  {isSoldOut && (
                    <span className="text-xs uppercase tracking-wider text-red-600 font-bold">Sold Out</span>
                  )}
                </div>

                {/* Quantity */}
                <div className="mt-8">
                  <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/60">Quantity</span>
                  <div className="mt-2 inline-flex items-center border-2 border-[#1a1a1a] rounded-sm">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1.5 text-sm font-bold hover:bg-[#1a1a1a]/5 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-1.5 text-sm font-bold tabular-nums border-x-2 border-[#1a1a1a]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(9, quantity + 1))}
                      className="px-3 py-1.5 text-sm font-bold hover:bg-[#1a1a1a]/5 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={isSoldOut}
                  className={`mt-6 w-full py-3 text-xs font-bold uppercase tracking-[0.14em] border-2 rounded-sm transition-colors ${
                    isSoldOut
                      ? "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 border-[#1a1a1a]/10"
                      : addedState
                        ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                        : "bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#DF2877] hover:border-[#DF2877]"
                  }`}
                >
                  {isSoldOut ? "Sold Out" : addedState ? "Added ✓" : `Add to Cart — ₹${(product.prod_price * quantity).toLocaleString("en-IN")}`}
                </button>

                {/* Wishlist + Share */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={toggleWishlist}
                    disabled={wishlistLoading}
                    className={`py-2 text-[10px] font-bold uppercase tracking-[0.14em] border-2 rounded-sm transition-colors disabled:opacity-50 ${
                      wishlisted
                        ? "border-[#DF2877] bg-[#DF2877] text-white"
                        : "border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#FFD9E7]"
                    }`}
                  >
                    {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
                  </button>
                </div>

                <div className="flex-1" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Mobile Layout ─── */}
      <div className="lg:hidden">
        <MobileStory
          product={product}
          images={images}
          lookCount={lookCount}
          isSoldOut={isSoldOut}
          quantity={quantity}
          setQuantity={setQuantity}
          addedState={addedState}
          onAddToCart={handleAddToCart}
          onShare={handleShare}
          wishlisted={wishlisted}
          wishlistLoading={wishlistLoading}
          onToggleWishlist={toggleWishlist}
        />
      </div>

      {/* "You may also like" placeholder */}
      {/* TODO: YOU MAY ALSO LIKE section goes here */}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes slideUp {
          from { transform: translate(-50%, 20px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── Mobile Story ─── */
function MobileStory({
  product,
  images,
  lookCount,
  isSoldOut,
  quantity,
  setQuantity,
  addedState,
  onAddToCart,
  onShare,
  wishlisted,
  wishlistLoading,
  onToggleWishlist,
}: {
  product: DbProduct;
  images: string[];
  lookCount: number;
  isSoldOut: boolean;
  quantity: number;
  setQuantity: (q: number) => void;
  addedState: boolean;
  onAddToCart: () => void;
  onShare: () => void;
  wishlisted: boolean;
  wishlistLoading: boolean;
  onToggleWishlist: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const driverRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const update = () => {
      const driver = driverRef.current;
      if (!driver) { raf = requestAnimationFrame(update); return; }

      const rect = driver.getBoundingClientRect();
      const vh = window.innerHeight;
      const navH = 64;
      const scrollable = rect.height - vh + navH + 48;
      const scrolled = -rect.top + navH + 48;
      const progress = Math.max(0, Math.min(1, scrolled / scrollable));
      const idx = Math.min(lookCount - 1, Math.floor(progress * lookCount));

      setActiveIndex(idx);

      imageRefs.current.forEach((el, i) => {
        if (!el) return;
        el.style.opacity = i === idx ? "1" : "0";
        if (!prefersReduced) {
          const localProgress = (progress * lookCount) - idx;
          const drift = (localProgress - 0.5) * 30;
          el.style.transform = i === idx ? `translate3d(0, ${drift}px, 0)` : "";
        }
      });

      if (progressBarRef.current) {
        progressBarRef.current.style.width = `${progress * 100}%`;
      }

      raf = requestAnimationFrame(update);
    };

    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [lookCount]);

  return (
    <>
      {/* Compact header */}
      <div className="px-6 pt-6 pb-4">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#DF2877]">
          ✶ {product.prod_label || "DROP 001"}
        </span>
        <h1 className="mt-2 font-heading text-2xl uppercase leading-[1.05] text-[#1a1a1a]">
          {product.prod_name}
        </h1>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-heading text-xl text-[#1a1a1a]">
            ₹{product.prod_price.toLocaleString("en-IN")}
          </span>
          {!isSoldOut && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#1a1a1a]/50 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#DF2877] animate-pulse" />
              {product.prod_quantity} left
            </span>
          )}
        </div>
      </div>

      {/* Gallery stage (scroll-driven) */}
      <div
        ref={driverRef}
        className="relative"
        style={{ height: `${lookCount * 80}vh` }}
      >
        <div className="sticky top-[calc(64px+48px)] overflow-hidden rounded-lg mx-4" style={{ height: "56vh" }}>
          {images.map((src, i) => (
            <div
              key={i}
              ref={(el) => { imageRefs.current[i] = el; }}
              className="absolute inset-0 transition-opacity duration-500 will-change-[transform,opacity]"
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <Image
                src={src}
                alt={`${product.prod_name} — look ${i + 1}`}
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority={i === 0}
              />
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute bottom-3 left-3 text-xs font-bold uppercase tracking-widest text-white drop-shadow-sm">
                  Look {String(i + 1).padStart(2, "0")}
                </span>
                <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-widest text-white/60">
                  WTF
                </span>
              </div>
            </div>
          ))}

          {/* HUD */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-[#FFF9D6]/90 backdrop-blur-sm border border-[#1a1a1a]/20 rounded-full px-3 py-1.5 flex items-center gap-2">
            <div className="flex gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIndex ? "w-4 bg-[#DF2877]" : "w-1.5 bg-[#1a1a1a]/20"
                  }`}
                />
              ))}
            </div>
            <span className="text-[9px] font-bold tracking-wider text-[#1a1a1a]/50 tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")} / {String(lookCount).padStart(2, "0")}
            </span>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1a1a1a]/10">
            <div ref={progressBarRef} className="h-full bg-[#DF2877]" style={{ width: 0 }} />
          </div>
        </div>
      </div>

      {/* Details card */}
      <div className="mx-4 mt-8 bg-white border-2 border-[#1a1a1a] rounded-md p-6" style={{ boxShadow: "5px 5px 0 #FFD9E7" }}>
        <h2 className="font-heading text-lg uppercase text-[#1a1a1a]">The Details</h2>
        {[
          { label: "Fabric", value: product.prod_fabric },
          { label: "Fit", value: product.prod_fit },
          { label: "Care", value: product.prod_care },
        ].filter((s) => s.value).length > 0 && (
          <div className="mt-4 space-y-3">
            {[
              { label: "Fabric", value: product.prod_fabric },
              { label: "Fit", value: product.prod_fit },
              { label: "Care", value: product.prod_care },
            ].filter((s) => s.value).map((spec) => (
              <div key={spec.label} className="border-t border-[#1a1a1a]/10 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#DF2877]">{spec.label}</span>
                <p className="text-xs text-[#1a1a1a]/70 mt-0.5">{spec.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy panel */}
      <div className="mx-4 mt-4 bg-white border-2 border-[#1a1a1a] rounded-md p-6 mb-24" style={{ boxShadow: "5px 5px 0 #FFD9E7" }}>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#1a1a1a]/60">Quantity</span>
          <div className="inline-flex items-center border-2 border-[#1a1a1a] rounded-sm">
            <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1 text-sm font-bold">−</button>
            <span className="px-3 py-1 text-sm font-bold tabular-nums border-x-2 border-[#1a1a1a]">{quantity}</span>
            <button type="button" onClick={() => setQuantity(Math.min(9, quantity + 1))} className="px-3 py-1 text-sm font-bold">+</button>
          </div>
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={isSoldOut}
          className={`mt-4 w-full py-3 text-xs font-bold uppercase tracking-[0.14em] border-2 rounded-sm transition-colors ${
            isSoldOut
              ? "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 border-[#1a1a1a]/10"
              : addedState
                ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                : "bg-[#1a1a1a] text-white border-[#1a1a1a] hover:bg-[#DF2877] hover:border-[#DF2877]"
          }`}
        >
          {isSoldOut ? "Sold Out" : addedState ? "Added ✓" : `Add to Cart — ₹${(product.prod_price * quantity).toLocaleString("en-IN")}`}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onToggleWishlist}
            disabled={wishlistLoading}
            className={`py-2 text-[10px] font-bold uppercase tracking-[0.14em] border-2 rounded-sm transition-colors disabled:opacity-50 ${
              wishlisted
                ? "border-[#DF2877] bg-[#DF2877] text-white"
                : "border-[#1a1a1a] hover:bg-[#FFD9E7]"
            }`}
          >
            {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
          </button>
          <button type="button" onClick={onShare} className="py-2 text-[10px] font-bold uppercase tracking-[0.14em] border-2 border-[#1a1a1a] rounded-sm hover:bg-[#FFD9E7] transition-colors">
            ↗ Share
          </button>
        </div>

        <p className="mt-4 text-[9px] uppercase tracking-[0.10em] text-[#1a1a1a]/40 text-center font-bold">
          Free shipping over ₹5,000 ✶ 7-day returns ✶ Never restocked
        </p>
      </div>

      {/* Sticky mobile buy bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t-2 border-[#1a1a1a] px-4 py-3 flex items-center gap-3">
        <span className="font-heading text-lg text-[#1a1a1a] shrink-0">
          ₹{product.prod_price.toLocaleString("en-IN")}
        </span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={onAddToCart}
          disabled={isSoldOut}
          className={`px-6 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] border-2 rounded-sm transition-colors ${
            isSoldOut
              ? "bg-[#1a1a1a]/10 text-[#1a1a1a]/30 border-[#1a1a1a]/10"
              : addedState
                ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                : "bg-[#1a1a1a] text-white border-[#1a1a1a]"
          }`}
        >
          {isSoldOut ? "Sold Out" : addedState ? "Added ✓" : "Add →"}
        </button>
      </div>
    </>
  );
}
