"use client";

import { NexumLogo } from "@/components/brand/nexum-logo";
import { useTranslation } from "@/components/providers/i18n-provider";
import { APP_VERSION } from "@/lib/app-version";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  CheckSquare,
  LayoutDashboard,
  NotebookPen,
  Settings,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/dashboard", key: "nav.dashboard", icon: LayoutDashboard },
  { href: "/tasks", key: "nav.tasks", icon: CheckSquare },
  { href: "/notes", key: "nav.notes", icon: NotebookPen },
  { href: "/calendar", key: "nav.calendar", icon: CalendarDays },
  { href: "/finance", key: "nav.finance", icon: Wallet },
  { href: "/settings", key: "nav.settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800/80 bg-slate-950">
      <div className="flex h-16 items-center border-b border-slate-800/80 px-6">
        <NexumLogo size="sm" variant="light" />
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, key, icon: Icon }) => {
          const isActive =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <p className="text-xs text-slate-500">
          {t("nav.version")} {APP_VERSION}
        </p>
      </div>
    </aside>
  );
}
