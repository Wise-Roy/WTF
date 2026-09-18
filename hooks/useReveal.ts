"use client";

import { useEffect, useRef } from "react";

export function useReveal<T extends HTMLElement>(delay = 0) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Set initial hidden state
    el.style.opacity = "0";
    el.style.transform = "translate3d(0, 48px, 0)";
    el.style.filter = "blur(6px)";
    el.style.transition = `opacity 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, filter 700ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.style.opacity = "1";
            target.style.transform = "none";
            target.style.filter = "blur(0)";
            observer.unobserve(target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}
