# Habr Articles Aggregation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add Habr RSS article aggregation to the existing Telegram bot, sending articles to a separate Telegram channel with independent keyword filtering.

**Architecture:** Reuse existing patterns (BaseParser, repository, cron scheduler, Composer commands). Articles stored in a separate `articles` table. Habr hubs configured via `/habr` command. Articles sent to a dedicated Telegram channel (`TELEGRAM_HABR_CHANNEL_ID`), not to the personal chat.

**Tech Stack:** grammY, rss-parser (already in deps), better-sqlite3, node-cron, zod

---

### Task 1: Add Article type to shared package

**Files:**
- Create: `packages/shared/src/types/article.ts`
- Modify: `packages/shared/src/index.ts`

**Step 1: Create Article type**

```typescript
// packages/shared/src/types/article.ts
export interface Article {
  /** SHA-256 hash of the URL — used for deduplication */
  id: string;
  title: string;
  description: string;
  url: string;
  /** Habr hub name (e.g. "golang", "typescript") */
  hub: string;
  /** Author username */
  author: string;
  /** Parsed tags/categories from RSS */
  tags: string[];
  /** ISO timestamp */
  createdAt: string;
  /** ISO timestamp when we first saw this article */
  fetchedAt: string;
}
```

**Step 2: Export from shared index**

Add to `packages/shared/src/index.ts`:
```typescript
export type { Article } from './types/article.js';
```

**Step 3: Commit**

```bash
git add packages/shared/src/types/article.ts packages/shared/src/index.ts
git commit -m "feat(shared): add Article type"
```

---

### Task 2: Add articles table to SQLite schema

**Files:**
- Modify: `apps/bot/src/storage/db.ts`

**Step 1: Add articles table and indexes**

Append to the `db.exec()` call in `db.ts`, after the `user_settings` table:

```sql
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  url TEXT NOT NULL UNIQUE,
  hub TEXT NOT NULL,
  author TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  fetched_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_articles_hub ON articles(hub);
CREATE INDEX IF NOT EXISTS idx_articles_fetched_at ON articles(fetched_at);
```

**Step 2: Commit**

```bash
git add apps/bot/src/storage/db.ts
git commit -m "feat(bot): add articles table to SQLite schema"
```

---

### Task 3: Create articles repository

**Files:**
- Create: `apps/bot/src/storage/articles.repository.ts`

**Step 1: Implement repository**

Follow the exact pattern from `jobs.repository.ts` — prepared statements, hashUrl, saveMany with transaction, cleanOld, getStats.

```typescript
// apps/bot/src/storage/articles.repository.ts
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
```

**Step 2: Commit**

```bash
git add apps/bot/src/storage/articles.repository.ts
git commit -m "feat(bot): add articles repository"
```

---

### Task 4: Create Habr RSS parser

**Files:**
- Create: `apps/bot/src/parsers/habr.parser.ts`

**Step 1: Implement parser**

Does NOT extend BaseParser (different return type — Article, not Job). Standalone class with same patterns.

```typescript
// apps/bot/src/parsers/habr.parser.ts
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
```

**Step 2: Commit**

```bash
git add apps/bot/src/parsers/habr.parser.ts
git commit -m "feat(bot): add Habr RSS parser"
```

---

### Task 5: Create article formatter

**Files:**
- Create: `apps/bot/src/telegram/formatters/article.formatter.ts`

**Step 1: Implement formatter**

```typescript
// apps/bot/src/telegram/formatters/article.formatter.ts
import type { Article } from '@freelance-hub/shared';

export function formatArticle(article: Omit<Article, 'id' | 'fetchedAt'>): string {
  const lines: string[] = [];

  lines.push(`<b>📖 ${escapeHtml(article.title)}</b>`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━');

  if (article.description) {
    const desc = article.description.length > 250
      ? article.description.slice(0, 250).trimEnd() + '...'
      : article.description;
    lines.push(escapeHtml(desc));
  }

  if (article.author) {
    lines.push(`✍️ ${escapeHtml(article.author)}`);
  }

  if (article.tags.length > 0) {
    const tagStr = article.tags.slice(0, 6).map((t) => `#${t.replace(/[\s.]+/g, '_')}`).join(' ');
    lines.push(tagStr);
  }

  lines.push(`📂 ${escapeHtml(article.hub)}`);
  lines.push('');
  lines.push(`<a href="${article.url}">Читать на Хабре →</a>`);

  return lines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

