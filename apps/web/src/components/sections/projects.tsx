"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LangBar = { name: string; percent: number; color: string };

const PROJECTS = [
  {
    key: "floq",
    github: null,
    languages: [
      { name: "Go", percent: 58.4, color: "bg-[#00ADD8]" },
      { name: "TypeScript", percent: 40.1, color: "bg-[#3178C6]" },
      { name: "SQL", percent: 1.5, color: "bg-[#E38C00]" },
    ] as LangBar[],
    features: ["architecture", "backend", "devops", "testing"] as const,
    featureIcons: { architecture: "\u{1F3D7}\uFE0F", backend: "\u{2699}\uFE0F", devops: "\u{1F680}", testing: "\u{1F9EA}" },
    techBadges: ["Go", "Next.js 16", "TypeScript", "PostgreSQL", "Redis", "Docker", "GitHub Actions", "Tailwind CSS", "shadcn/ui", "chi", "pgx/v5", "JWT", "SMTP", "IMAP", "Telegram MTProto", "gotd/td", "Anthropic SDK", "OpenAI SDK", "Groq", "Ollama", "golang-migrate"],
    hasRedisTable: false,
    hasComparison: true,
  },
  {
    key: "academic_secretary",
    github: "https://github.com/inf-sys-secretary-methodologist/inf-sys-secretary-methodist",
    languages: [
      { name: "Go", percent: 52.7, color: "bg-[#00ADD8]" },
      { name: "TypeScript", percent: 44.2, color: "bg-[#3178C6]" },
      { name: "Other", percent: 3.1, color: "bg-text-muted" },
    ] as LangBar[],
    features: ["architecture", "backend", "devops", "testing"] as const,
    featureIcons: { architecture: "\u{1F3D7}\uFE0F", backend: "\u{2699}\uFE0F", devops: "\u{1F680}", testing: "\u{1F9EA}" },
    techBadges: ["Go", "TypeScript", "DDD", "Event Sourcing", "Redis", "WebSocket", "PostgreSQL", "Docker", "Docker Swarm"],
    hasRedisTable: true,
    hasComparison: false,
  },
  {
    key: "estimate_pro",
    github: "https://github.com/VDV001/estimate-pro",
    languages: [
      { name: "Go", percent: 56.5, color: "bg-[#00ADD8]" },
      { name: "TypeScript", percent: 33.4, color: "bg-[#3178C6]" },
      { name: "JSON", percent: 9.1, color: "bg-[#A8B9CC]" },
      { name: "SQL", percent: 1.0, color: "bg-[#E38C00]" },
    ] as LangBar[],
    features: ["architecture", "backend", "devops", "testing"] as const,
    featureIcons: { architecture: "\u{1F3D7}\uFE0F", backend: "\u{2699}\uFE0F", devops: "\u{1F680}", testing: "\u{1F9EA}" },
    techBadges: ["Go 1.26", "Next.js 16", "TypeScript", "PostgreSQL 18", "Redis 8", "MinIO", "Chi", "pgx", "TanStack Query", "Zustand", "Tailwind CSS v4", "shadcn/ui", "Three.js", "WebSocket", "JWT", "OAuth2", "Docker", "GitHub Actions", "Claude API", "OpenAI API", "Ollama", "Telegram Bot API"],
    hasRedisTable: false,
    hasComparison: true,
  },
  {
    key: "lexis",
    github: "https://github.com/VDV001/lexis",
    languages: [
      { name: "Go", percent: 60.5, color: "bg-[#00ADD8]" },
      { name: "TypeScript", percent: 34.2, color: "bg-[#3178C6]" },
      { name: "YAML", percent: 3.3, color: "bg-[#CB171E]" },
      { name: "SQL", percent: 1.1, color: "bg-[#E38C00]" },
      { name: "CSS", percent: 0.9, color: "bg-[#563D7C]" },
    ] as LangBar[],
    features: ["architecture", "backend", "devops", "testing"] as const,
    featureIcons: { architecture: "\u{1F3D7}\uFE0F", backend: "\u{2699}\uFE0F", devops: "\u{1F680}", testing: "\u{1F9EA}" },
    techBadges: ["Go", "Chi", "PostgreSQL", "Redis", "JWT", "Next.js 16", "React 19", "TypeScript", "Zustand", "Docker", "GitHub Actions", "Playwright", "golang-migrate", "pgx", "bcrypt"],
    hasRedisTable: false,
    hasComparison: true,
  },
] as const;

