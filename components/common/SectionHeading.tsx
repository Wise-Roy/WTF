interface SectionHeadingProps {
  children: React.ReactNode;
  className?: string;
}

export default function SectionHeading({
  children,
  className = "",
}: SectionHeadingProps) {
  return (
    <h2
      className={`font-heading text-4xl md:text-5xl lg:text-6xl font-bold uppercase tracking-wider leading-tight ${className}`}
    >
      {children}
    </h2>
  );
}
