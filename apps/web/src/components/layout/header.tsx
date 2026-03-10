"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export function Header() {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const locale = useLocale();
  const switchLocale = () => {
    const newLocale = locale === "ru" ? "en" : "ru";
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"
      } ${scrolled ? "backdrop-blur-xl bg-bg/80 border-b border-border" : ""}`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8 h-16 flex items-center justify-between">
        <button onClick={() => scrollTo("hero")} className="text-lg font-bold text-text-primary hover:text-accent transition-colors">
          DV
        </button>

        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollTo(item.id)}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {t(item.labelKey)}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={switchLocale}
            className="text-sm text-text-muted hover:text-text-primary transition-colors px-2 py-1 rounded border border-border hover:border-border-hover"
          >
            RU / EN
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-text-primary"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
              ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-bg/95 backdrop-blur-xl border-b border-border">
          <nav className="flex flex-col px-6 py-4 gap-4">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className="text-left text-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                {t(item.labelKey)}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
