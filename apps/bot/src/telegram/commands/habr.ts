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
