"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Tagline, SectionHeading } from "@/components/common";

/** Renders a policy PDF stored on footer_settings (admin Footer tab) */
export default function PolicyPdfPage({ title, field }: { title: string; field: string }) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/footer")
      .then((r) => r.json())
      .then((d) => {
        setPdfUrl(d.data?.footer?.[field] || null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [field]);

  return (
    <>
      <div className="relative bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20 overflow-hidden">
        <div
          className="absolute pointer-events-none select-none opacity-[0.07]"
          style={{ top: "-55%", right: "-15%", width: "500px", height: "500px", transform: "rotate(-15deg)" }}
        >
          <Image src="/clean_logo.png" alt="" fill className="object-contain" aria-hidden="true" />
        </div>
        <div className="mx-auto max-w-7xl relative z-10">
          <Tagline>Legal</Tagline>
          <SectionHeading className="mt-6">{title}</SectionHeading>
        </div>
      </div>

      <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="h-[80vh] bg-white/50 rounded-xl animate-pulse" />
          ) : pdfUrl ? (
            <iframe
              src={pdfUrl}
              title={title}
              className="w-full h-[80vh] rounded-xl border border-black/10"
            />
          ) : (
            <p className="text-center text-[#1a1a1a]/50 py-20 text-lg">
              {title} not available yet.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
