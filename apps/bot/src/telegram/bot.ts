import { Bot } from 'grammy';
import { env } from '../config/env.js';
import { registerStartCommand } from './commands/start.js';
import { registerFilterCommand } from './commands/filter.js';
import { registerPauseCommand } from './commands/pause.js';
import { registerStatsCommand } from './commands/stats.js';
import { registerPlatformsCommand } from './commands/platforms.js';
import { registerHelpCommand } from './commands/help.js';
import { registerHabrCommand } from './commands/habr.js';

export const bot = new Bot(env.TELEGRAM_BOT_TOKEN, {
  client: {
    apiRoot: env.TELEGRAM_API_ROOT ?? 'https://api.telegram.org',
  },
});

// Set bot commands menu (visible in Telegram UI)
bot.api.setMyCommands([
  { command: 'help', description: 'Список команд' },
  { command: 'filter', description: 'Настройка ключевых слов' },
  { command: 'platforms', description: 'Вкл/выкл платформы' },
  { command: 'stats', description: 'Статистика заказов' },
  { command: 'pause', description: 'Приостановить уведомления' },
  { command: 'resume', description: 'Возобновить уведомления' },
  { command: 'habr', description: 'Настройка Хабр-статей' },
]);

// Owner-only guard (must be before command handlers)
bot.use(async (ctx, next) => {
  if (ctx.from?.id.toString() !== env.TELEGRAM_CHAT_ID) {
    return;
  }
  await next();
});

// Register all commands
registerStartCommand(bot);
registerHelpCommand(bot);
registerFilterCommand(bot);
registerPauseCommand(bot);
registerStatsCommand(bot);
registerPlatformsCommand(bot);
registerHabrCommand(bot);
