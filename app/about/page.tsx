"use client";

import { useEffect, useState } from "react";
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

interface AboutSection {
  id: string;
  position: number;
  tagline: string;
  heading: string;
  body: string;
  images: string[];
}

const FALLBACK_SECTIONS: AboutSection[] = [
  {
    id: "fallback-1",
    position: 1,
    tagline: "Our Story",
    heading: "Born in the back of a garage",
    body: "Wxrship The Fumes started in 2026 with a marker, a blank hoodie, and zero intention of playing it safe. No business plan, no investors \u2014 just a belief that streetwear had lost its edge and someone needed to bring the weird back. Every design since has been hand-drawn, limited-run, and numbered. We don\u2019t do restocks because scarcity is part of the art. When you wear WTF, you\u2019re not wearing a logo \u2014 you\u2019re wearing a statement.",
    images: ["/eg.jpg"],
  },
];

const IMAGE_INTERVAL = 3500;

function LoopingImage({ images, alt }: { images: string[]; alt: string }) {
  const imgRef = useImageParallax<HTMLDivElement>(0.18);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const id = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, IMAGE_INTERVAL);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div
      data-parallax-frame
      className="aspect-[3/4] relative overflow-visible"
    >
      {/* Image container with clipped borders — no bottom-left corner */}
      <div className="absolute inset-0 overflow-hidden border border-black/10 border-b-0 border-l-0">
        <div
          ref={imgRef}
          className="absolute -inset-[12%] will-change-transform"
          style={{ transform: "translate3d(0, 0, 0)" }}
        >
          {images.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt={`${alt} ${i + 1}`}
              fill
              className={`object-cover object-center transition-opacity duration-1000 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
      </div>
      {/* Left border — stops before star */}
      <div className="absolute left-0 top-0 w-px bg-black/10" style={{ bottom: "28px" }} />
      {/* Bottom border — stops before star */}
      <div className="absolute bottom-0 right-0 h-px bg-black/10" style={{ left: "28px" }} />

      {/* WTF star — sits at bottom-left corner replacing the corner */}
      <svg
        viewBox="0 0 48 48"
        className="absolute z-10"
        style={{ bottom: "-20px", left: "-20px", width: "52px", height: "52px" }}
        fill="#1a1a1a"
      >
        <path d="M24 2 L28.9 17.6 L45.1 17.6 L31.8 27.4 L36.7 43 L24 33.2 L11.3 43 L16.2 27.4 L2.9 17.6 L19.1 17.6 Z" />
        <path d="M24 8 L27.2 18.6 L38.4 18.6 L29.2 25.4 L32.4 36 L24 29.2 L15.6 36 L18.8 25.4 L9.6 18.6 L20.8 18.6 Z" fill="none" stroke="white" strokeWidth="1" />
      </svg>
    </div>
  );
}

function AboutSectionBlock({ section }: { section: AboutSection }) {
  const imageOnLeft = section.position === 2;

  const textBlock = (
    <div>
      <Tagline>{section.tagline}</Tagline>
      <SectionHeading className="mt-6">{section.heading}</SectionHeading>
      <p className="mt-6 font-body text-lg text-[#1a1a1a]/70 leading-relaxed max-w-lg">
        {section.body}
      </p>
      <Button href="/shop" className="mt-8">
        Shop the collection
      </Button>
    </div>
  );

  const imageBlock = (
    <LoopingImage images={section.images} alt={section.heading} />
  );

  return (
    <SectionWrapper scheme="light">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {imageOnLeft ? (
          <>
            {imageBlock}
            {textBlock}
          </>
        ) : (
          <>
            {textBlock}
            {imageBlock}
          </>
        )}
      </div>
    </SectionWrapper>
  );
}

export default function AboutPage() {
  const [sections, setSections] = useState<AboutSection[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then((d) => {
        const data = d.data?.sections || [];
        setSections(data.length > 0 ? data : FALLBACK_SECTIONS);
      })
      .catch(() => setSections(FALLBACK_SECTIONS))
      .finally(() => setLoaded(true));
  }, []);

  const displaySections = loaded ? sections : FALLBACK_SECTIONS;

  return (
    <>
      {/* About Header */}
      <div className="relative bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div
          className="absolute pointer-events-none select-none opacity-[0.07]"
          style={{ top: "-55%", right: "-15%", width: "500px", height: "500px", transform: "rotate(-15deg)" }}
        >
          <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
        </div>
        <div className="mx-auto max-w-4xl text-center relative z-10">
          <h1 className="font-heading text-5xl md:text-7xl lg:text-[5.5rem] font-bold uppercase tracking-[0.08em] leading-[0.95]">
            Weird is a choice.
          </h1>
          <p className="mt-8 font-body text-lg md:text-xl text-[#1a1a1a]/70 leading-relaxed max-w-2xl mx-auto">
            Wxrship The Fumes exists for the ones who&apos;d rather be themselves
            than be liked. This is our story.
          </p>
        </div>
      </div>

      {/* Dynamic About Sections */}
      {displaySections.map((section) => (
        <AboutSectionBlock key={section.id} section={section} />
      ))}

      {/* What We Stand For */}
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

      {/* About CTA */}
      <SectionWrapper scheme="acid" className="text-center">
        <Tagline className="bg-[#1a1a1a] text-black">Join the Cult</Tagline>
        <SectionHeading className="mt-6">Be part of the story</SectionHeading>
        <p className="mt-6 font-body text-lg text-[#1a1a1a]/80 max-w-lg mx-auto">
          Every drop is a chapter. Don&apos;t just read about it — wear it.
        </p>
        <Button href="/shop" className="mt-8 bg-[#1a1a1a] text-black
         hover:bg-[#333]">
          Shop
        </Button>
      </SectionWrapper>
    </>
  );
}
