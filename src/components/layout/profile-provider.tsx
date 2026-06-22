"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { Profile } from "@/types/database";

type ProfileContextValue = {
  profile: Profile | null;
  patchProfile: (patch: Partial<Profile>) => void;
};

const ProfileCtx = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({
  profile: initialProfile,
  children,
}: {
  profile: Profile | null;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);

  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const patchProfile = useCallback((patch: Partial<Profile>) => {
    setProfile((prev) => (prev ? { ...prev, ...patch } : null));
  }, []);

  return (
    <ProfileCtx.Provider value={{ profile, patchProfile }}>{children}</ProfileCtx.Provider>
  );
}

export function useProfile() {
  return useContext(ProfileCtx)?.profile ?? null;
}

export function usePatchProfile() {
  return useContext(ProfileCtx)?.patchProfile ?? (() => {});
}
