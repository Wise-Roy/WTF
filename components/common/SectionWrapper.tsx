import { ColorScheme, SchemeConfig } from "@/types";
import { SCHEMES } from "@/lib/constants";

interface SectionWrapperProps {
  children: React.ReactNode;
  scheme: ColorScheme;
  id?: string;
  className?: string;
}

export default function SectionWrapper({
  children,
  scheme,
  id,
  className = "",
}: SectionWrapperProps) {
  const config: SchemeConfig = SCHEMES[scheme];

  return (
    <section
      id={id}
      className={`${config.bg} ${config.text} py-24 px-6 md:px-12 lg:px-20 ${className}`}
    >
      <div className="mx-auto max-w-7xl">{children}</div>
    </section>
  );
}