export function ProjectsSection() {
  const t = useTranslations("projects");
  const containerRef = useReveal();

  return (
    <SectionWrapper id="projects">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />

        <div className="reveal mb-6 flex items-start gap-3 rounded-card border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-text-secondary">
          <span className="shrink-0 text-accent">&#9432;</span>
          <span>{t("freshness_notice")}</span>
        </div>

        <div className="flex flex-col gap-8">
          {PROJECTS.map((project) => (
            <ProjectCard key={project.key} project={project} t={t} />
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

function ProjectCard({ project, t }: { project: (typeof PROJECTS)[number]; t: ReturnType<typeof useTranslations<"projects">> }) {
  const { key, languages, features, featureIcons, techBadges, hasRedisTable, hasComparison } = project;
  const github = project.github as string | null;

  return (
    <Card className="reveal p-8">
      <div className="flex flex-col gap-8">
        <div>
          <h3 className="text-2xl font-bold mb-2">{t(`${key}.name`)}</h3>
          <p className="text-text-secondary mb-6">{t(`${key}.description`)}</p>

          <div className="flex gap-4 mb-6">
            <div className="text-center px-4 py-2 bg-bg-secondary rounded-card">
              <p className="text-xl font-bold text-accent">{t(`${key}.commits`)}</p>
            </div>
            <div className="text-center px-4 py-2 bg-bg-secondary rounded-card">
              <p className="text-xl font-bold text-accent">{t(`${key}.performance`)}</p>
            </div>
          </div>

          <div className="reveal reveal-delay-1 grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            {features.map((feat) => (
              <div key={feat} className="flex items-start gap-2 text-sm text-text-secondary bg-bg-secondary rounded-card p-3">
                <span className="shrink-0">{featureIcons[feat]}</span>
                <span>{t(`${key}.features.${feat}`)}</span>
              </div>
            ))}
          </div>

          {hasRedisTable && (
            <div className="reveal reveal-delay-1 mb-6">
              <h4 className="text-lg font-semibold text-accent mb-3">{t(`${key}.redis.title`)}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      {(t.raw(`${key}.redis.headers`) as string[]).map((h) => (
                        <th key={h} className="text-left px-3 py-2 bg-bg-secondary text-text-muted font-medium border-b border-border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(t.raw(`${key}.redis.rows`) as string[][]).map((row, i) => (
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
              <p className="text-xs text-text-muted mt-3">{t(`${key}.redis.decorator`)}</p>
            </div>
          )}

          {hasComparison && (
            <div className="reveal reveal-delay-1 mb-6">
              <h4 className="text-lg font-semibold text-accent mb-3">{t(`${key}.comparison.title`)}</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr>
                      {(t.raw(`${key}.comparison.headers`) as string[]).map((h) => (
                        <th key={h} className="text-left px-3 py-2 bg-bg-secondary text-text-muted font-medium border-b border-border">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(t.raw(`${key}.comparison.rows`) as string[][]).map((row, i) => (
                      <tr key={i} className="border-b border-border/50">
                        <td className="px-3 py-2 font-medium">{row[0]}</td>
                        <td className="px-3 py-2 text-text-muted">{row[1]}</td>
                        <td className="px-3 py-2 text-green-400 font-semibold">{row[2]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="reveal reveal-delay-1 mb-6">
            <p className="text-sm text-text-muted mb-2">Languages</p>
            <div className="flex h-3 rounded-full overflow-hidden">
              {languages.map((lang) => (
                <div
                  key={lang.name}
                  className={`lang-bar-animate ${lang.color}`}
                  style={{ width: `${lang.percent}%` }}
                />
              ))}
            </div>
            <div className="flex gap-4 mt-2 flex-wrap">
              {languages.map((lang) => (
                <div key={lang.name} className="flex items-center gap-1.5 text-xs text-text-muted">
                  <span className={`w-2 h-2 rounded-full ${lang.color}`} />
                  {lang.name} {lang.percent}%
                </div>
              ))}
            </div>
          </div>

          <div className="reveal reveal-delay-2 flex flex-wrap gap-2 mb-6">
            {techBadges.map((tech) => (
              <Badge key={tech} variant="accent">{tech}</Badge>
            ))}
          </div>

          {github ? (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="reveal reveal-delay-3 inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors font-mono text-sm"
            >
              View on GitHub &rarr;
            </a>
          ) : (
            <span className="reveal reveal-delay-3 inline-flex items-center gap-2 text-text-muted font-mono text-sm">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              Private repository
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
