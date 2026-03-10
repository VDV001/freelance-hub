import RssParser from 'rss-parser';
import type { Article } from '@freelance-hub/shared';

const rss = new RssParser({
  timeout: 15_000,
  headers: {
    'User-Agent': 'FreelanceHub/1.0 (Habr RSS Reader)',
  },
});

export class HabrParser {
  constructor(private readonly hub: string) {}

  get feedUrl(): string {
    return `https://habr.com/ru/rss/hub/${this.hub}/all/?fl=ru`;
  }

  async parse(): Promise<Omit<Article, 'id' | 'fetchedAt'>[]> {
    try {
      const feed = await rss.parseURL(this.feedUrl);
      return feed.items.map((item) => ({
        title: (item.title ?? 'Untitled').trim(),
        description: this.truncate(item.contentSnippet ?? item.content ?? ''),
        url: item.link ?? '',
        hub: this.hub,
        author: item.creator ?? item['dc:creator'] ?? '',
        tags: (item.categories ?? []).map((c) => c.trim()).filter(Boolean),
        createdAt: item.isoDate ?? new Date().toISOString(),
      })).filter((a) => a.url.length > 0);
    } catch (err) {
      console.error(`[habr:${this.hub}] RSS parse error:`, (err as Error).message);
      return [];
    }
  }

  private truncate(text: string, max = 300): string {
    const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max).trimEnd() + '...';
  }
}
