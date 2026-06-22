"use client";

import { cn } from "@/lib/utils";

type ViewOption<T extends string> = {
  id: T;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function ViewToggle<T extends string>({
  views,
  active,
  onChange,
}: {
  views: ViewOption<T>[];
  active: T;
  onChange: (view: T) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800">
      {views.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-label={label}
          title={label}
          aria-pressed={active === id}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
            active === id
              ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
              : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mb-1 text-sm font-medium text-slate-900 dark:text-slate-100">{title}</h3>
      <p className="mb-4 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>
      {action}
    </div>
  );
}
