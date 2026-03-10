import { createHash } from 'node:crypto';
import type { Article } from '@freelance-hub/shared';
import { db } from './db.js';

function hashUrl(url: string): string {
  return createHash('sha256').update(url).digest('hex').slice(0, 16);
}

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

  cleanOld(): number {
    return cleanOldStmt.run().changes;
  },
};
