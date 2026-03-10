import axios from 'axios';
import { Platform, type Job } from '@freelance-hub/shared';
import { BaseParser } from './base.parser.js';

interface JoobleJob {
  title: string;
  location: string;
  snippet: string;
  salary: string;
  source: string;
  type: string;
  link: string;
  company: string;
  updated: string;
  id: number;
}

interface JoobleResponse {
  totalCount: number;
  jobs: JoobleJob[];
}

export class JoobleParser extends BaseParser {
  constructor(private apiKey: string) {
    super(Platform.JOOBLE, `https://jooble.org/api/${apiKey}`);
  }

  async parse(): Promise<Omit<Job, 'id' | 'fetchedAt'>[]> {
    try {
      const { data } = await axios.post<JoobleResponse>(
        this.url,
        {
          keywords: 'fullstack node.js react typescript golang',
          location: '',
          page: 1,
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15_000,
        },
      );

      return data.jobs.map((j) => ({
        title: j.company ? `${j.title} — ${j.company}` : j.title,
        description: this.truncate(j.snippet),
        url: j.link,
        platform: this.platform,
        budget: j.salary || undefined,
        skills: [],
        createdAt: j.updated ?? new Date().toISOString(),
      }));
    } catch (err) {
      console.error(`[${this.platform}] API error:`, (err as Error).message);
      return [];
    }
  }
}
