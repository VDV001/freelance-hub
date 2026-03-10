import { config } from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));
// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../../.env') });

const envSchema = z.object({
  TELEGRAM_BOT_TOKEN: z.string().min(1),
  TELEGRAM_CHAT_ID: z.string().min(1),

  FREELANCEHUNT_TOKEN: z.string().optional(),
  JOOBLE_API_KEY: z.string().optional(),
  HH_ACCESS_TOKEN: z.string().optional(),

  TELEGRAM_HABR_CHANNEL_ID: z.string().optional(),
  POLL_INTERVAL_RSS: z.coerce.number().default(300),
  POLL_INTERVAL_API: z.coerce.number().default(900),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
