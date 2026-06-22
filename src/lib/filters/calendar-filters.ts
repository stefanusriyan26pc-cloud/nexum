import type { CalendarEvent } from "@/types/database";
import { endOfMonth, isSameMonth, parseISO, startOfMonth } from "date-fns";

export type CalendarPeriodFilter = "all" | "upcoming" | "past" | "this_month";

export type CalendarFilters = {
  period: CalendarPeriodFilter;
  search: string;
};

export const defaultCalendarFilters: CalendarFilters = {
  period: "all",
  search: "",
};

export function filterEvents(events: CalendarEvent[], filters: CalendarFilters): CalendarEvent[] {
  const q = filters.search.trim().toLowerCase();
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  return events.filter((event) => {
    const start = parseISO(event.start_at);

    if (filters.period === "upcoming" && start < now) return false;
    if (filters.period === "past" && start >= now) return false;
    if (filters.period === "this_month" && !isSameMonth(start, now)) return false;

    if (q) {
      const haystack = `${event.title} ${event.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
