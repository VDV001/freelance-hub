import { createHash } from 'node:crypto';
import type { Article } from '@freelance-hub/shared';
import { db } from './db.js';

export function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

const findByIdStmt = db.prepare(`
  SELECT id, title, description, url, hub, author, tags, created_at as createdAt, fetched_at as fetchedAt
  FROM articles WHERE id = ?
`);

const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO articles (id, title, description, url, hub, author, tags, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

const statsStmt = db.prepare(`
  SELECT
    hub,
    COUNT(*) as total,
    COUNT(CASE WHEN fetched_at >= datetime('now', '-1 day') THEN 1 END) as today,
    COUNT(CASE WHEN fetched_at >= datetime('now', '-7 days') THEN 1 END) as week
  FROM articles
  GROUP BY hub
`);

const cleanOldStmt = db.prepare(`
  DELETE FROM articles WHERE fetched_at < datetime('now', '-90 days')
`);

export const articlesRepo = {
  save(article: Omit<Article, 'id' | 'fetchedAt'>): boolean {
    const id = hashUrl(article.url);
    const result = insertStmt.run(
      id,
      article.title,
      article.description,
      article.url,
      article.hub,
      article.author,
      JSON.stringify(article.tags),
      article.createdAt,
    );
    return result.changes > 0;
  },

  saveMany(articles: Omit<Article, 'id' | 'fetchedAt'>[]): Omit<Article, 'id' | 'fetchedAt'>[] {
    const newArticles: Omit<Article, 'id' | 'fetchedAt'>[] = [];
    const transaction = db.transaction(() => {
      for (const article of articles) {
        if (this.save(article)) {
          newArticles.push(article);
        }
      }
    });
    transaction();
    return newArticles;
  },

  getStats(): Array<{ hub: string; total: number; today: number; week: number }> {
    return statsStmt.all() as Array<{ hub: string; total: number; today: number; week: number }>;
  },

  findById(id: string): Omit<Article, 'id' | 'fetchedAt'> | null {
    const row = findByIdStmt.get(id) as Record<string, string> | undefined;
    if (!row) return null;
    return {
      title: row.title,
      description: row.description,
      url: row.url,
      hub: row.hub,
      author: row.author,
      tags: JSON.parse(row.tags),
      createdAt: row.createdAt,
    };
  },

  cleanOld(): number {
    return cleanOldStmt.run().changes;
  },
};
