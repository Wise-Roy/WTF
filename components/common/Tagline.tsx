interface TaglineProps {
  children: React.ReactNode;
  className?: string;
}

export default function Tagline({ children, className = "" }: TaglineProps) {
  return (
    <span
      className={`inline-block bg-[#C6FF00] text-[#1a1a1a] px-3 py-1 text-xs font-semibold uppercase tracking-widest ${className}`}
    >
      {children}
    </span>
  );
}
