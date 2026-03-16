"use client";

import { useEffect, useRef, useCallback } from "react";

export default function SpotlightWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const wrapperRef = useRef<HTMLElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = wrapperRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty("--mouse-x", `${x}px`);
    el.style.setProperty("--mouse-y", `${y}px`);

    // Update poster cards
    el.querySelectorAll<HTMLElement>(".poster-card").forEach((card) => {
      const cardRect = card.getBoundingClientRect();
      const cardX = e.clientX - cardRect.left;
      const cardY = e.clientY - cardRect.top;
      card.style.setProperty("--mouse-x", `${cardX}px`);
      card.style.setProperty("--mouse-y", `${cardY}px`);
    });
  }, []);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    el.addEventListener("mousemove", handleMouseMove);

    // Scroll reveal observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    el.querySelectorAll(".reveal-element").forEach((elem) =>
      observer.observe(elem)
    );

    return () => {
      el.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, [handleMouseMove]);

  return (
    <main
      ref={wrapperRef}
      className="flex-1 w-full max-w-[90vw] mx-auto bg-[#0a0a0a] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative z-10 flex flex-col min-h-screen spotlight-wrapper border-x border-cinema-redlight/30"
    >
      {children}
    </main>
  );
}
