"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SectionWrapper, Tagline, SectionHeading } from "@/components/common";
import { useReveal } from "@/hooks";

// Each marquee half repeats the logos until it holds at least this many, so the band never shows a gap on wide screens.
const MIN_PER_HALF = 8;

function Logo({ src, index }: { src: string; index: number }) {
  return (
    <div className="relative h-12 w-32 md:h-16 md:w-44 shrink-0">
      <Image
        src={src}
        alt={`Featured in press logo ${index + 1}`}
        fill
        sizes="(max-width: 768px) 128px, 176px"
        className="object-contain"
      />
    </div>
  );
}

export default function FeaturedIn() {
  const headerRef = useReveal<HTMLDivElement>();
  const [logos, setLogos] = useState<string[]>([]);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/featured", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => setLogos(d.data?.images || []))
      .catch(() => {});
    return () => ac.abort();
  }, []);

  if (!logos.length) return null;

  const half = Array.from({ length: Math.ceil(MIN_PER_HALF / logos.length) }, () => logos).flat();

  return (
    <SectionWrapper scheme="acid" className="!bg-transparent !py-16 md:!py-24">
      <div ref={headerRef} className="text-left">
        <Tagline className="bg-[#1a1a1a] text-[#111111]">Selected Press</Tagline>
        <SectionHeading className="mt-6" style={{ WebkitTextStroke: "1.5px #C6FF00", color: "black" }}>
          Featured In
        </SectionHeading>
      </div>

      <div className="mt-10 md:mt-14 -mx-6 md:-mx-12 lg:-mx-20 py-6 md:py-8 overflow-hidden">
        {logos.length === 1 ? (
          <div className="flex justify-center">
            <Logo src={logos[0]} index={0} />
          </div>
        ) : (
          <div
            className="featured-marquee flex w-max"
            style={{ animationDuration: `${half.length * 3}s` }}
          >
            {[0, 1].map((copy) => (
              <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center gap-12 md:gap-20 pr-12 md:pr-20">
                {half.map((src, i) => (
                  <Logo key={`${copy}-${i}`} src={src} index={i % logos.length} />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionWrapper>
  );
}
