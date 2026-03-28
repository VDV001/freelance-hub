import cron from 'node-cron';
import { Platform, type ParserConfig } from '@freelance-hub/shared';
import { PLATFORM_CONFIGS } from '../config/platforms.js';
import { getFilter } from '../telegram/commands/filter.js';
import { isPaused } from '../telegram/commands/pause.js';
import { isPlatformEnabled } from '../telegram/commands/platforms.js';
import { matchesFilter } from '../matcher/keyword.matcher.js';
import { jobsRepo } from '../storage/jobs.repository.js';
import { formatJob } from '../telegram/formatters/job.formatter.js';
import { bot } from '../telegram/bot.js';
import { env } from '../config/env.js';
import { BaseParser } from '../parsers/base.parser.js';
import { RssJobParser } from '../parsers/rss.parser.js';
import { RemoteOKParser } from '../parsers/remoteok.parser.js';
import { HHParser } from '../parsers/hh.parser.js';
import { FreelancehuntParser } from '../parsers/freelancehunt.parser.js';
import { HabrParser } from '../parsers/habr.parser.js';
import { getHabrConfig } from '../telegram/commands/habr.js';
import { articlesRepo, hashUrl } from '../storage/articles.repository.js';
import { formatArticle } from '../telegram/formatters/article.formatter.js';

function createParser(config: ParserConfig): BaseParser | null {
  switch (config.platform) {
    case Platform.HABR_FREELANCE:
    case Platform.FL_RU:
    case Platform.WEBLANCER:
    case Platform.WE_WORK_REMOTELY:
    case Platform.GURU:
      return new RssJobParser(config.platform, config.url);
    case Platform.REMOTE_OK:
      return new RemoteOKParser();
    case Platform.HH_RU:
      return new HHParser(config.token);
    case Platform.FREELANCEHUNT:
      return config.token ? new FreelancehuntParser(config.token) : null;
    default:
      return null;
  }
}

async function runParser(config: ParserConfig): Promise<void> {
  if (!config.enabled || !isPlatformEnabled(config.platform)) return;

  const parser = createParser(config);
  if (!parser) return;

  console.log(`[scheduler] Parsing ${config.platform}...`);
  const jobs = await parser.parse();
  console.log(`[scheduler] ${config.platform}: fetched ${jobs.length} jobs`);

  const filter = getFilter();
  const matched = jobs.filter((job) => matchesFilter(job, filter));
  console.log(`[scheduler] ${config.platform}: ${matched.length} matched filter`);

  const newJobs = jobsRepo.saveMany(matched);
  console.log(`[scheduler] ${config.platform}: ${newJobs.length} new jobs`);

  if (isPaused() || newJobs.length === 0) return;

  // Send notifications for new jobs
  for (const job of newJobs) {
    const fullJob = {
      ...job,
      id: '',
      fetchedAt: new Date().toISOString(),
    };
    const message = formatJob(fullJob);
    try {
      await bot.api.sendMessage(env.TELEGRAM_CHAT_ID, message, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
      });
      // Small delay to avoid Telegram rate limits
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[scheduler] Failed to send notification:`, (err as Error).message);
    }
  }
}

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

    const filtered = articles.filter((article) => {
      const text = `${article.title} ${article.description} ${article.tags.join(' ')}`.toLowerCase();

      for (const kw of config.excludeKeywords) {
        if (text.includes(kw.toLowerCase())) return false;
      }

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

    // Limit to 5 newest articles per hub per run to avoid Telegram rate limits
    const toSend = newArticles.slice(0, 5);
    for (const article of toSend) {
      const message = formatArticle(article);
      try {
        await bot.api.sendMessage(channelId, message, {
          parse_mode: 'HTML',
          link_preview_options: { is_disabled: true },
          reply_markup: {
            inline_keyboard: [[
              { text: '📥 В базу знаний', callback_data: `kb:${hashUrl(article.url)}` },
            ]],
          },
        });
        await new Promise((r) => setTimeout(r, 3000));
      } catch (err) {
        const errMsg = (err as Error).message;
        if (errMsg.includes('429')) {
          console.log(`[habr] Rate limited, pausing hub ${hub}`);
          break;
        }
        console.error(`[habr] Failed to send article:`, errMsg);
      }
    }
  }
}

export function startScheduler(): void {
  // Group configs by interval
  const rssConfigs = PLATFORM_CONFIGS.filter(
    (c) =>
      c.interval <= 300 &&
      [Platform.HABR_FREELANCE, Platform.FL_RU, Platform.WEBLANCER, Platform.WE_WORK_REMOTELY, Platform.GURU].includes(c.platform),
  );
  const apiConfigs = PLATFORM_CONFIGS.filter((c) => !rssConfigs.includes(c));

  // RSS — every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    for (const config of rssConfigs) {
      await runParser(config);
    }
  });

  // API — every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    for (const config of apiConfigs) {
      await runParser(config);
    }
  });

  // Habr articles — every 10 minutes
  cron.schedule('*/10 * * * *', async () => {
    await runHabrParsers();
  });

  // Cleanup old jobs and articles — daily at 3 AM
  cron.schedule('0 3 * * *', () => {
    const deletedJobs = jobsRepo.cleanOld();
    const deletedArticles = articlesRepo.cleanOld();
    console.log(`[scheduler] Cleaned ${deletedJobs} old jobs, ${deletedArticles} old articles`);
  });

  // Initial run on startup
  console.log('[scheduler] Running initial parse...');
  void (async () => {
    for (const config of [...rssConfigs, ...apiConfigs]) {
      await runParser(config);
    }
    await runHabrParsers();
    console.log('[scheduler] Initial parse complete');
  })();

  console.log('[scheduler] Cron jobs started (RSS: 5min, API: 15min, Habr: 10min)');
}
