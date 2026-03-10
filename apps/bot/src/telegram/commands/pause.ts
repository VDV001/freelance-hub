import type { Bot, Context } from 'grammy';
import { db } from '../../storage/db.js';

function isPaused(): boolean {
  const row = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('paused') as
    | { value: string }
    | undefined;
  return row?.value === 'true';
}

function setPaused(paused: boolean): void {
  db.prepare('INSERT OR REPLACE INTO user_settings (key, value) VALUES (?, ?)').run(
    'paused',
    String(paused),
  );
}

export { isPaused };

export function registerPauseCommand(bot: Bot<Context>) {
  bot.command('pause', async (ctx) => {
    setPaused(true);
    await ctx.reply('⏸ Уведомления приостановлены. /resume чтобы возобновить.');
  });

  bot.command('resume', async (ctx) => {
    setPaused(false);
    await ctx.reply('▶️ Уведомления возобновлены!');
  });
}
