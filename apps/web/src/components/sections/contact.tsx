"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { SITE_CONFIG } from "@/lib/constants";

const CONTACTS = [
  { key: "email", icon: "\u{2709}\uFE0F", href: `mailto:${SITE_CONFIG.email}`, value: SITE_CONFIG.email },
  { key: "telegram", icon: "\u{1F4AC}", href: SITE_CONFIG.telegram, value: "@v_d_v_7" },
  { key: "github", icon: "\u{1F419}", href: SITE_CONFIG.github, value: "VDV001" },
  { key: "habr", icon: "\u{1F4CB}", href: SITE_CONFIG.habr, value: "career.habr.com/vdv007" },
];

const DELAY_CLASSES = ["", "reveal-delay-1", "reveal-delay-2", "reveal-delay-3"];

export function ContactSection() {
  const t = useTranslations("contact");
  const containerRef = useReveal();

  return (
    <SectionWrapper id="contact">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACTS.map((c, i) => (
            <a key={c.key} href={c.href} target="_blank" rel="noopener noreferrer">
              <Card className={`reveal ${DELAY_CLASSES[i] || ""} text-center py-8`}>
                <span className="text-4xl mb-4 block">{c.icon}</span>
                <h3 className="font-semibold text-text-primary mb-1">{t(c.key)}</h3>
                <p className="text-sm text-text-muted">{c.value}</p>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
