import type { Bot, Context } from 'grammy';
import { db } from '../../storage/db.js';
import { DEFAULT_FILTER } from '../../config/keywords.js';
import type { FilterConfig } from '@freelance-hub/shared';

function getFilter(): FilterConfig {
  const row = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('filter') as
    | { value: string }
    | undefined;
  if (row) return JSON.parse(row.value) as FilterConfig;
  return DEFAULT_FILTER;
}

function saveFilter(filter: FilterConfig): void {
  db.prepare('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)').run(
    'filter',
    JSON.stringify(filter),
  );
}

export { getFilter };

export function registerFilterCommand(bot: Bot<Context>) {
  bot.command('filter', async (ctx) => {
    const filter = getFilter();
    const args = ctx.match?.trim();

    if (!args) {
      const includeList = filter.includeKeywords.slice(0, 15).join(', ');
      const excludeList = filter.excludeKeywords.slice(0, 10).join(', ');
      await ctx.reply(
        `<b>Текущий фильтр:</b>

<b>Включить (${filter.includeKeywords.length}):</b>
${includeList}${filter.includeKeywords.length > 15 ? '...' : ''}

<b>Исключить (${filter.excludeKeywords.length}):</b>
${excludeList}${filter.excludeKeywords.length > 10 ? '...' : ''}

<b>Мин. бюджет:</b> ${filter.minBudget || 'не задан'}

<b>Использование:</b>
<code>/filter add react native</code> — добавить ключевое слово
<code>/filter remove react native</code> — удалить
<code>/filter exclude wordpress</code> — добавить в исключения
<code>/filter unexclude wordpress</code> — убрать из исключений
<code>/filter budget 30000</code> — мин. бюджет
<code>/filter reset</code> — сбросить к дефолту`,
        { parse_mode: 'HTML' },
      );
      return;
    }

    const [action, ...rest] = args.split(' ');
    const keyword = rest.join(' ').trim().toLowerCase();

    switch (action) {
      case 'add':
        if (!keyword) { await ctx.reply('Укажи ключевое слово: /filter add nestjs'); return; }
        if (!filter.includeKeywords.includes(keyword)) {
          filter.includeKeywords.push(keyword);
          saveFilter(filter);
        }
        await ctx.reply(`✅ Добавлено: <b>${keyword}</b>`, { parse_mode: 'HTML' });
        break;

      case 'remove':
        if (!keyword) { await ctx.reply('Укажи ключевое слово: /filter remove nestjs'); return; }
        filter.includeKeywords = filter.includeKeywords.filter((k: string) => k !== keyword);
        saveFilter(filter);
        await ctx.reply(`🗑 Удалено: <b>${keyword}</b>`, { parse_mode: 'HTML' });
        break;

      case 'exclude':
        if (!keyword) { await ctx.reply('Укажи слово: /filter exclude wordpress'); return; }
        if (!filter.excludeKeywords.includes(keyword)) {
          filter.excludeKeywords.push(keyword);
          saveFilter(filter);
        }
        await ctx.reply(`🚫 Исключено: <b>${keyword}</b>`, { parse_mode: 'HTML' });
        break;

      case 'unexclude':
        if (!keyword) { await ctx.reply('Укажи слово: /filter unexclude wordpress'); return; }
        filter.excludeKeywords = filter.excludeKeywords.filter((k: string) => k !== keyword);
        saveFilter(filter);
        await ctx.reply(`♻️ Убрано из исключений: <b>${keyword}</b>`, { parse_mode: 'HTML' });
        break;

      case 'budget': {
        const amount = parseInt(keyword, 10);
        if (isNaN(amount)) { await ctx.reply('Укажи число: /filter budget 30000'); return; }
        filter.minBudget = amount;
        saveFilter(filter);
        await ctx.reply(`💰 Мин. бюджет: <b>${amount} ₽</b>`, { parse_mode: 'HTML' });
        break;
      }

      case 'reset':
        saveFilter(DEFAULT_FILTER);
        await ctx.reply('🔄 Фильтр сброшен к дефолтным настройкам.');
        break;

      default:
        await ctx.reply('Неизвестная команда. Используй /filter для справки.');
    }
  });
}
