import axios from 'axios';
import { Platform, type Job } from '@freelance-hub/shared';
import { BaseParser } from './base.parser.js';

interface FHProject {
  id: number;
  name: string;
  description: string;
  budget: { amount: number; currency: string } | null;
  skills: Array<{ id: number; name: string }>;
  links: { self: { api: string }; html: { url: string } };
  published_at: string;
}

interface FHResponse {
  data: FHProject[];
}

export class FreelancehuntParser extends BaseParser {
  constructor(private token: string) {
    super(Platform.FREELANCEHUNT, 'https://api.freelancehunt.com/v2/projects');
  }

  async parse(): Promise<Omit<Job, 'id' | 'fetchedAt'>[]> {
    try {
      const { data } = await axios.get<FHResponse>(this.url, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/json',
        },
        timeout: 15_000,
        params: {
          'page[number]': 1,
        },
      });

      return data.data.map((p) => ({
        title: p.name,
        description: this.truncate(p.description),
        url: p.links.html.url,
        platform: this.platform,
        budget: p.budget
          ? `${p.budget.amount.toLocaleString()} ${p.budget.currency}`
          : undefined,
        skills: p.skills.map((s) => s.name),
        createdAt: p.published_at,
      }));
    } catch (err) {
      console.error(`[${this.platform}] API error:`, (err as Error).message);
      return [];
    }
  }
}
