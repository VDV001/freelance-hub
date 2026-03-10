import { Platform, type ParserConfig } from '@freelance-hub/shared';
import { env } from './env.js';

export const PLATFORM_CONFIGS: ParserConfig[] = [
  // Tier 1 — RSS
  // NOTE: Habr Freelance closed on Feb 28, 2025
  {
    platform: Platform.FL_RU,
    enabled: true,
    interval: env.POLL_INTERVAL_RSS,
    url: 'https://www.fl.ru/rss/all.xml',
  },
  {
    platform: Platform.WE_WORK_REMOTELY,
    enabled: true,
    interval: env.POLL_INTERVAL_RSS,
    url: 'https://weworkremotely.com/remote-jobs.rss',
  },
  // NOTE: Guru RSS returns 404, Weblancer RSS returns 404 — disabled
  // Tier 1 — API
  {
    platform: Platform.REMOTE_OK,
    enabled: true,
    interval: env.POLL_INTERVAL_API,
    url: 'https://remoteok.com/api',
  },
  {
    platform: Platform.FREELANCEHUNT,
    enabled: !!env.FREELANCEHUNT_TOKEN,
    interval: env.POLL_INTERVAL_API,
    url: 'https://api.freelancehunt.com/v2/projects',
    token: env.FREELANCEHUNT_TOKEN,
  },
  {
    platform: Platform.HH_RU,
    enabled: true,
    interval: env.POLL_INTERVAL_API,
    url: 'https://api.hh.ru/vacancies',
    token: env.HH_ACCESS_TOKEN,
  },
  {
    platform: Platform.JOOBLE,
    enabled: !!env.JOOBLE_API_KEY,
    interval: env.POLL_INTERVAL_API,
    url: 'https://jooble.org/api/',
    token: env.JOOBLE_API_KEY,
  },
];
