export interface FilterConfig {
  /** Keywords to match (case-insensitive, checked against title + description) */
  includeKeywords: string[];
  /** Keywords to exclude */
  excludeKeywords: string[];
  /** Minimum budget in RUB (0 = no filter) */
  minBudget: number;
}
