"use client";

import { useRef, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useGSAP, gsap, SplitText } from "@/lib/gsap/plugins";
import { Button } from "@/components/ui/button";
import { GradientBlob } from "@/components/ui/gradient-blob";
import { NoiseOverlay } from "@/components/ui/noise-overlay";

export function HeroSection() {
  const t = useTranslations("hero");
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [revealed, setRevealed] = useState(false);

  useGSAP(() => {
    if (!nameRef.current || !containerRef.current) return;

    const tl = gsap.timeline({ delay: 0.3 });

    const split = SplitText.create(nameRef.current, { type: "chars,words" });
    tl.from(split.chars, {
      y: 100,
      opacity: 0,
      rotateX: -90,
      duration: 0.8,
      ease: "power4.out",
      stagger: 0.03,
    });
  }, { scope: containerRef });

  useEffect(() => {
    const timer = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section id="hero" className="relative min-h-dvh flex items-center justify-center overflow-hidden">
      <GradientBlob className="-top-40 -left-40" />
      <GradientBlob className="-bottom-40 -right-40 from-accent-secondary to-accent" />
      <NoiseOverlay />

      <div ref={containerRef} className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <p className={`text-lg md:text-xl text-accent mb-4 font-mono transition-all duration-700 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>{t("greeting")}</p>
        <h1 ref={nameRef} className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          {t("name")}
        </h1>
        <p className={`text-2xl md:text-3xl text-text-secondary mb-6 transition-all duration-700 delay-200 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>{t("role")}</p>
        <p className={`text-lg text-text-muted max-w-2xl mx-auto mb-10 transition-all duration-700 delay-300 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>{t("tagline")}</p>
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-600 delay-500 ${revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
          <Button variant="primary" size="lg" href="#contact">{t("cta_contact")}</Button>
          <Button variant="outline" size="lg" href="/cv.pdf">{t("cta_resume")}</Button>
        </div>
      </div>
    </section>
  );
}
