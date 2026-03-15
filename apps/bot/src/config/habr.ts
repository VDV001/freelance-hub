export interface HabrConfig {
  hubs: string[];
  includeKeywords: string[];
  excludeKeywords: string[];
}

export const DEFAULT_HABR_CONFIG: HabrConfig = {
  hubs: [
    'go', 'typescript', 'nodejs', 'nestjs', 'devops', 'postgresql', 'reactjs',
    'artificial_intelligence', 'machine_learning', 'natural_language_processing',
    'image_processing', 'bigdata', 'cloud_services',
  ],
  includeKeywords: [],
  excludeKeywords: [],
};
