"use client";

import { HeaderControls } from "@/components/layout/header-controls";
import { ProfileMenu } from "@/components/layout/profile-menu";
import type { Profile } from "@/types/database";

export function Header({
  title,
  subtitle,
  profile,
  children,
}: {
  title: string;
  subtitle?: string;
  profile: Profile | null;
  children?: React.ReactNode;
}) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800/80 dark:bg-slate-950">
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-50">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
        <HeaderControls />
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
        <ProfileMenu profile={profile} />
      </div>
    </header>
  );
}
