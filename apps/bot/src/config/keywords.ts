import type { FilterConfig } from '@freelance-hub/shared';

export const DEFAULT_FILTER: FilterConfig = {
  includeKeywords: [
    // Backend
    'golang', 'go разработ', 'nestjs', 'node.js', 'nodejs', 'express',
    'rest api', 'graphql', 'grpc', 'websocket',
    'postgresql', 'postgres', 'redis', 'docker', 'kubernetes',
    'микросервис', 'microservice', 'clean architecture',
    // Frontend
    'react', 'next.js', 'nextjs', 'typescript',
    'spa', 'pwa', 'tailwind',
    // Fullstack
    'fullstack', 'full-stack', 'фулстек', 'full stack',
    'веб-разработка', 'web development', 'веб-приложение',
    'бэкенд', 'backend', 'фронтенд', 'frontend',
    // Integrations
    'telegram bot', 'телеграм бот', '1c', 'erp',
    'llm', 'openai', 'ai интеграция', 'ai integration',
    // DevOps
    'ci/cd', 'github actions', 'devops',
  ],
  excludeKeywords: [
    'wordpress', 'php', 'laravel', 'bitrix', 'drupal', 'joomla',
    'java ', 'c#', '.net', 'angular', 'vue.js',
    'ios', 'swift', 'kotlin', 'flutter', 'react native',
    'дизайн логотип', 'seo', 'smm', 'маркетинг',
    'копирайт', 'рерайт', 'контент-менеджер', 'перевод текст',
    '1с бухгалтер', 'excel', 'парсинг сайт',
  ],
  minBudget: 0,
};
