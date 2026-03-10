import type { Job, Platform } from '@freelance-hub/shared';

export abstract class BaseParser {
  constructor(
    public readonly platform: Platform,
    protected readonly url: string,
  ) {}

  /** Fetch and parse jobs from the platform. */
  abstract parse(): Promise<Omit<Job, 'id' | 'fetchedAt'>[]>;

  /** Truncate description to a max length for display. */
  protected truncate(text: string, max = 500): string {
    const clean = text.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (clean.length <= max) return clean;
    return clean.slice(0, max).trimEnd() + '...';
  }
}
