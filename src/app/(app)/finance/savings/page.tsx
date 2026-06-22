"use client";

import { FinancePageShell } from "@/components/layout/finance-page-shell";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/ui/view-toggle";
import { useTranslation } from "@/components/providers/i18n-provider";
import { formatRupiah, parseRupiahInput } from "@/lib/currency";
import { createClient } from "@/lib/supabase/client";
import type { SavingsGoal } from "@/types/database";
import { format, parseISO } from "date-fns";
import { PiggyBank, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

const COLORS = ["#10b981", "#6366f1", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function SavingsPage() {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [depositModal, setDepositModal] = useState<SavingsGoal | null>(null);
  const [form, setForm] = useState({ name: "", target_amount: "", deadline: "", color: COLORS[0] });
  const [depositAmount, setDepositAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase.from("savings_goals").select("*").order("created_at");
      setGoals(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const handleCreate = async () => {
    const target = parseRupiahInput(form.target_amount);
    if (!form.name.trim() || !target) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data } = await supabase
      .from("savings_goals")
      .insert({
        user_id: user!.id,
        name: form.name,
        target_amount: target,
        deadline: form.deadline || null,
        color: form.color,
      })
      .select()
      .single();

    if (data) setGoals([...goals, data]);
    setSaving(false);
    setModalOpen(false);
    setForm({ name: "", target_amount: "", deadline: "", color: COLORS[0] });
  };

  const handleDeposit = async () => {
    if (!depositModal) return;
    const amount = parseRupiahInput(depositAmount);
    if (!amount) return;
    setSaving(true);
    const supabase = createClient();
    const newAmount = Number(depositModal.current_amount) + amount;
    const { data } = await supabase
      .from("savings_goals")
      .update({ current_amount: newAmount })
      .eq("id", depositModal.id)
      .select()
      .single();
    if (data) setGoals(goals.map((g) => (g.id === data.id ? data : g)));
    setSaving(false);
    setDepositModal(null);
    setDepositAmount("");
  };

  const deleteGoal = async (id: string) => {
    const supabase = createClient();
    await supabase.from("savings_goals").delete().eq("id", id);
    setGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <FinancePageShell
      action={
        <Button onClick={() => setModalOpen(true)} size="sm">
          <Plus className="h-4 w-4" />
          {t("finance.newGoal")}
        </Button>
      }
    >
      <main className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : goals.length === 0 ? (
          <EmptyState
            icon={PiggyBank}
            title="No savings goals"
            description="Create a savings goal to track your progress toward financial targets."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Create Goal
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {goals.map((goal) => {
              const progress = Math.min(
                (Number(goal.current_amount) / Number(goal.target_amount)) * 100,
                100
              );
              return (
                <Card key={goal.id}>
                  <CardContent className="p-5">
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{goal.name}</h3>
                        {goal.deadline && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Target: {format(parseISO(goal.deadline), "MMM d, yyyy")}
                          </p>
                        )}
                      </div>
                      <IconButton
                        icon={Trash2}
                        label={t("common.delete")}
                        onClick={() => deleteGoal(goal.id)}
                        className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      />
                    </div>
                    <div className="mb-2 flex items-end justify-between">
                      <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {formatRupiah(Number(goal.current_amount))}
                      </span>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        of {formatRupiah(Number(goal.target_amount))}
                      </span>
                    </div>
                    <div className="mb-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${progress}%`, backgroundColor: goal.color }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">{progress.toFixed(0)}% complete</span>
                      <IconButton
                        icon={Plus}
                        label={t("finance.addFunds")}
                        variant="outline"
                        onClick={() => setDepositModal(goal)}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Savings Goal">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Goal Name</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Emergency Fund" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Target Amount (IDR)</label>
            <Input value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} placeholder="e.g. 10000000" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Deadline</label>
            <Input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={saving || !form.name.trim()}>
              {saving ? "Creating..." : "Create"}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!depositModal} onClose={() => setDepositModal(null)} title="Add Funds">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Adding to: <strong className="text-slate-900 dark:text-slate-100">{depositModal?.name}</strong>
          </p>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Amount (IDR)</label>
            <Input value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} placeholder="e.g. 500000" />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDepositModal(null)}>Cancel</Button>
            <Button onClick={handleDeposit} disabled={saving || !depositAmount}>
              {saving ? "Saving..." : "Add Funds"}
            </Button>
          </div>
        </div>
      </Modal>
    </FinancePageShell>
  );
}
