import axios from 'axios';
import { Platform, type Job } from '@freelance-hub/shared';
import { BaseParser } from './base.parser.js';

interface HHVacancy {
  id: string;
  name: string;
  alternate_url: string;
  snippet: { requirement?: string; responsibility?: string };
  salary: { from?: number; to?: number; currency: string } | null;
  key_skills: Array<{ name: string }>;
  published_at: string;
  employer: { name: string };
}

interface HHResponse {
  items: HHVacancy[];
}

export class HHParser extends BaseParser {
  constructor(private token?: string) {
    super(Platform.HH_RU, 'https://api.hh.ru/vacancies');
  }

  async parse(): Promise<Omit<Job, 'id' | 'fetchedAt'>[]> {
    try {
      const headers: Record<string, string> = {
        'User-Agent': 'FreelanceHub/1.0 (daniilvdovin4@gmail.com)',
      };
      if (this.token) headers['Authorization'] = `Bearer ${this.token}`;

      const { data } = await axios.get<HHResponse>(this.url, {
        headers,
        timeout: 15_000,
        params: {
          text: 'fullstack OR backend OR node.js OR golang OR react OR typescript',
          schedule: 'remote',
          per_page: 50,
          order_by: 'publication_time',
          period: 1, // last 24h
        },
      });

      return data.items.map((v) => ({
        title: `${v.name} — ${v.employer.name}`,
        description: this.truncate(
          [v.snippet.requirement, v.snippet.responsibility].filter(Boolean).join(' '),
        ),
        url: v.alternate_url,
        platform: this.platform,
        budget: this.formatSalary(v.salary),
        skills: v.key_skills?.map((s) => s.name) ?? [],
        createdAt: v.published_at,
      }));
    } catch (err) {
      console.error(`[${this.platform}] API error:`, (err as Error).message);
      return [];
    }
  }

  private formatSalary(salary: HHVacancy['salary']): string | undefined {
    if (!salary) return undefined;
    const { from, to, currency } = salary;
    const cur = currency === 'RUR' ? '₽' : currency;
    if (from && to) return `${from.toLocaleString()} — ${to.toLocaleString()} ${cur}`;
    if (from) return `от ${from.toLocaleString()} ${cur}`;
    if (to) return `до ${to.toLocaleString()} ${cur}`;
    return undefined;
  }
}