**Step 2: Commit**

```bash
git add apps/bot/src/telegram/formatters/article.formatter.ts
git commit -m "feat(bot): add article formatter for Telegram"
```

---

### Task 6: Add Habr config to env and defaults

**Files:**
- Modify: `apps/bot/src/config/env.ts`
- Create: `apps/bot/src/config/habr.ts`

**Step 1: Add env variables**

Add to `envSchema` in `env.ts`:
```typescript
TELEGRAM_HABR_CHANNEL_ID: z.string().optional(),
POLL_INTERVAL_HABR: z.coerce.number().default(600), // 10 minutes
```

**Step 2: Create Habr config with default hubs and keywords**

```typescript
// apps/bot/src/config/habr.ts
export interface HabrConfig {
  hubs: string[];
  includeKeywords: string[];
  excludeKeywords: string[];
}

export const DEFAULT_HABR_CONFIG: HabrConfig = {
  hubs: ['go', 'typescript', 'nodejs', 'devops', 'docker', 'postgresql', 'reactjs'],
  includeKeywords: [],  // empty = all articles from these hubs
  excludeKeywords: [],
};
```

**Step 3: Commit**

```bash
git add apps/bot/src/config/env.ts apps/bot/src/config/habr.ts
git commit -m "feat(bot): add Habr env config and default hubs"
```

---

### Task 7: Add /habr command

**Files:**
- Create: `apps/bot/src/telegram/commands/habr.ts`
- Modify: `apps/bot/src/telegram/bot.ts`

**Step 1: Implement /habr command**

```typescript
// apps/bot/src/telegram/commands/habr.ts
import type { Bot, Context } from 'grammy';
import { db } from '../../storage/db.js';
import { DEFAULT_HABR_CONFIG, type HabrConfig } from '../../config/habr.js';

export function getHabrConfig(): HabrConfig {
  const row = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('habr_config') as
    | { value: string }
    | undefined;
  if (row) return JSON.parse(row.value) as HabrConfig;
  return { ...DEFAULT_HABR_CONFIG };
}

function saveHabrConfig(config: HabrConfig): void {
  db.prepare('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)').run(
    'habr_config',
    JSON.stringify(config),
  );
}

export function registerHabrCommand(bot: Bot<Context>) {
  bot.command('habr', async (ctx) => {
    const config = getHabrConfig();
    const args = ctx.match?.trim();

    if (!args) {
      const hubList = config.hubs.join(', ') || 'не настроены';
      const incList = config.includeKeywords.join(', ') || 'все статьи';
      const excList = config.excludeKeywords.join(', ') || 'нет';
      await ctx.reply(
        `<b>📖 Настройки Хабра:</b>

<b>Хабы (${config.hubs.length}):</b>
${hubList}

<b>Ключевые слова:</b> ${incList}
<b>Исключения:</b> ${excList}

