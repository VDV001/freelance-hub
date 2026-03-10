import axios from 'axios';
import { Platform, type Job } from '@freelance-hub/shared';
import { BaseParser } from './base.parser.js';

interface RemoteOKJob {
  slug: string;
  id: string;
  epoch: number;
  date: string;
  company: string;
  position: string;
  tags: string[];
  description: string;
  url: string;
  salary_min?: number;
  salary_max?: number;
}

export class RemoteOKParser extends BaseParser {
  constructor() {
    super(Platform.REMOTE_OK, 'https://remoteok.com/api');
  }

  async parse(): Promise<Omit<Job, 'id' | 'fetchedAt'>[]> {
    try {
      const { data } = await axios.get<RemoteOKJob[]>(this.url, {
        headers: { 'User-Agent': 'FreelanceHub/1.0' },
        timeout: 15_000,
      });

      // First element is metadata, skip it
      const jobs = Array.isArray(data) ? data.slice(1) : [];

      return jobs
        .filter((j) => j.position && j.url)
        .map((j) => ({
          title: `${j.position} @ ${j.company}`,
          description: this.truncate(j.description ?? ''),
          url: j.url.startsWith('http') ? j.url : `https://remoteok.com${j.url}`,
          platform: this.platform,
          budget: this.formatSalary(j.salary_min, j.salary_max),
          skills: j.tags ?? [],
          createdAt: j.date ?? new Date(j.epoch * 1000).toISOString(),
        }));
    } catch (err) {
      console.error(`[${this.platform}] API error:`, (err as Error).message);
      return [];
    }
  }

  private formatSalary(min?: number, max?: number): string | undefined {
    if (!min && !max) return undefined;
    if (min && max) return `$${min.toLocaleString()} — $${max.toLocaleString()}`;
    if (min) return `from $${min.toLocaleString()}`;
    return `up to $${max!.toLocaleString()}`;
  }
}
