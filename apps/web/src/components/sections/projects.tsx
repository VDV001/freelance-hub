"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const PROJECT_GITHUB = "https://github.com/inf-sys-secretary-methodologist/inf-sys-secretary-methodist";

const LANGUAGES = [
  { name: "Go", percent: 52.7, color: "bg-[#00ADD8]" },
  { name: "TypeScript", percent: 44.2, color: "bg-[#3178C6]" },
  { name: "Other", percent: 3.1, color: "bg-text-muted" },
];

const FEATURE_KEYS = ["architecture", "backend", "devops", "testing"] as const;
const FEATURE_ICONS = { architecture: "\u{1F3D7}\uFE0F", backend: "\u{2699}\uFE0F", devops: "\u{1F680}", testing: "\u{1F9EA}" };

export function ProjectsSection() {
  const t = useTranslations("projects");
  const containerRef = useReveal();

  const redisHeaders = t.raw("academic_secretary.redis.headers") as string[];
  const redisRows = t.raw("academic_secretary.redis.rows") as string[][];

  return (
    <SectionWrapper id="projects">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />
        <Card className="reveal p-8">
          <div className="flex flex-col gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">{t("academic_secretary.name")}</h3>
              <p className="text-text-secondary mb-6">{t("academic_secretary.description")}</p>

              <div className="flex gap-4 mb-6">
                <div className="text-center px-4 py-2 bg-bg-secondary rounded-card">
                  <p className="text-xl font-bold text-accent">{t("academic_secretary.commits")}</p>
                </div>
                <div className="text-center px-4 py-2 bg-bg-secondary rounded-card">
                  <p className="text-xl font-bold text-accent">{t("academic_secretary.performance")}</p>
                </div>
              </div>

              <div className="reveal reveal-delay-1 grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {FEATURE_KEYS.map((key) => (
                  <div key={key} className="flex items-start gap-2 text-sm text-text-secondary bg-bg-secondary rounded-card p-3">
                    <span className="shrink-0">{FEATURE_ICONS[key]}</span>
                    <span>{t(`academic_secretary.features.${key}`)}</span>
                  </div>
                ))}
              </div>

              {/* Redis performance table */}
              <div className="reveal reveal-delay-1 mb-6">
                <h4 className="text-lg font-semibold text-accent mb-3">{t("academic_secretary.redis.title")}</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        {redisHeaders.map((h) => (
                          <th key={h} className="text-left px-3 py-2 bg-bg-secondary text-text-muted font-medium border-b border-border">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {redisRows.map((row, i) => (
                        <tr key={i} className="border-b border-border/50">
                          <td className="px-3 py-2 font-medium">{row[0]}</td>
                          <td className="px-3 py-2 text-text-muted">{row[1]}</td>
                          <td className="px-3 py-2 text-text-muted">{row[2]}</td>
                          <td className="px-3 py-2 text-green-400 font-semibold">{row[3]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-text-muted mt-3">{t("academic_secretary.redis.decorator")}</p>
              </div>

              <div className="reveal reveal-delay-1 mb-6">
                <p className="text-sm text-text-muted mb-2">Languages</p>
                <div className="flex h-3 rounded-full overflow-hidden">
                  {LANGUAGES.map((lang) => (
                    <div
                      key={lang.name}
                      className={`lang-bar-animate ${lang.color}`}
                      style={{ width: `${lang.percent}%` }}
                    />
                  ))}
                </div>
                <div className="flex gap-4 mt-2">
                  {LANGUAGES.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                      <span className={`w-2 h-2 rounded-full ${lang.color}`} />
                      {lang.name} {lang.percent}%
                    </div>
                  ))}
                </div>
              </div>

              <div className="reveal reveal-delay-2 flex flex-wrap gap-2 mb-6">
                {["Go", "TypeScript", "DDD", "Event Sourcing", "Redis", "WebSocket", "PostgreSQL", "Docker", "Docker Swarm"].map((tech) => (
                  <Badge key={tech} variant="accent">{tech}</Badge>
                ))}
              </div>

              <a
                href={PROJECT_GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="reveal reveal-delay-3 inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors font-mono text-sm"
              >
                View on GitHub &rarr;
              </a>
            </div>
          </div>
        </Card>
      </div>
    </SectionWrapper>
  );
}
