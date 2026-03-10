"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";

const CERT_KEYS = ["claude101", "claudeCode", "claudeApi", "mcp", "aiFramework", "aiStudents", "aiEducators"] as const;

const CERTS = [
  { key: "claude101", image: "/certificates/claude-101-cert.png" },
  { key: "claudeCode", image: "/certificates/claude-code-in-action-cert.png" },
  { key: "claudeApi", image: "/certificates/building-with-the-claude-api.png" },
  { key: "mcp", image: "/certificates/introduction-to-model-context-protocol.png" },
  { key: "aiFramework", image: "/certificates/ai-fluency-framework-and-foundations.png" },
  { key: "aiStudents", image: "/certificates/ai-fluency-for-students.png" },
  { key: "aiEducators", image: "/certificates/ai-fluency-for-educators.png" },
];

const DELAY_CLASSES = ["", "reveal-delay-1", "reveal-delay-2", "reveal-delay-3", "reveal-delay-4"];

export function CertificatesSection() {
  const t = useTranslations("certificates");
  const containerRef = useReveal();
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <SectionWrapper id="certificates">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />
        <p className="reveal text-text-secondary text-center max-w-2xl mx-auto mb-8">{t("subtitle")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CERTS.map((cert, i) => (
            <div
              key={cert.key}
              className={`reveal ${DELAY_CLASSES[i % DELAY_CLASSES.length] || ""} cursor-pointer`}
              onClick={() => setLightbox(i)}
            >
            <Card>
              <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden mb-3 bg-bg-secondary">
                <Image
                  src={cert.image}
                  alt={t(`items.${cert.key}.name`)}
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h3 className="font-medium text-text-primary">{t(`items.${cert.key}.name`)}</h3>
              <p className="text-xs text-text-secondary mt-1">{t(`items.${cert.key}.desc`)}</p>
              <p className="text-xs text-text-muted mt-1">Anthropic &middot; {t(`items.${cert.key}.date`)}</p>
            </Card>
            </div>
          ))}
        </div>
      </div>

      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white text-2xl font-bold cursor-pointer"
            >
              &times;
            </button>
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={CERTS[lightbox].image}
                alt={t(`items.${CERTS[lightbox].key}.name`)}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </div>
            <p className="text-center text-white/80 mt-4 text-lg">
              {t(`items.${CERTS[lightbox].key}.name`)} &middot; Anthropic &middot; {t(`items.${CERTS[lightbox].key}.date`)}
            </p>
          </div>
        </div>
      )}
    </SectionWrapper>
  );
}
