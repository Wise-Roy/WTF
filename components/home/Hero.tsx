import Image from "next/image";
import { Button } from "@/components/common";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-end justify-center pb-40 bg-[#0A0A0A] overflow-hidden">
      {/* Backdrop image — full bleed */}
      <Image
        src="/hero_bg.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark 40 overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Hero content — single centered column */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-4xl">
        {/* Eyebrow tagline — Space Grotesk, semibold, UPPERCASE, ~14px, tracked */}
        <span className="inline-block bg-[#C6FF00] text-[#0A0A0A] px-3 py-1 font-body text-sm font-semibold uppercase tracking-[0.15em]">
          EST. 2026 &middot; DROP 01 LIVE
        </span>

        {/* Headline — Anton, UPPERCASE, ~76-88px desktop, tight line height, loose tracking */}
        <h1 className="mt-8 font-heading text-4xl md:text-6xl lg:text-[4.5rem] font-bold uppercase tracking-[0.08em] text-[#F5F5F5] leading-[0.95]">
          Weird is a choice.
        </h1>

        {/* Paragraph — Space Grotesk, ~18-20px, regular line height, max-width ~60ch */}
        <p className="mt-6 font-body text-base md:text-lg text-[#F5F5F5]/70 max-w-[55ch] leading-normal">
          Worship The Fumes is streetwear for the ones who chose to stand out.
          Limited drops. Original art. No restocks. Join the cult or stay normal.
        </p>

        {/* Buttons — Space Grotesk, bold, UPPERCASE, loose tracking */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button href="/shop">Shop the Drop</Button>
          <Button href="/about" variant="secondary">
            Our Story
          </Button>
        </div>
      </div>
    </section>
  );
}
