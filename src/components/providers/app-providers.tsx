"use client";

import { I18nProvider } from "@/components/providers/i18n-provider";

export function AppProviders({
  initialLocale,
  children,
}: {
  initialLocale?: string | null;
  children: React.ReactNode;
}) {
  return <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>;
}
