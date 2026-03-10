import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { routing } from "@/i18n/routing";
import { SmoothScrollProvider } from "@/lib/providers/smooth-scroll-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { inter, jetbrainsMono } from "@/lib/fonts";
import "@/app/globals.css";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: {
      default: t("title"),
      template: `%s | ${t("title")}`,
    },
    description: t("description"),
    metadataBase: new URL("https://vdovin.dev"),
    alternates: {
      canonical: "/",
      languages: { ru: "/", en: "/en" },
    },
    openGraph: {
      type: "website",
      locale: locale === "ru" ? "ru_RU" : "en_US",
      siteName: "Daniil Vdovin",
    },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-bg text-text-primary font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <SmoothScrollProvider>
            <Header />
            <main>{children}</main>
            <Footer />
          </SmoothScrollProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
