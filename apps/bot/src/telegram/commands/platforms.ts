import type { Bot, Context } from 'grammy';
import { PLATFORM_CONFIGS } from '../../config/platforms.js';
import { db } from '../../storage/db.js';
import { Platform } from '@freelance-hub/shared';

function getDisabledPlatforms(): Set<string> {
  const row = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('disabled_platforms') as
    | { value: string }
    | undefined;
  if (row) return new Set(JSON.parse(row.value) as string[]);
  return new Set();
}

function saveDisabledPlatforms(disabled: Set<string>): void {
  db.prepare('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)').run(
    'disabled_platforms',
    JSON.stringify([...disabled]),
  );
}

export function isPlatformEnabled(platform: Platform): boolean {
  const disabled = getDisabledPlatforms();
  return !disabled.has(platform);
}

export function registerPlatformsCommand(bot: Bot<Context>) {
  bot.command('platforms', async (ctx) => {
    const args = ctx.match?.trim();
    const disabled = getDisabledPlatforms();

    if (!args) {
      const lines: string[] = ['<b>🌐 Платформы</b>', ''];
      for (const config of PLATFORM_CONFIGS) {
        const isEnabled = !disabled.has(config.platform) && config.enabled;
        const status = isEnabled ? '✅' : '❌';
        const apiNote = config.token === undefined && !config.enabled ? ' (нет токена)' : '';
        lines.push(`${status} <b>${config.platform}</b>${apiNote}`);
      }
      lines.push('');
      lines.push('<code>/platforms enable fl_ru</code>');
      lines.push('<code>/platforms disable fl_ru</code>');
      await ctx.reply(lines.join('\n'), { parse_mode: 'HTML' });
      return;
    }

    const [action, platform] = args.split(' ');

    if (!platform || !Object.values(Platform).includes(platform as Platform)) {
      await ctx.reply(
        `Укажи платформу. Доступные:\n${Object.values(Platform).join(', ')}`,
      );
      return;
    }

    if (action === 'enable') {
      disabled.delete(platform);
      saveDisabledPlatforms(disabled);
      await ctx.reply(`✅ ${platform} включена`);
    } else if (action === 'disable') {
      disabled.add(platform);
      saveDisabledPlatforms(disabled);
      await ctx.reply(`❌ ${platform} отключена`);
    } else {
      await ctx.reply('Используй: /platforms enable|disable <platform>');
    }
  });
}
