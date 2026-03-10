import type { Platform } from './platform.js';

export interface Job {
  /** SHA-256 hash of the URL — used for deduplication */
  id: string;
  title: string;
  description: string;
  url: string;
  platform: Platform;
  /** Budget as text (platforms format it differently) */
  budget?: string;
  /** Parsed tags/skills from the listing */
  skills: string[];
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp when we first saw this job */
  fetchedAt: string;
}
