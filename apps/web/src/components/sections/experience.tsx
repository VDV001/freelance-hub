"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const DUTY_KEYS = ["methodology", "architecture", "backend", "frontend", "ai", "devops", "testing", "integrations"] as const;

function HighlightedText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <span
            key={i}
            style={{
              color: "#34d399",
              fontWeight: 600,
              backgroundColor: "rgba(52, 211, 153, 0.12)",
              border: "1px solid rgba(52, 211, 153, 0.25)",
              padding: "2px 6px",
              borderRadius: "6px",
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const JOBS = [
  {
    key: "academic_secretary",
    techs: ["Go", "Gin", "React", "Next.js", "TypeScript", "PostgreSQL", "Redis", "DDD", "TDD", "RDD", "CQRS", "Event Sourcing", "Clean Architecture", "WebSocket", "OAuth 2.0", "JWT", "PWA", "1C ERP", "Telegram Bot", "Docker", "Prometheus", "Grafana"],
    highlightCount: 5,
  },
  {
    key: "anvirtekhno",
    techs: ["NestJS", "TypeScript", "React", "Next.js", "PostgreSQL", "PWA", "DDD", "TDD", "RDD", "OpenAPI", "LLM", "Telegram Bot", "Zustand", "SWR", "Storybook", "Docker", "MinIO", "Jest", "Playwright"],
    highlightCount: 6,
  },
];

export function ExperienceSection() {
  const t = useTranslations("experience");
  const containerRef = useReveal();
  const [expandedDuties, setExpandedDuties] = useState<Record<string, boolean>>({});

  const toggleDuties = (key: string) => {
    setExpandedDuties((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SectionWrapper id="experience">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />
        <div className="space-y-6">
          {JOBS.map((job, i) => (
            <Card key={job.key} className={`reveal ${i > 0 ? "reveal-delay-2" : ""}`}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold">{t(`${job.key}.company`)}</h3>
                  <p className="text-accent font-mono text-sm">{t(`${job.key}.role`)}</p>
                </div>
                <span className="text-text-muted text-sm whitespace-nowrap">{t(`${job.key}.period`)}</span>
              </div>

              {job.highlightCount > 0 && (
                <ul className="space-y-1.5 mb-4">
                  {Array.from({ length: job.highlightCount }, (_, hi) => (
                    <li key={hi} className="flex items-start gap-2 text-sm text-text-secondary">
                      <span className="text-accent mt-0.5 shrink-0">&#x2726;</span>
                      <span><HighlightedText text={t(`${job.key}.highlights.${hi}`)} /></span>
                    </li>
                  ))}
                </ul>
              )}

              <button
                onClick={() => toggleDuties(job.key)}
                className="text-sm text-accent hover:text-accent-hover transition-colors font-mono mb-4 cursor-pointer"
              >
                {t(`${job.key}.duties_label`)} {expandedDuties[job.key] ? "▲" : "▼"}
              </button>

              {expandedDuties[job.key] && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {DUTY_KEYS.map((dk) => (
                    <div key={dk} className="bg-bg-secondary rounded-card p-3">
                      <h4 className="text-sm font-semibold text-text-primary mb-1">
                        {t(`${job.key}.duties.${dk}.title`)}
                      </h4>
                      <p className="text-xs text-text-muted leading-relaxed">
                        {t(`${job.key}.duties.${dk}.text`)}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {job.techs.map((tech) => (
                  <Badge key={tech}>{tech}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}
