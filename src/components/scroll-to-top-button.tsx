"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

const scrollThreshold = 96;

export function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY > scrollThreshold);

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function scrollToTop() {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <button
      className={isVisible ? "scroll-top-button visible" : "scroll-top-button"}
      type="button"
      onClick={scrollToTop}
      aria-hidden={!isVisible}
      aria-label="Kembali ke atas"
      tabIndex={isVisible ? 0 : -1}
      title="Kembali ke atas"
    >
      <ArrowUp size={14} strokeWidth={2} aria-hidden="true" />
    </button>
  );
}
