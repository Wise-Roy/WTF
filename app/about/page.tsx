import { Flame, Eye, Skull } from "lucide-react";
import { PageHeader, SectionWrapper, SectionHeading, Tagline, Button } from "@/components/common";

const VALUES = [
  {
    icon: Flame,
    title: "Anti-mainstream",
    description:
      "We don't follow trends. We set fires. Every design is born from the weird, the raw, and the unapologetically different.",
  },
  {
    icon: Eye,
    title: "Radical transparency",
    description:
      "No hidden markups, no celebrity endorsements, no mass production. Just honest work sold direct to the cult.",
  },
  {
    icon: Skull,
    title: "Scarcity by design",
    description:
      "Each drop is limited and numbered. We'd rather leave demand unmet than dilute what we stand for.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHeader
        tagline="About WTF"
        heading="The origin story"
        description="Born out of boredom with the same recycled streetwear. WTF exists because weird needs a uniform."
      />

      {/* Origin story */}
      <SectionWrapper scheme="dark">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-lg text-[#F5F5F5]/70 leading-relaxed">
            Worship The Fumes started in 2026 with a simple idea: what if
            streetwear actually had something to say? Not another brand chasing
            the latest collab or copying the same oversized silhouette. WTF is
            for the ones who chose weird over safe, cult over crowd, fumes over
            fresh air.
          </p>
          <p className="mt-8 text-lg text-[#F5F5F5]/70 leading-relaxed">
            Every drop is hand-drawn, limited-run, and numbered. We don&apos;t
            do restocks because scarcity is part of the art. When you wear WTF,
            you&apos;re not wearing a logo — you&apos;re wearing a statement.
          </p>
        </div>
      </SectionWrapper>

      {/* Values */}
      <SectionWrapper scheme="light">
        <div className="text-center">
          <Tagline>Our Values</Tagline>
          <SectionHeading className="mt-6">What we stand for</SectionHeading>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
          {VALUES.map((val) => {
            const Icon = val.icon;
            return (
              <div key={val.title} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C6FF00] mb-6">
                  <Icon size={28} strokeWidth={1.5} className="text-[#0A0A0A]" />
                </div>
                <h3 className="font-heading text-xl uppercase tracking-wider font-bold">
                  {val.title}
                </h3>
                <p className="mt-4 text-[#0A0A0A]/70 leading-relaxed">
                  {val.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* CTA */}
      <SectionWrapper scheme="acid" className="text-center">
        <SectionHeading>Ready to join the cult?</SectionHeading>
        <p className="mt-6 text-[#0A0A0A]/80 text-lg max-w-lg mx-auto">
          Check out Drop 01 before it&apos;s gone forever.
        </p>
        <Button href="/shop" className="mt-8 bg-[#0A0A0A] text-[#C6FF00] hover:bg-[#1a1a1a]">
          Shop the Drop
        </Button>
      </SectionWrapper>
    </>
  );
}
