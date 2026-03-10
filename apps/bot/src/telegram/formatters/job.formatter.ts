import type { Job, Platform } from '@freelance-hub/shared';

const PLATFORM_NAMES: Record<string, string> = {
  habr_freelance: 'Habr Freelance',
  fl_ru: 'FL.ru',
  weblancer: 'Weblancer',
  remote_ok: 'RemoteOK',
  freelancehunt: 'Freelancehunt',
  hh_ru: 'hh.ru',
  freelancer_com: 'Freelancer.com',
  jooble: 'Jooble',
  wwr: 'We Work Remotely',
  guru: 'Guru',
};

export function formatJob(job: Job): string {
  const lines: string[] = [];

  lines.push(`<b>🔍 ${escapeHtml(job.title)}</b>`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━');

  if (job.description) {
    const desc = job.description.length > 200
      ? job.description.slice(0, 200).trimEnd() + '...'
      : job.description;
    lines.push(`📋 ${escapeHtml(desc)}`);
  }

  if (job.budget) {
    lines.push(`💰 ${escapeHtml(job.budget)}`);
  }

  if (job.skills.length > 0) {
    lines.push(`🏷 ${escapeHtml(job.skills.slice(0, 8).join(', '))}`);
  }

  const platformName = PLATFORM_NAMES[job.platform] ?? job.platform;
  lines.push(`🌐 ${platformName}`);

  const ago = timeAgo(job.createdAt);
  lines.push(`⏰ ${ago}`);

  lines.push('');
  lines.push(`<a href="${job.url}">Открыть заказ →</a>`);

  return lines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function timeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60_000);

  if (minutes < 1) return 'только что';
  if (minutes < 60) return `${minutes} мин назад`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} ч назад`;

  const days = Math.floor(hours / 24);
  return `${days} д назад`;
}
