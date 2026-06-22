"use client";

import { usePatchProfile, useProfile } from "@/components/layout/profile-provider";
import { useTranslation } from "@/components/providers/i18n-provider";
import type { Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/client";
import { useCallback } from "react";

/** Single source of truth for locale — keeps header toggle and Settings in sync. */
export function useLocalePreference() {
  const { locale, setLocale } = useTranslation();
  const profile = useProfile();
  const patchProfile = usePatchProfile();

  const changeLocale = useCallback(
    async (next: Locale) => {
      if (next === locale) return;
      setLocale(next);
      patchProfile({ language: next });

      if (profile) {
        const supabase = createClient();
        await supabase.from("profiles").update({ language: next }).eq("id", profile.id);
      }
    },
    [locale, setLocale, profile, patchProfile]
  );

  return { locale, changeLocale };
}
