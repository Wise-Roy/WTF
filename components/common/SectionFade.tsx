interface SectionFadeProps {
  from: string;
  to: string;
  className?: string;
}

/** Gradient band that blends one section's background into the next. */
export default function SectionFade({ from, to, className = "h-32 md:h-40" }: SectionFadeProps) {
  return (
    <div
      aria-hidden="true"
      className={className}
      style={{ background: `linear-gradient(180deg, ${from} 0%, ${to} 100%)` }}
    />
  );
}
