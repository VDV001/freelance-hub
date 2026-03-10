export interface HabrConfig {
  hubs: string[];
  includeKeywords: string[];
  excludeKeywords: string[];
}

export const DEFAULT_HABR_CONFIG: HabrConfig = {
  hubs: ['go', 'typescript', 'nodejs', 'devops', 'docker', 'postgresql', 'reactjs'],
  includeKeywords: [],
  excludeKeywords: [],
};
