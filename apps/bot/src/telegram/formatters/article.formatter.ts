import type { Article } from '@freelance-hub/shared';

export function formatArticle(article: Omit<Article, 'id' | 'fetchedAt'>): string {
  const lines: string[] = [];

  lines.push(`<b>📖 ${escapeHtml(article.title)}</b>`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━');

  if (article.description) {
    const desc = article.description.length > 250
      ? article.description.slice(0, 250).trimEnd() + '...'
      : article.description;
    lines.push(escapeHtml(desc));
  }

  if (article.author) {
    lines.push(`✍️ ${escapeHtml(article.author)}`);
  }

  if (article.tags.length > 0) {
    const tagStr = article.tags.slice(0, 6).map((t) => `#${t.replace(/[\s.]+/g, '_')}`).join(' ');
    lines.push(tagStr);
  }

  lines.push(`📂 ${escapeHtml(article.hub)}`);
  lines.push('');
  lines.push(`<a href="${article.url}">Читать на Хабре →</a>`);

  return lines.join('\n');
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
