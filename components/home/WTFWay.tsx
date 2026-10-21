import { Flame, Brush, Users } from "lucide-react";
import { VALUE_PROPS } from "@/lib/constants";
import { SectionWrapper, Tagline, SectionHeading } from "@/components/common";

const ICON_MAP: Record<string, React.ElementType> = {
  Flame,
  Brush,
  Users,
};

export default function WTFWay() {
  return (
    <SectionWrapper scheme="grey" className="!bg-transparent !text-white">
      <div className="text-center">
        <Tagline>WTF Codes</Tagline>
        <SectionHeading className="mt-6" style={{ WebkitTextStroke: "1.5px #C6FF00", color: "white" }}>
          Why we&apos;re weird on purpose
        </SectionHeading>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {VALUE_PROPS.map((prop) => {
          const Icon = ICON_MAP[prop.icon];
          return (
            <div key={prop.title} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C6FF00] mb-6">
                <Icon size={28} strokeWidth={1.5} className="text-[#1a1a1a]" />
              </div>
              <h3 className="font-heading text-xl uppercase tracking-wider font-bold text-white">
                {prop.title}
              </h3>
              <p className="mt-4 text-white/70 leading-relaxed">
                {prop.description}
              </p>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
