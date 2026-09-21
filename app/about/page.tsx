"use client";

import Image from "next/image";
import { Lightbulb, Flame, Users } from "lucide-react";
import { SectionWrapper, SectionHeading, Tagline, Button } from "@/components/common";
import { useImageParallax } from "@/hooks";

const CREED = [
  {
    icon: Lightbulb,
    title: "Never copy",
    description:
      "Every design starts on a blank page and ends as original art. We don't do templates, we don't chase trends.",
  },
  {
    icon: Flame,
    title: "Never restock",
    description:
      "Sold out means gone. Scarcity isn't a marketing trick — it's a promise. Each drop dies when it's done.",
  },
  {
    icon: Users,
    title: "Never sell out",
    description:
      "We answer to the cult, not the algorithm. No influencer deals, no watered-down collabs. Just us and you.",
  },
];

export default function AboutPage() {
  const imgRef = useImageParallax<HTMLDivElement>(0.18);

  return (
    <>
      {/* About Header — dark, card style, centered */}
      <div className="bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-bold uppercase tracking-[0.08em] leading-[0.95]">
            Weird is a choice.
          </h1>
          <p className="mt-8 font-body text-lg md:text-xl text-[#1a1a1a]/70 leading-relaxed max-w-2xl mx-auto">
            Worship The Fumes exists for the ones who&apos;d rather be themselves
            than be liked. This is our story.
          </p>
        </div>
      </div>

      {/* Origin Story — light, horizontal split, content left / photo right */}
      <SectionWrapper scheme="light">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Tagline>Our Story</Tagline>
            <SectionHeading className="mt-6">
              Born in the back of a garage
            </SectionHeading>
            <p className="mt-6 font-body text-lg text-[#1a1a1a]/70 leading-relaxed max-w-lg">
              Worship The Fumes started in 2026 with a marker, a blank hoodie, and
              zero intention of playing it safe. No business plan, no investors —
              just a belief that streetwear had lost its edge and someone needed to
              bring the weird back. Every design since has been hand-drawn,
              limited-run, and numbered. We don&apos;t do restocks because scarcity
              is part of the art. When you wear WTF, you&apos;re not wearing a
              logo — you&apos;re wearing a statement.
            </p>
            <Button href="/shop" className="mt-8">
              Shop the collection
            </Button>
          </div>

          {/* Portrait photo — parallax frame */}
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
                alt="WTF origin"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </SectionWrapper>

      {/* What We Stand For — dark, centered, 3 icon cards */}
      <SectionWrapper scheme="dark">
        <div className="text-center">
          <Tagline>Our Creed</Tagline>
          <SectionHeading className="mt-6">What we stand for</SectionHeading>
          <p className="mt-4 font-body text-lg text-[#1a1a1a]/50">
            Three rules we never break.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {CREED.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C6FF00] mb-6">
                  <Icon size={28} strokeWidth={1.5} className="text-[#1a1a1a]" />
                </div>
                <h3 className="font-heading text-xl uppercase tracking-wider font-bold">
                  {item.title}
                </h3>
                <p className="mt-4 text-[#1a1a1a]/70 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* About CTA — acid band, centered */}
      <SectionWrapper scheme="acid" className="text-center">
        <Tagline className="bg-[#1a1a1a] text-[#C6FF00]">Join the Cult</Tagline>
        <SectionHeading className="mt-6">Be part of the story</SectionHeading>
        <p className="mt-6 font-body text-lg text-[#1a1a1a]/80 max-w-lg mx-auto">
          Every drop is a chapter. Don&apos;t just read about it — wear it.
        </p>
        <Button href="/shop" className="mt-8 bg-[#1a1a1a] text-[#C6FF00] hover:bg-[#333]">
          Shop the Drop
        </Button>
      </SectionWrapper>
    </>
  );
}
