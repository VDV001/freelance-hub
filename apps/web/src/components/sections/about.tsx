"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";

export function AboutSection() {
  const t = useTranslations("about");
  const containerRef = useReveal();

  const facts = [
    { icon: "\u{1F4CD}", text: t("facts.location") },
    { icon: "\u{1F4BC}", text: t("facts.experience") },
    { icon: "\u{1F1F7}\u{1F1FA}", text: t("facts.russian") },
    { icon: "\u{1F1EC}\u{1F1E7}", text: t("facts.english") },
    { icon: "\u{1F393}", text: t("facts.education") },
  ];

  return (
    <SectionWrapper id="about">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="reveal text-lg text-text-secondary leading-relaxed mb-8 space-y-4">
              {t("bio").split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <div className="reveal reveal-delay-1 flex flex-wrap gap-3">
              {facts.map((fact) => (
                <Badge key={fact.text} variant="default">
                  <span>{fact.icon}</span> {fact.text}
                </Badge>
              ))}
            </div>
          </div>
          <div className="reveal reveal-delay-2 flex justify-center">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-bento bg-bg-card border border-border flex items-center justify-center text-6xl">
              {"\u{1F468}\u{200D}\u{1F4BB}"}
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
