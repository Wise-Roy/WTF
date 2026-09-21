import Tagline from "./Tagline";
import SectionHeading from "./SectionHeading";

interface PageHeaderProps {
  tagline: string;
  heading: string;
  description?: string;
}

export default function PageHeader({
  tagline,
  heading,
  description,
}: PageHeaderProps) {
  return (
    <div className="bg-[#FFF9D6] text-[#1a1a1a] pt-32 pb-20 px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <Tagline>{tagline}</Tagline>
        <SectionHeading className="mt-6">{heading}</SectionHeading>
        {description && (
          <p className="mt-6 max-w-2xl text-lg text-[#1a1a1a]/70">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
