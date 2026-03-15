import { Bot, Context, InlineKeyboard } from 'grammy';

export function registerStartCommand(bot: Bot<Context>) {
  bot.command('start', async (ctx) => {
    const keyboard = new InlineKeyboard()
      .text('📊 Статистика', 'cb:stats')
      .text('⚙️ Фильтр', 'cb:filter')
      .row()
      .text('🌐 Платформы', 'cb:platforms')
      .text('📖 Помощь', 'cb:help');

    await ctx.reply(
      `<b>Freelance Hub Bot</b> 🤖

Мониторю фриланс-биржи и присылаю заказы под твой профиль.

<b>Платформы:</b> FL.ru, WWR, RemoteOK, hh.ru, Freelancehunt
<b>Интервал:</b> RSS каждые 5 мин, API каждые 15 мин

Бот уже работает! Используй кнопки ниже или /help для списка команд.`,
      { parse_mode: 'HTML', reply_markup: keyboard },
    );
  });

  // Handle help button callback
  bot.callbackQuery('cb:help', async (ctx) => {
    await ctx.answerCallbackQuery();
    await ctx.reply(
      `<b>📖 Команды</b>

/filter — настройки фильтра
/filter add <i>слово</i> — добавить
/filter remove <i>слово</i> — удалить
/filter exclude <i>слово</i> — исключить
/filter budget <i>число</i> — мин. бюджет
/filter reset — сбросить

/platforms — платформы
/pause · /resume — пауза
/stats — статистика
/help — справка с кнопками`,
      { parse_mode: 'HTML' },
    );
  });
}
