"use client";

import { SIZE_LABELS } from "@/lib/sizes";

interface SizeSelectorProps {
  /** Sizes to show. Defaults to the full chart (XS .. 4XL). */
  options?: string[];
  selected: string[];
  onToggle: (size: string) => void;
  className?: string;
}

/** Size picker shared by the admin form (multi-select) and the product page (single select). */
export default function SizeSelector({
  options = SIZE_LABELS,
  selected,
  onToggle,
  className = "",
}: SizeSelectorProps) {
  if (options.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`} role="group" aria-label="Size">
      {options.map((size) => {
        const active = selected.includes(size);
        return (
          <button
            key={size}
            type="button"
            onClick={() => onToggle(size)}
            aria-pressed={active}
            className={`min-w-11 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] border-2 rounded-sm transition-colors ${
              active
                ? "bg-[#C6FF00] text-[#1a1a1a] border-[#C6FF00]"
                : "border-current opacity-60 hover:opacity-100 hover:border-[#DF2877]"
            }`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
