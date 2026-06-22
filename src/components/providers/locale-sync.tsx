"use client";

import { useTranslation } from "@/components/providers/i18n-provider";
import { isValidLocale } from "@/lib/i18n";
import { useEffect } from "react";

/** Sync locale from the server profile when the profile language changes — not on every user toggle. */
export function LocaleSync({ language }: { language?: string | null }) {
  const { setLocale } = useTranslation();

  useEffect(() => {
    if (language && isValidLocale(language)) {
      setLocale(language);
    }
  }, [language, setLocale]);

  return null;
}
