import type { Bot, Context } from 'grammy';
import { jobsRepo } from '../../storage/jobs.repository.js';

export function registerStatsCommand(bot: Bot<Context>) {
  bot.command('stats', async (ctx) => {
    const stats = jobsRepo.getStats();

    if (stats.length === 0) {
      await ctx.reply('📊 Пока нет данных. Подожди первый цикл парсинга.');
      return;
    }

    const lines: string[] = ['<b>📊 Статистика заказов</b>', ''];

    let totalAll = 0;
    let totalToday = 0;
    let totalWeek = 0;

    for (const s of stats) {
      lines.push(`<b>${s.platform}</b>: ${s.today} сегодня / ${s.week} за неделю / ${s.total} всего`);
      totalAll += s.total;
      totalToday += s.today;
      totalWeek += s.week;
    }

    lines.push('');
    lines.push(`<b>Итого:</b> ${totalToday} сегодня / ${totalWeek} за неделю / ${totalAll} всего`);

    await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
  });
}
