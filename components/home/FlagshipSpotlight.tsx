import { SectionWrapper, Tagline, SectionHeading, Button } from "@/components/common";

export default function FlagshipSpotlight() {
  return (
    <SectionWrapper scheme="acid">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Copy */}
        <div>
          <Tagline className="bg-[#0A0A0A] text-[#C6FF00]">Flagship Drop</Tagline>
          <SectionHeading className="mt-6">
            The &ldquo;Rat King&rdquo; hoodie
          </SectionHeading>
          <p className="mt-6 text-[#0A0A0A]/80 text-lg leading-relaxed">
            Heavyweight 400gsm cotton. Hand-numbered. Each piece from Drop 01
            carries its own identity — this is the one that started the cult.
            Limited to 200 units worldwide.
          </p>
          <Button href="/shop" className="mt-8 bg-[#0A0A0A] text-[#C6FF00] hover:bg-[#1a1a1a]">
            Get the Rat King
          </Button>
        </div>

        {/* Product image placeholder */}
        <div className="aspect-[3/4] bg-[#6F8E00] border border-black/10 flex items-center justify-center">
          <span className="font-heading text-8xl text-[#0A0A0A]/20 uppercase">#01</span>
        </div>
      </div>
    </SectionWrapper>
  );
}
