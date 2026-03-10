import type { Job, FilterConfig } from '@freelance-hub/shared';

export function matchesFilter(job: Omit<Job, 'id' | 'fetchedAt'>, filter: FilterConfig): boolean {
  const text = `${job.title} ${job.description} ${job.skills.join(' ')}`.toLowerCase();

  // Check exclude keywords first (faster rejection)
  for (const keyword of filter.excludeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      return false;
    }
  }

  // Check if any include keyword matches
  for (const keyword of filter.includeKeywords) {
    if (text.includes(keyword.toLowerCase())) {
      return true;
    }
  }

  return false;
}
