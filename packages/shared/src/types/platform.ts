export enum Platform {
  HABR_FREELANCE = 'habr_freelance',
  FL_RU = 'fl_ru',
  WEBLANCER = 'weblancer',
  REMOTE_OK = 'remote_ok',
  FREELANCEHUNT = 'freelancehunt',
  HH_RU = 'hh_ru',
  FREELANCER_COM = 'freelancer_com',
  JOOBLE = 'jooble',
  WE_WORK_REMOTELY = 'wwr',
  GURU = 'guru',
}

export interface ParserConfig {
  platform: Platform;
  enabled: boolean;
  /** Polling interval in seconds */
  interval: number;
  /** RSS feed or API URL */
  url: string;
  /** API token if required */
  token?: string;
}
