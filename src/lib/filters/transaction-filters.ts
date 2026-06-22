import type { FinanceTransaction } from "@/types/database";
import {
  endOfMonth,
  endOfYear,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
} from "date-fns";

export type TransactionTypeFilter = "all" | "income" | "expense";
export type TransactionPeriodFilter = "all" | "this_month" | "last_month" | "this_year";

export type TransactionFilters = {
  type: TransactionTypeFilter;
  category: string;
  period: TransactionPeriodFilter;
  search: string;
};

export const defaultTransactionFilters: TransactionFilters = {
  type: "all",
  category: "all",
  period: "all",
  search: "",
};

function inPeriod(dateStr: string, period: TransactionPeriodFilter): boolean {
  if (period === "all") return true;
  const date = parseISO(dateStr);
  const now = new Date();

  if (period === "this_month") {
    return date >= startOfMonth(now) && date <= endOfMonth(now);
  }
  if (period === "last_month") {
    const last = subMonths(now, 1);
    return date >= startOfMonth(last) && date <= endOfMonth(last);
  }
  if (period === "this_year") {
    return date >= startOfYear(now) && date <= endOfYear(now);
  }
  return true;
}

export function filterTransactions(
  transactions: FinanceTransaction[],
  filters: TransactionFilters
): FinanceTransaction[] {
  const q = filters.search.trim().toLowerCase();

  return transactions.filter((tx) => {
    if (filters.type !== "all" && tx.type !== filters.type) return false;
    if (filters.category !== "all" && (tx.category ?? "") !== filters.category) return false;
    if (!inPeriod(tx.transaction_date, filters.period)) return false;

    if (q) {
      const haystack = `${tx.description ?? ""} ${tx.category ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

export function getTransactionCategories(transactions: FinanceTransaction[]): string[] {
  const set = new Set<string>();
  for (const tx of transactions) {
    if (tx.category) set.add(tx.category);
  }
  return [...set].sort();
}

export function getMonthStart(): string {
  return format(startOfMonth(new Date()), "yyyy-MM-01");
}