<b>Использование:</b>
<code>/habr add go</code> — добавить хаб
<code>/habr remove reactjs</code> — удалить хаб
<code>/habr keyword docker</code> — фильтр по слову
<code>/habr unkeyword docker</code> — убрать фильтр
<code>/habr exclude рекрутинг</code> — исключить слово
<code>/habr unexclude рекрутинг</code> — убрать из исключений
<code>/habr hubs</code> — список популярных хабов
<code>/habr reset</code> — сбросить к дефолту`,
        { parse_mode: 'HTML' },
      );
      return;
    }

    const [action, ...rest] = args.split(' ');
    const value = rest.join(' ').trim().toLowerCase();

    switch (action) {
      case 'add':
        if (!value) { await ctx.reply('Укажи хаб: /habr add go'); return; }
        if (!config.hubs.includes(value)) {
          config.hubs.push(value);
          saveHabrConfig(config);
        }
        await ctx.reply(`✅ Хаб добавлен: <b>${value}</b>`, { parse_mode: 'HTML' });
        break;

      case 'remove':
        if (!value) { await ctx.reply('Укажи хаб: /habr remove go'); return; }
        config.hubs = config.hubs.filter((h) => h !== value);
        saveHabrConfig(config);
        await ctx.reply(`🗑 Хаб удалён: <b>${value}</b>`, { parse_mode: 'HTML' });
        break;

      case 'keyword':
        if (!value) { await ctx.reply('Укажи слово: /habr keyword docker'); return; }
        if (!config.includeKeywords.includes(value)) {
          config.includeKeywords.push(value);
          saveHabrConfig(config);
        }
        await ctx.reply(`✅ Ключевое слово: <b>${value}</b>`, { parse_mode: 'HTML' });
        break;

      case 'unkeyword':
        if (!value) { await ctx.reply('Укажи слово: /habr unkeyword docker'); return; }
        config.includeKeywords = config.includeKeywords.filter((k) => k !== value);
        saveHabrConfig(config);
        await ctx.reply(`🗑 Убрано: <b>${value}</b>`, { parse_mode: 'HTML' });
        break;

      case 'exclude':
        if (!value) { await ctx.reply('Укажи слово: /habr exclude рекрутинг'); return; }
        if (!config.excludeKeywords.includes(value)) {
          config.excludeKeywords.push(value);
          saveHabrConfig(config);
        }
        await ctx.reply(`🚫 Исключено: <b>${value}</b>`, { parse_mode: 'HTML' });
        break;

      case 'unexclude':
        if (!value) { await ctx.reply('Укажи слово: /habr unexclude рекрутинг'); return; }
        config.excludeKeywords = config.excludeKeywords.filter((k) => k !== value);
        saveHabrConfig(config);
        await ctx.reply(`♻️ Убрано из исключений: <b>${value}</b>`, { parse_mode: 'HTML' });
        break;

      case 'hubs':
        await ctx.reply(
          `<b>Популярные хабы Хабра:</b>

go, typescript, nodejs, reactjs, python,
devops, docker, kubernetes, postgresql,
linux, git, algorithms, machine_learning,
security, api, testing, career, management`,
          { parse_mode: 'HTML' },
        );
        break;

      case 'reset':
        saveHabrConfig({ ...DEFAULT_HABR_CONFIG });
        await ctx.reply('🔄 Настройки Хабра сброшены.');
        break;

      default:
        await ctx.reply('Неизвестная команда. Используй /habr для справки.');
    }
  });
}
```

**Step 2: Register in bot.ts**

Add import:
```typescript
import { registerHabrCommand } from './commands/habr.js';
```

Add to bot commands array:
```typescript
{ command: 'habr', description: 'Настройка Хабр-статей' },
```

Add registration call:
```typescript
registerHabrCommand(bot);
```

**Step 3: Commit**

```bash
git add apps/bot/src/telegram/commands/habr.ts apps/bot/src/telegram/bot.ts
git commit -m "feat(bot): add /habr command for hub management"
```

---

### Task 8: Add Habr to scheduler

**Files:**
- Modify: `apps/bot/src/scheduler/cron.scheduler.ts`

**Step 1: Add Habr article parsing function**

Add imports at top:
```typescript
import { HabrParser } from '../parsers/habr.parser.js';
import { getHabrConfig } from '../telegram/commands/habr.js';
import { articlesRepo } from '../storage/articles.repository.js';
import { formatArticle } from '../telegram/formatters/article.formatter.js';
```

