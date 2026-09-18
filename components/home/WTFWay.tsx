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
    <SectionWrapper scheme="light">
      <div className="text-center">
        <Tagline>The WTF Way</Tagline>
        <SectionHeading className="mt-6">
          Why we&apos;re weird on purpose
        </SectionHeading>
      </div>

      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {VALUE_PROPS.map((prop) => {
          const Icon = ICON_MAP[prop.icon];
          return (
            <div key={prop.title} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-[#C6FF00] mb-6">
                <Icon size={28} strokeWidth={1.5} className="text-[#0A0A0A]" />
              </div>
              <h3 className="font-heading text-xl uppercase tracking-wider font-bold">
                {prop.title}
              </h3>
              <p className="mt-4 text-[#0A0A0A]/70 leading-relaxed">
                {prop.description}
              </p>
            </div>
          );
        })}
      </div>
    </SectionWrapper>
  );
}
