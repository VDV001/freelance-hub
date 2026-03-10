import { useTranslations } from "next-intl";
import { SITE_CONFIG } from "@/lib/constants";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border py-12 px-6 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-text-muted text-sm">
          &copy; {year} {t("copyright")}
        </p>
        <div className="flex items-center gap-6">
          <a href={SITE_CONFIG.github} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors text-sm">
            GitHub
          </a>
          <a href={SITE_CONFIG.telegram} target="_blank" rel="noopener noreferrer" className="text-text-muted hover:text-text-primary transition-colors text-sm">
            Telegram
          </a>
          <a href={`mailto:${SITE_CONFIG.email}`} className="text-text-muted hover:text-text-primary transition-colors text-sm">
            Email
          </a>
        </div>
      </div>
    </footer>
  );
}
