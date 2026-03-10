import RssParser from 'rss-parser';
import type { Job, Platform } from '@freelance-hub/shared';
import { BaseParser } from './base.parser.js';

const rss = new RssParser({
  timeout: 15_000,
  headers: {
    'User-Agent': 'FreelanceHub/1.0 (RSS Reader)',
  },
});

/**
 * Universal RSS parser.
 * Works for: Habr Freelance, FL.ru, Weblancer, WWR, Guru.
 */
export class RssJobParser extends BaseParser {
  constructor(platform: Platform, url: string) {
    super(platform, url);
  }

  async parse(): Promise<Omit<Job, 'id' | 'fetchedAt'>[]> {
    try {
      const feed = await rss.parseURL(this.url);
      return feed.items.map((item) => ({
        title: (item.title ?? 'Untitled').trim(),
        description: this.truncate(item.contentSnippet ?? item.content ?? ''),
        url: item.link ?? '',
        platform: this.platform,
        budget: this.extractBudget(item.title ?? '', item.contentSnippet ?? ''),
        skills: this.extractSkills(item.categories ?? []),
        createdAt: item.isoDate ?? new Date().toISOString(),
      })).filter((j) => j.url.length > 0);
    } catch (err) {
      console.error(`[${this.platform}] RSS parse error:`, (err as Error).message);
      return [];
    }
  }

  private extractBudget(title: string, description: string): string | undefined {
    const text = `${title} ${description}`;
    // Match patterns like "50000 руб", "$500", "от 100 000 руб", "50 000 — 80 000"
    const match = text.match(
      /(?:от\s+)?[\d\s]+(?:\s*[-—–]\s*[\d\s]+)?\s*(?:руб|₽|\$|USD|EUR|usd|eur)/i,
    );
    return match?.[0]?.trim();
  }

  private extractSkills(categories: string[]): string[] {
    return categories.map((c) => c.trim()).filter(Boolean);
  }
}
