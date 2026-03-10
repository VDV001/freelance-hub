import { bot } from './telegram/bot.js';
import { startScheduler } from './scheduler/cron.scheduler.js';

async function main() {
  console.log('🤖 Freelance Hub Bot starting...');

  // Start the Telegram bot (long polling)
  bot.start({
    onStart: () => {
      console.log('✅ Telegram bot is running');
    },
  });

  // Start job parsers scheduler
  startScheduler();

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Shutting down...');
    bot.stop();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
