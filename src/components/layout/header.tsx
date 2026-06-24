"use client";

import { HeaderControls } from "@/components/layout/header-controls";
import { ProfileMenu } from "@/components/layout/profile-menu";
import { SidebarTrigger } from "@/components/layout/sidebar-trigger";
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
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 dark:border-slate-800/80 dark:bg-slate-950 sm:h-16 sm:gap-3 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
        <SidebarTrigger />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-50 sm:text-xl">
            {title}
          </h1>
          {subtitle && (
            <p className="hidden truncate text-sm text-slate-500 dark:text-slate-400 sm:block">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {children}
        <HeaderControls />
        <div className="hidden h-6 w-px bg-slate-200 dark:bg-slate-800 sm:block" />
        <ProfileMenu profile={profile} />
      </div>
    </header>
  );
}
