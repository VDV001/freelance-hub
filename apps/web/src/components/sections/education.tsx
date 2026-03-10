"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";

export function EducationSection() {
  const t = useTranslations("education");
  const containerRef = useReveal();

  return (
    <SectionWrapper id="education">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />
        <div className="space-y-6">
          <Card className="reveal p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xl font-bold">{t("university.name")}</h3>
                <p className="text-accent text-sm">{t("university.faculty")}</p>
              </div>
              <div className="text-sm text-text-muted shrink-0">
                <p>{t("university.period")}</p>
                <p>{t("university.location")}</p>
              </div>
            </div>
            <div className="space-y-1 text-text-secondary text-sm">
              <p>{t("university.specialization")}</p>
              <p>{t("university.projects")}</p>
              <p>{t("university.extra")}</p>
            </div>
          </Card>

          <Card className="reveal reveal-delay-1 p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xl font-bold">{t("retraining.name")}</h3>
                <p className="text-accent text-sm">{t("retraining.program")}</p>
              </div>
              <div className="text-sm text-text-muted shrink-0">
                <p>{t("retraining.period")}</p>
                <p>{t("retraining.location")}</p>
              </div>
            </div>
            <p className="text-text-secondary text-sm">{t("retraining.description")}</p>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
