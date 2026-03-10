import { Bot, Context, InlineKeyboard } from 'grammy';
import { jobsRepo } from '../../storage/jobs.repository.js';
import { getFilter } from './filter.js';
import { isPaused } from './pause.js';

const HELP_TEXT = `<b>📖 Freelance Hub Bot</b>

<b>Фильтрация:</b>
/filter — текущие настройки фильтра
/filter add <i>слово</i> — добавить ключевое слово
/filter remove <i>слово</i> — удалить
/filter exclude <i>слово</i> — в исключения
/filter budget <i>число</i> — мин. бюджет (₽)
/filter reset — сбросить к дефолту

<b>Платформы:</b>
/platforms — список и статус
/platforms enable|disable <i>id</i>

<b>Управление:</b>
/pause · /resume — пауза уведомлений
/stats — статистика
/help — эта справка`;

export function registerHelpCommand(bot: Bot<Context>) {
  bot.command('help', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('📊 Статистика', 'cb:stats')
      .text('⚙️ Фильтр', 'cb:filter')
      .row()
      .text('🌐 Платформы', 'cb:platforms')
      .text(isPaused() ? '▶️ Возобновить' : '⏸ Пауза', 'cb:toggle_pause');

    await ctx.reply(HELP_TEXT, {
      parse_mode: 'HTML',
      reply_markup: keyboard,
    });
  });

  // Inline button: stats
  bot.callbackQuery('cb:stats', async (ctx) => {
    await ctx.answerCallbackQuery();
    const stats = jobsRepo.getStats();
    if (stats.length === 0) {
      await ctx.reply('📊 Пока нет данных.');
      return;
    }
    const lines: string[] = ['<b>📊 Статистика</b>', ''];
    let totalToday = 0, totalWeek = 0, totalAll = 0;
    for (const s of stats) {
      lines.push(`<b>${s.platform}</b>: ${s.today} сегодня / ${s.week} неделя / ${s.total} всего`);
      totalToday += s.today; totalWeek += s.week; totalAll += s.total;
    }
    lines.push('', `<b>Итого:</b> ${totalToday} / ${totalWeek} / ${totalAll}`);
    await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
  });

  // Inline button: filter summary
  bot.callbackQuery('cb:filter', async (ctx) => {
    await ctx.answerCallbackQuery();
    const filter = getFilter();
    const inc = filter.includeKeywords.slice(0, 10).join(', ');
    const exc = filter.excludeKeywords.slice(0, 8).join(', ');
    await ctx.reply(
      `<b>⚙️ Фильтр</b>\n\n<b>Включить (${filter.includeKeywords.length}):</b>\n${inc}...\n\n<b>Исключить (${filter.excludeKeywords.length}):</b>\n${exc}...\n\n<b>Мин. бюджет:</b> ${filter.minBudget || 'нет'}\n\nИспользуй /filter для управления.`,
      { parse_mode: 'HTML' },
    );
  });

  // Inline button: platforms
  bot.callbackQuery('cb:platforms', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply('Используй /platforms для просмотра и управления платформами.');
  });

  // Inline button: toggle pause
  bot.callbackQuery('cb:toggle_pause', async (ctx) => {
    const { db } = await import('../../storage/db.js');
    const paused = isPaused();
    db.prepare('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)').run(
      'paused', String(!paused),
    );
    await ctx.answerCallbackQuery({ text: paused ? '▶️ Возобновлено' : '⏸ Приостановлено' });
    await ctx.reply(paused ? '▶️ Уведомления возобновлены!' : '⏸ Уведомления приостановлены.');
  });
}
