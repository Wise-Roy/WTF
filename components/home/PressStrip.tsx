"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SectionWrapper, Tagline, SectionHeading, Button, Carousel } from "@/components/common";
import { useReveal } from "@/hooks";

const MAX_IMAGES = 5;

function PressCard({ src, index }: { src: string; index: number }) {
  return (
    <Link
      href="/press"
      aria-label={`Press image ${index + 1}`}
      className="group block rounded-xl border border-black/[0.06] bg-white overflow-hidden transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-[#C6FF00] hover:-translate-y-1 hover:shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_32px_rgba(0,0,0,0.10)]"
      style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)" }}
    >
      <div className="relative aspect-[4/5] overflow-hidden select-none">
        <Image
          src={src}
          alt={`Press image ${index + 1}`}
          fill
          sizes="(max-width: 640px) 78vw, (max-width: 1024px) 320px, 360px"
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    </Link>
  );
}

export default function PressStrip() {
  const headerRef = useReveal<HTMLDivElement>();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/press", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => setImages((d.data?.images || []).slice(0, MAX_IMAGES)))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  if (!images.length) return null;

  return (
    <SectionWrapper scheme="acid" className="!bg-transparent">
      <div ref={headerRef} className="text-left">
        <Tagline className="bg-[#1a1a1a] text-black">Press &amp; Gallery</Tagline>
        <SectionHeading className="mt-6" style={{ WebkitTextStroke: "1.5px #C6FF00", color: "black" }}>
          For Ur Eyes
        </SectionHeading>
        <p className="mt-6 max-w-2xl text-lg text-[#1a1a1a]/80 leading-relaxed">
          A visual archive of the ideas, inspirations, and moments that shape our garments.
        </p>
        <Button href="/press" className="mt-8 bg-[#1a1a1a] text-black hover:bg-[#333]">
          View press &amp; gallery
        </Button>
      </div>

      <Carousel
        items={images}
        getKey={(src, i) => `${src}-${i}`}
        renderItem={(src, i) => <PressCard src={src} index={i} />}
        heightFactor={1.25}
        footerHeight={0}
      />
    </SectionWrapper>
  );
}
