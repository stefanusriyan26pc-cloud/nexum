"use client";

import { FinancePageShell } from "@/components/layout/finance-page-shell";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Button } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/filter-bar";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  defaultTransactionFilters,
  filterTransactions,
  getTransactionCategories,
  type TransactionPeriodFilter,
  type TransactionTypeFilter,
} from "@/lib/filters/transaction-filters";
import { sumByType } from "@/lib/finance/analytics";
import {
  applyWalletDeltaLocally,
  syncWalletForTransaction,
  transactionWalletDelta,
} from "@/lib/finance/wallets";
import { formatRupiah, parseRupiahInput } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { FinanceTransaction, Wallet } from "@/types/database";
import { format, parseISO } from "date-fns";
import { Plus, Search, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CATEGORIES = {
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  expense: ["Food", "Transport", "Shopping", "Bills", "Health", "Entertainment", "Other"],
};

export default function IncomeExpensePage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense",
    amount: "",
    category: "",
    description: "",
    wallet_id: "",
    transaction_date: format(new Date(), "yyyy-MM-dd"),
  });
  const [saving, setSaving] = useState(false);
  const [typeFilter, setTypeFilter] = useState<TransactionTypeFilter>(defaultTransactionFilters.type);
  const [categoryFilter, setCategoryFilter] = useState(defaultTransactionFilters.category);
  const [periodFilter, setPeriodFilter] = useState<TransactionPeriodFilter>(
    defaultTransactionFilters.period
  );
  const [search, setSearch] = useState("");

  const filteredTransactions = useMemo(
    () =>
      filterTransactions(transactions, {
        type: typeFilter,
        category: categoryFilter,
        period: periodFilter,
        search,
      }),
    [transactions, typeFilter, categoryFilter, periodFilter, search]
  );

  const categories = useMemo(() => getTransactionCategories(transactions), [transactions]);

  const income = sumByType(filteredTransactions, "income");
  const expense = sumByType(filteredTransactions, "expense");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [txRes, walletRes] = await Promise.all([
        supabase
          .from("finance_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("wallets").select("*"),
      ]);
      setTransactions(txRes.data ?? []);
      setWallets(walletRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const handleSave = async () => {
    const amount = parseRupiahInput(form.amount);
    if (!amount) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("finance_transactions")
      .insert({
        user_id: user!.id,
        type: form.type,
        amount,
        category: form.category || null,
        description: form.description || null,
        wallet_id: form.wallet_id || null,
        transaction_date: form.transaction_date,
      })
      .select()
      .single();

    if (data) {
      setTransactions([data, ...transactions]);
      const nextBalance = await syncWalletForTransaction(supabase, data);
      if (data.wallet_id && nextBalance !== null) {
        setWallets(
          wallets.map((wallet) =>
            wallet.id === data.wallet_id ? { ...wallet, balance: nextBalance } : wallet
          )
        );
      }
    }

    setSaving(false);
    setModalOpen(false);
    setForm({
      type: "expense",
      amount: "",
      category: "",
      description: "",
      wallet_id: "",
      transaction_date: format(new Date(), "yyyy-MM-dd"),
    });
  };

  const deleteTx = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    const supabase = createClient();
    const nextBalance = await syncWalletForTransaction(supabase, tx, true);
    await supabase.from("finance_transactions").delete().eq("id", id);

    setTransactions(transactions.filter((t) => t.id !== id));
    if (tx.wallet_id && nextBalance !== null) {
      setWallets(applyWalletDeltaLocally(wallets, tx.wallet_id, transactionWalletDelta(tx, true)));
    }
  };

  return (
    <FinancePageShell
      action={
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          {t("finance.addTransaction")}
        </Button>
      }
    >
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <FilterBar
              filters={[
                {
                  id: "type",
                  label: t("filters.type"),
                  value: typeFilter,
                  onChange: (v) => setTypeFilter(v as TransactionTypeFilter),
                  options: [
                    { value: "all", label: t("filters.all") },
                    { value: "income", label: t("finance.income") },
                    { value: "expense", label: t("finance.expense") },
                  ],
                },
                {
                  id: "category",
                  label: t("filters.category"),
                  value: categoryFilter,
                  onChange: setCategoryFilter,
                  options: [
                    { value: "all", label: t("filters.all") },
                    ...categories.map((c) => ({ value: c, label: c })),
                  ],
                },
                {
                  id: "period",
                  label: t("filters.period"),
                  value: periodFilter,
                  onChange: (v) => setPeriodFilter(v as TransactionPeriodFilter),
                  options: [
                    { value: "all", label: t("filters.all") },
                    { value: "this_month", label: t("filters.thisMonth") },
                    { value: "last_month", label: t("filters.lastMonth") },
                    { value: "this_year", label: t("filters.thisYear") },
                  ],
                },
              ]}
            />
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder={t("filters.search")}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 dark:bg-emerald-950/40">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("finance.totalIncome")}</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">{formatRupiah(income)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 dark:bg-red-950/40">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("finance.totalExpenses")}</p>
                <p className="text-lg font-semibold text-red-600 dark:text-red-400">{formatRupiah(expense)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t("finance.netBalance")}</p>
                <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatRupiah(income - expense)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("finance.recentTransactions")}</h2>
            </div>
            {filteredTransactions.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                {transactions.length === 0 ? t("finance.noTransactions") : t("common.noData")}
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${tx.type === "income" ? "bg-emerald-50 dark:bg-emerald-950/40" : "bg-red-50 dark:bg-red-950/40"}`}>
                        {tx.type === "income" ? (
                          <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {tx.description || tx.category || (tx.type === "income" ? t("finance.income") : t("finance.expense"))}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {format(parseISO(tx.transaction_date), "MMM d, yyyy")}
                          {" · "}
                          {format(parseISO(tx.created_at), "h:mm a")}
                          {tx.category && ` · ${tx.category}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${tx.type === "income" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {tx.type === "income" ? "+" : "-"}{formatRupiah(Number(tx.amount))}
                      </span>
                      <IconButton
                        icon={Trash2}
                        label={t("common.delete")}
                        onClick={() => deleteTx(tx.id)}
                        className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={t("finance.addTransactionTitle")}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {(["income", "expense"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setForm({ ...form, type, category: "" })}
                className={`rounded-lg border py-2 text-sm font-medium capitalize transition-colors ${
                  form.type === type
                    ? type === "income"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Amount (IDR)</label>
            <Input
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="e.g. 500000"
            />
            {form.amount && (
              <p className="mt-1 text-xs text-slate-500">{formatRupiah(parseRupiahInput(form.amount))}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {CATEGORIES[form.type].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
          {wallets.length > 0 && (
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Wallet</label>
              <Select value={form.wallet_id} onChange={(e) => setForm({ ...form, wallet_id: e.target.value })}>
                <option value="">No wallet</option>
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </Select>
            </div>
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
            <Input
              type="date"
              value={form.transaction_date}
              onChange={(e) => setForm({ ...form, transaction_date: e.target.value })}
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.amount}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </Modal>
    </FinancePageShell>
  );
}
