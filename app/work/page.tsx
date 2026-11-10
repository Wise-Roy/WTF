"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Tagline, SectionHeading } from "@/components/common";

type WorkPdf = { title: string; url: string };

export default function WorkPage() {
  const [docs, setDocs] = useState<WorkPdf[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    fetch("/api/footer", { signal: ac.signal })
      .then((r) => r.json())
      .then((d) => {
        setDocs((d.data?.footer?.work_pdfs || []).filter((w: WorkPdf) => w?.url));
        setLoading(false);
      })
      .catch(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

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
          <Tagline>Work</Tagline>
          <SectionHeading className="mt-6">Our Work</SectionHeading>
        </div>
      </div>

      <section className="bg-[#FFF9D6] px-6 md:px-12 lg:px-20 pb-24">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <div className="space-y-10">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i}>
                  <div className="h-5 w-48 bg-black/5 rounded animate-pulse" />
                  <div className="mt-4 h-[80vh] bg-white/50 rounded-xl animate-pulse" />
                </div>
              ))}
            </div>
          ) : docs.length ? (
            <div className="space-y-14">
              {docs.map((doc, i) => (
                <div key={i}>
                  <h4 className="text-sm font-bold uppercase tracking-wider text-[#1a1a1a]">
                    {doc.title || `Document ${i + 1}`}
                  </h4>
                  <iframe
                    src={doc.url}
                    title={doc.title || `Document ${i + 1}`}
                    className="mt-4 w-full h-[80vh] rounded-xl border border-black/10"
                  />
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-sm text-[#1a1a1a]/50 hover:text-[#DF2877] transition-colors"
                  >
                    Open PDF
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#1a1a1a]/50">No documents available yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
