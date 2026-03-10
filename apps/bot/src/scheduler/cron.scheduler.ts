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
import { JoobleParser } from '../parsers/jooble.parser.js';

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
    case Platform.JOOBLE:
      return config.token ? new JoobleParser(config.token) : null;
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

  // Cleanup old jobs — daily at 3 AM
  cron.schedule('0 3 * * *', () => {
    const deleted = jobsRepo.cleanOld();
    console.log(`[scheduler] Cleaned ${deleted} old jobs`);
  });

  // Initial run on startup
  console.log('[scheduler] Running initial parse...');
  void (async () => {
    for (const config of [...rssConfigs, ...apiConfigs]) {
      await runParser(config);
    }
    console.log('[scheduler] Initial parse complete');
  })();

  console.log('[scheduler] Cron jobs started (RSS: 5min, API: 15min)');
}
