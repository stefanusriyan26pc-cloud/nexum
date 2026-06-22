"use client";

import { Select } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type FilterField = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
};

export function FilterBar({
  filters,
  className,
}: {
  filters: FilterField[];
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)}>
      {filters.map((field) => (
        <div key={field.id} className={cn("min-w-[8.5rem]", field.className)}>
          <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
            {field.label}
          </label>
          <Select value={field.value} onChange={(e) => field.onChange(e.target.value)}>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
      ))}
    </div>
  );
}
