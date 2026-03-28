import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Article } from '@freelance-hub/shared';

type InboxArticle = Omit<Article, 'id' | 'fetchedAt'>;

const __dirname = dirname(fileURLToPath(import.meta.url));
// In container: __dirname = /app/apps/bot/dist/export → ../../data/kb-inbox = /app/apps/bot/data/kb-inbox
const DATA_DIR = join(__dirname, '..', '..', 'data', 'kb-inbox');
const INBOX_FILE = join(DATA_DIR, 'inbox.json');

/**
 * Exports new articles to a JSON inbox file for the knowledge base.
 * The file is picked up by git sync → local process_inbox.py script.
 */
export function exportToInbox(articles: InboxArticle[]): boolean {
  if (articles.length === 0) return false;

  try {
    mkdirSync(DATA_DIR, { recursive: true });

    // Load existing inbox
    let existing: InboxArticle[] = [];
    if (existsSync(INBOX_FILE)) {
      const raw = readFileSync(INBOX_FILE, 'utf-8');
      existing = JSON.parse(raw);
    }

    // Deduplicate by URL
    const existingUrls = new Set(existing.map((a) => a.url));
    const toAdd = articles.filter((a) => !existingUrls.has(a.url));

    if (toAdd.length === 0) return false;

    const updated = [...existing, ...toAdd];
    writeFileSync(INBOX_FILE, JSON.stringify(updated, null, 2), 'utf-8');
    console.log(`[kb-inbox] Exported ${toAdd.length} article(s) to inbox`);
    return true;
  } catch (err) {
    console.error('[kb-inbox] Failed to export:', (err as Error).message);
    return false;
  }
}
