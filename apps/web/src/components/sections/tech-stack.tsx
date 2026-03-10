"use client";

import { useTranslations } from "next-intl";
import { useReveal } from "@/lib/hooks/use-reveal";
import { SectionWrapper } from "@/components/layout/section-wrapper";
import { SectionHeading } from "@/components/ui/section-heading";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";

const STACK_DATA = {
  backend: {
    icon: "\u{2699}\uFE0F",
    skills: ["Go", "Node.js", "NestJS", "Gin", "PostgreSQL", "Redis", "GraphQL", "REST API", "WebSocket", "CQRS", "Event Sourcing", "DDD", "TDD", "RDD", "Clean Architecture", "JWT/OAuth2"],
    colSpan: 2 as const,
  },
  frontend: {
    icon: "\u{1F3A8}",
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Zustand", "SWR", "React Hook Form", "Zod", "PWA", "i18n", "Storybook"],
    colSpan: 1 as const,
  },
  devops: {
    icon: "\u{1F680}",
    skills: ["Docker", "Docker Swarm", "GitHub Actions", "CI/CD", "Nginx", "Caddy", "Prometheus", "Grafana", "Loki", "OpenTelemetry"],
    colSpan: 1 as const,
  },
  testing: {
    icon: "\u{1F9EA}",
    skills: ["Jest", "Playwright", "testify", "k6"],
    colSpan: 1 as const,
  },
  ai: {
    icon: "\u{1F916}",
    skills: ["Claude Code", "MCP Servers", "Prompt Engineering", "Subagent-Driven Development", "RAG", "pgvector", "LLM Integration"],
    colSpan: 2 as const,
  },
};

const DELAY_CLASSES = ["", "reveal-delay-1", "reveal-delay-2", "reveal-delay-3", "reveal-delay-3"];

export function TechStackSection() {
  const t = useTranslations("stack");
  const containerRef = useReveal();

  return (
    <SectionWrapper id="stack">
      <div ref={containerRef}>
        <SectionHeading title={t("title")} />
        <BentoGrid>
          {(Object.keys(STACK_DATA) as Array<keyof typeof STACK_DATA>).map((key, i) => {
            const data = STACK_DATA[key];
            return (
              <BentoCard key={key} colSpan={data.colSpan} className={`reveal ${DELAY_CLASSES[i] || ""}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{data.icon}</span>
                  <h3 className="text-xl font-semibold">{t(`categories.${key}`)}</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.skills.map((skill) => (
                    <Badge key={skill} variant="accent">{skill}</Badge>
                  ))}
                </div>
              </BentoCard>
            );
          })}
        </BentoGrid>
      </div>
    </SectionWrapper>
  );
}
