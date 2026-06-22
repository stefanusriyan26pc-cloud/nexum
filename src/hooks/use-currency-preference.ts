"use client";

import { usePatchProfile, useProfile } from "@/components/layout/profile-provider";
import { createClient } from "@/lib/supabase/client";
import { useCallback } from "react";

export function useCurrencyPreference() {
  const profile = useProfile();
  const patchProfile = usePatchProfile();
  const currency = profile?.currency ?? "IDR";

  const changeCurrency = useCallback(
    async (next: string) => {
      if (next === currency || !profile) return;
      patchProfile({ currency: next });
      const supabase = createClient();
      await supabase.from("profiles").update({ currency: next }).eq("id", profile.id);
    },
    [currency, profile, patchProfile]
  );

  return { currency, changeCurrency };
}
