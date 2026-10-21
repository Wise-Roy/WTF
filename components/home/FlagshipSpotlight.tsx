"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { SectionWrapper, Tagline, Button } from "@/components/common";
import { useImageParallax } from "@/hooks";

interface FlagshipData {
  title: string;
  description: string;
  image: string;
  product_id: string;
  product_name: string;
}

export default function FlagshipSpotlight() {
  const imgRef = useImageParallax<HTMLDivElement>(0.18);
  const [data, setData] = useState<FlagshipData | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/flagship", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => {
        if (!ac.signal.aborted && d.data?.flagship) {
          setData(d.data.flagship);
        }
      })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const title = data?.title || 'The "Rat King" hoodie';
  const description =
    data?.description ||
    "Heavyweight 400gsm cotton. Hand-numbered. Each piece from Drop 01 carries its own identity — this is the one that started the cult. Limited to 200 units worldwide.";
  const image = data?.image || "/eg.jpg";
  const productName = data?.product_name || "the Rat King";
  const productId = data?.product_id;
  const ctaHref = productId ? `/product-story/${productId}` : "/silhouettes";

  return (
    <SectionWrapper scheme="acid" className="!bg-transparent">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Content — left, vertically centered */}
        <div>
          <Tagline className="bg-[#1a1a1a] text-black">Main Character</Tagline>
          <h2
            className="mt-6 font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-[0.08em] leading-[0.95]"
            style={{ WebkitTextStroke: "1.5px #C6FF00", color: "white" }}
          >
            {title}
          </h2>
          <p className="mt-6 font-body text-lg text-[#1a1a1a]/80 leading-relaxed max-w-lg">
            {description}
          </p>
          <Button href={ctaHref} className="mt-8 bg-[#1a1a1a] text-black hover:bg-[#333]">
            Get {productName}
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
              src={image}
              alt={title}
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
