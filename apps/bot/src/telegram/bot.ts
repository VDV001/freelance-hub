import { Bot, InlineKeyboard } from 'grammy';
import { env } from '../config/env.js';
import { registerStartCommand } from './commands/start.js';
import { registerFilterCommand } from './commands/filter.js';
import { registerPauseCommand } from './commands/pause.js';
import { registerStatsCommand } from './commands/stats.js';
import { registerPlatformsCommand } from './commands/platforms.js';
import { registerHelpCommand } from './commands/help.js';
import { registerHabrCommand } from './commands/habr.js';
import { articlesRepo } from '../storage/articles.repository.js';
import { exportToInbox } from '../export/inbox.exporter.js';

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
// Allow kb: callback queries from channel (anonymous admin has different from.id)
bot.use(async (ctx, next) => {
  const cbData = ctx.callbackQuery?.data;
  if (cbData?.startsWith('kb:') || cbData === 'noop') {
    await next();
    return;
  }
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

// Callback: save article to knowledge base inbox
bot.on('callback_query:data', async (ctx) => {
  const data = ctx.callbackQuery.data;
  if (data === 'noop') {
    await ctx.answerCallbackQuery();
    return;
  }
  if (!data.startsWith('kb:')) return;

  const id = data.slice(3);
  const article = articlesRepo.findById(id);
  if (!article) {
    await ctx.answerCallbackQuery({ text: 'Статья не найдена в БД' });
    return;
  }

  const added = exportToInbox([article]);
  const label = added ? '✅ Сохранено' : '✅ Уже в базе';
  const keyboard = new InlineKeyboard().text(label, 'noop');

  await ctx.editMessageReplyMarkup({ reply_markup: keyboard });
  await ctx.answerCallbackQuery({ text: added ? 'Сохранено в базу знаний!' : 'Уже в базе знаний' });
});
