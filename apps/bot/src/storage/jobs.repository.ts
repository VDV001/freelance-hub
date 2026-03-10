import { createHash } from 'node:crypto';
import type { Job } from '@freelance-hub/shared';
import { db } from './db.js';

function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO jobs (id, title, description, url, platform, budget, skills, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const getUnnotifiedStmt = db.prepare(`
  SELECT * FROM jobs WHERE notified = 0 ORDER BY fetched_at DESC
`);

const markNotifiedStmt = db.prepare(`
  UPDATE jobs SET notified = 1 WHERE id = ?
`);

const statsStmt = db.prepare(`
  SELECT
    platform,
    COUNT(*) as total,
    COUNT(CASE WHEN fetched_at >= datetime('now', '-1 day') THEN 1 END) as today,
    COUNT(CASE WHEN fetched_at >= datetime('now', '-7 days') THEN 1 END) as week
  FROM jobs
  GROUP BY platform
`);

const cleanOldStmt = db.prepare(`
  DELETE FROM jobs WHERE fetched_at < datetime('now', '-30 days')
`);

export const jobsRepo = {
  /** Save a job. Returns true if it was new (not a duplicate). */
  save(job: Omit<Job, 'id' | 'fetchedAt'>): boolean {
    const id = hashUrl(job.url);
    const result = insertStmt.run(
      id,
      job.title,
      job.description,
      job.url,
      job.platform,
      job.budget ?? null,
      JSON.stringify(job.skills),
      job.createdAt,
    );
    return result.changes > 0;
  },

  /** Save many jobs. Returns only the new (non-duplicate) ones. */
  saveMany(jobs: Omit<Job, 'id' | 'fetchedAt'>[]): Omit<Job, 'id' | 'fetchedAt'>[] {
    const newJobs: Omit<Job, 'id' | 'fetchedAt'>[] = [];
    const transaction = db.transaction(() => {
      for (const job of jobs) {
        if (this.save(job)) {
          newJobs.push(job);
        }
      }
    });
    transaction();
    return newJobs;
  },

  getUnnotified(): Job[] {
    const rows = getUnnotifiedStmt.all() as Array<{
      id: string;
      title: string;
      description: string;
      url: string;
      platform: string;
      budget: string | null;
      skills: string;
      created_at: string;
      fetched_at: string;
    }>;
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.url,
      platform: r.platform as Job['platform'],
      budget: r.budget ?? undefined,
      skills: JSON.parse(r.skills) as string[],
      createdAt: r.created_at,
      fetchedAt: r.fetched_at,
    }));
  },

  markNotified(id: string): void {
    markNotifiedStmt.run(id);
  },

  getStats(): Array<{ platform: string; total: number; today: number; week: number }> {
    return statsStmt.all() as Array<{ platform: string; total: number; today: number; week: number }>;
  },

  cleanOld(): number {
    return cleanOldStmt.run().changes;
  },
};