Add new function `runHabrParsers()`:
```typescript
async function runHabrParsers(): Promise<void> {
  const config = getHabrConfig();
  if (config.hubs.length === 0) return;

  const channelId = env.TELEGRAM_HABR_CHANNEL_ID;
  if (!channelId) {
    console.log('[habr] TELEGRAM_HABR_CHANNEL_ID not set, skipping');
    return;
  }

  for (const hub of config.hubs) {
    const parser = new HabrParser(hub);
    console.log(`[habr] Parsing hub: ${hub}...`);

    const articles = await parser.parse();
    console.log(`[habr] ${hub}: fetched ${articles.length} articles`);

    // Apply keyword filter if configured
    const filtered = articles.filter((article) => {
      const text = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();

      for (const kw of config.excludeKeywords) {
        if (text.includes(kw.toLowerCase())) return false;
      }

      // If no include keywords — accept all
      if (config.includeKeywords.length === 0) return true;

      for (const kw of config.includeKeywords) {
        if (text.includes(kw.toLowerCase())) return true;
      }
      return false;
    });
    console.log(`[habr] ${hub}: ${filtered.length} passed filter`);

    const newArticles = articlesRepo.saveMany(filtered);
    console.log(`[habr] ${hub}: ${newArticles.length} new articles`);

    if (isPaused() || newArticles.length === 0) continue;

    for (const article of newArticles) {
      const message = formatArticle(article);
      try {
        await bot.api.sendMessage(channelId, message, {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
        });
        await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`[habr] Failed to send article:`, (err as Error).message);
      }
    }
  }
}
```

**Step 2: Add Habr cron to startScheduler()**

Add inside `startScheduler()`:
```typescript
// Habr articles — every 10 minutes
cron.schedule('*/10 * * * *', async () => {
  await runHabrParsers();
});
```

Update cleanup to also clean articles:
```typescript
cron.schedule('0 3 * * *', () => {
  const deletedJobs = jobsRepo.cleanOld();
  const deletedArticles = articlesRepo.cleanOld();
  console.log(`[scheduler] Cleaned ${deletedJobs} old jobs, ${deletedArticles} old articles`);
});
```

Add Habr to initial run:
```typescript
void (async () => {
  for (const config of [...rssConfigs, ...apiConfigs]) {
    await runParser(config);
  }
  await runHabrParsers();
  console.log('[scheduler] Initial parse complete');
})();
```

Update log message:
```typescript
console.log('[scheduler] Cron jobs started (RSS: 5min, API: 15min, Habr: 10min)');
```

**Step 3: Commit**

```bash
git add apps/bot/src/scheduler/cron.scheduler.ts
git commit -m "feat(bot): add Habr articles to cron scheduler"
```

---

### Task 9: Update .env.example and add TELEGRAM_HABR_CHANNEL_ID

**Files:**
- Modify: `.env.example`

**Step 1: Add new env vars**

Add to `.env.example`:
```
# Habr articles channel (create a private channel, add bot as admin)
TELEGRAM_HABR_CHANNEL_ID=
POLL_INTERVAL_HABR=600
```

**Step 2: Commit**

```bash
git add .env.example
git commit -m "feat(bot): add Habr env vars to .env.example"
```

---

### Task 10: Final integration test

**Step 1: Add TELEGRAM_HABR_CHANNEL_ID to .env**

Add channel ID to local `.env` file.

**Step 2: Start bot and verify**

```bash
cd apps/bot && npm run dev
```

Expected output:
```
🤖 Freelance Hub Bot starting...
✅ Telegram bot is running
[scheduler] Running initial parse...
[habr] Parsing hub: go...
[habr] go: fetched N articles
[habr] go: N passed filter
[habr] go: N new articles
...
[scheduler] Initial parse complete
[scheduler] Cron jobs started (RSS: 5min, API: 15min, Habr: 10min)
```

**Step 3: Test /habr command in Telegram**

- Send `/habr` — should show current config
- Send `/habr add security` — should add hub
- Send `/habr hubs` — should show popular hubs list
- Send `/habr remove security` — should remove hub

**Step 4: Verify articles appear in channel**

Check the Telegram channel — new articles should be posted with title, description, author, tags, and "Читать на Хабре →" link.

**Step 5: Final commit**

```bash
git add -A && git commit -m "feat(bot): habr articles integration complete"
```
