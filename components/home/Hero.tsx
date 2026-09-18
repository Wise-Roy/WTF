import { Tagline, Button } from "@/components/common";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/60 via-transparent to-[#0A0A0A] z-10" />

      {/* Pattern background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_35px,#C6FF00_35px,#C6FF00_36px)]" />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-6 max-w-4xl">
        <Tagline>EST. 2026 &middot; DROP 01 LIVE</Tagline>

        <h1 className="mt-8 font-heading text-6xl md:text-8xl lg:text-9xl font-bold uppercase tracking-wider text-[#F5F5F5] leading-none">
          Weird is a choice.
        </h1>

        <p className="mt-8 text-lg md:text-xl text-[#F5F5F5]/70 max-w-2xl mx-auto leading-relaxed">
          Worship The Fumes is streetwear for the ones who chose to stand out.
          Limited drops. Original art. No restocks. Join the cult or stay normal.
        </p>

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
