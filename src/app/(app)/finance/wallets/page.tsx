"use client";

import { FinancePageShell } from "@/components/layout/finance-page-shell";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/view-toggle";
import { formatRupiah, parseRupiahInput } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { Wallet } from "@/types/database";
import { Plus, Trash2, Wallet as WalletIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "@/components/providers/i18n-provider";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

export default function WalletsPage() {
  const { t } = useTranslation();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", balance: "", color: COLORS[0] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("wallets").select("*").order("created_at");
      setWallets(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const totalBalance = wallets.reduce((s, w) => s + Number(w.balance), 0);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("wallets")
      .insert({
        user_id: user!.id,
        name: form.name,
        balance: parseRupiahInput(form.balance),
        color: form.color,
      })
      .select()
      .single();

    if (data) setWallets([...wallets, data]);
    setSaving(false);
    setModalOpen(false);
    setForm({ name: "", balance: "", color: COLORS[0] });
  };

  const deleteWallet = async (id: string) => {
    const supabase = createClient();
    await supabase.from("wallets").delete().eq("id", id);
    setWallets(wallets.filter((w) => w.id !== id));
  };

  return (
    <FinancePageShell
      action={
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          {t("finance.newWallet")}
        </Button>
      }
    >
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <Card className="mb-6">
          <CardContent className="p-5">
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("finance.totalBalance")}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{formatRupiah(totalBalance)}</p>
          </CardContent>
        </Card>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : wallets.length === 0 ? (
          <EmptyState
            icon={WalletIcon}
            title="No wallets yet"
            description="Create a wallet to track your balances across accounts."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Wallet
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {wallets.map((wallet) => (
              <Card key={wallet.id} className="overflow-hidden">
                <div className="h-1.5" style={{ backgroundColor: wallet.color }} />
                <CardContent className="p-5">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${wallet.color}20` }}
                      >
                        <WalletIcon className="h-5 w-5" style={{ color: wallet.color }} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{wallet.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{wallet.currency}</p>
                      </div>
                    </div>
                    <IconButton
                      icon={Trash2}
                      label={t("common.delete")}
                      onClick={() => deleteWallet(wallet.id)}
                      className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                    />
                  </div>
                  <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {formatRupiah(Number(wallet.balance))}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Wallet">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Wallet Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. BCA, Cash, GoPay" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Initial Balance (IDR)</label>
            <Input value={form.balance} onChange={(e) => setForm({ ...form, balance: e.target.value })} placeholder="0" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Color</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setForm({ ...form, color: c })}
                  className={`h-7 w-7 rounded-full ${form.color === c ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.name.trim()}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Modal>
    </FinancePageShell>
  );
}
