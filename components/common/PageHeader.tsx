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
    <div className="bg-[#0A0A0A] text-[#F5F5F5] py-32 px-6 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <Tagline>{tagline}</Tagline>
        <SectionHeading className="mt-6">{heading}</SectionHeading>
        {description && (
          <p className="mt-6 max-w-2xl text-lg text-[#F5F5F5]/70">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
