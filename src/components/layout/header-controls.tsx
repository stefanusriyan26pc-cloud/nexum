"use client";

import { useLocalePreference } from "@/hooks/use-locale-preference";
import { cn } from "@/lib/utils";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function HeaderControls() {
  const { locale, changeLocale } = useLocalePreference();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (!mounted) {
    return <div className="h-9 w-[7.5rem] rounded-lg bg-slate-100 dark:bg-slate-800" />;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5 dark:border-slate-700 dark:bg-slate-900">
        {(["en", "id"] as const).map((code) => (
          <button
            key={code}
            type="button"
            onClick={() => changeLocale(code)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-semibold uppercase transition-colors",
              locale === code
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {code}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border transition-colors",
          "border-slate-200 bg-slate-50 text-slate-600 hover:bg-white hover:text-slate-900",
          "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
        )}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </div>
  );
}
