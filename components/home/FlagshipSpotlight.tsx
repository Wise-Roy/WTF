"use client";

import Image from "next/image";
import { SectionWrapper, Tagline, Button } from "@/components/common";
import { useImageParallax } from "@/hooks";

export default function FlagshipSpotlight() {
  const imgRef = useImageParallax<HTMLDivElement>(0.18);

  return (
    <SectionWrapper scheme="acid">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Content — left, vertically centered */}
        <div>
          <Tagline className="bg-[#1a1a1a] text-[#FFF9D6]">Flagship Drop</Tagline>
          <h2 className="mt-6 font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[0.08em] leading-[0.95]">
            The &ldquo;Rat King&rdquo; hoodie
          </h2>
          <p className="mt-6 font-body text-lg text-[#1a1a1a]/80 leading-relaxed max-w-lg">
            Heavyweight 400gsm cotton. Hand-numbered. Each piece from Drop 01
            carries its own identity — this is the one that started the cult.
            Limited to 200 units worldwide.
          </p>
          <Button href="/shop" className="mt-8 bg-[#1a1a1a] text-[#FFF9D6] hover:bg-[#333]">
            Get the Rat King
          </Button>
        </div>

        {/* Media — parallax frame */}
        <div
          data-parallax-frame
          className="aspect-[3/4] relative overflow-hidden border border-black/10"
        >
          <div
            ref={imgRef}
            className="absolute -inset-[12%] will-change-transform"
            style={{ transform: "translate3d(0, 0, 0)" }}
          >
            <Image
              src="/eg.jpg"
              alt="The Rat King hoodie"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
