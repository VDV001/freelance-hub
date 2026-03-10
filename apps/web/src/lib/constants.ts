export const SITE_CONFIG = {
  name: "Daniil Vdovin",
  title: "Fullstack Developer",
  url: "https://vdovin.dev",
  github: "https://github.com/VDV001",
  telegram: "https://t.me/V_D_V_7",
  email: "daniilvdovin4@gmail.com",
  habr: "https://career.habr.com/vdv007",
} as const;

export const NAV_ITEMS = [
  { id: "about", labelKey: "nav.about" },
  { id: "stack", labelKey: "nav.stack" },
  { id: "experience", labelKey: "nav.experience" },
  { id: "projects", labelKey: "nav.projects" },
  { id: "contact", labelKey: "nav.contact" },
] as const;
