"use client";

import { Header } from "@/components/layout/header";
import { useProfile } from "@/components/layout/profile-provider";
import { useTranslation } from "@/components/providers/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupiah } from "@/lib/currency";
import { totalWalletBalance } from "@/lib/finance/wallets";
import { createClient } from "@/lib/supabase/client";
import type {
  CalendarEvent,
  FinanceTransaction,
  Task,
  Wallet as WalletRecord,
} from "@/types/database";
import { format, isToday, isTomorrow, parseISO } from "date-fns";
import {
  CalendarDays,
  CheckSquare,
  Landmark,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const profile = useProfile();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [transactions, setTransactions] = useState<FinanceTransaction[]>([]);
  const [wallets, setWallets] = useState<WalletRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const now = new Date();
      const monthStart = format(now, "yyyy-MM-01");

      const [tasksRes, eventsRes, txRes, walletRes] = await Promise.all([
        supabase
          .from("tasks")
          .select("*")
          .neq("status", "done")
          .order("due_date", { ascending: true, nullsFirst: false })
          .limit(5),
        supabase
          .from("calendar_events")
          .select("*")
          .gte("start_at", now.toISOString())
          .order("start_at", { ascending: true })
          .limit(5),
        supabase
          .from("finance_transactions")
          .select("*")
          .gte("transaction_date", monthStart)
          .order("transaction_date", { ascending: false }),
        supabase.from("wallets").select("*"),
      ]);

      setTasks(tasksRes.data ?? []);
      setEvents(eventsRes.data ?? []);
      setTransactions(txRes.data ?? []);
      setWallets(walletRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalBalance = totalWalletBalance(wallets);

  const formatDue = (date: string | null) => {
    if (!date) return null;
    const d = parseISO(date);
    if (isToday(d)) return t("common.today");
    if (isTomorrow(d)) return t("common.tomorrow");
    return format(d, "MMM d");
  };

  const priorityVariant = {
    low: "default" as const,
    medium: "warning" as const,
    high: "danger" as const,
  };

  return (
    <>
      <Header
        title={t("dashboard.title")}
        subtitle={`${t("dashboard.welcome")}${profile?.full_name ? `, ${profile.full_name.split(" ")[0]}` : ""}!`}
        profile={profile}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            ))}
          </div>
        ) : (
          <>
            <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <StatCard
                icon={TrendingUp}
                label={t("dashboard.incomeMonth")}
                value={formatRupiah(income)}
                color="text-emerald-600 dark:text-emerald-400"
                bg="bg-emerald-50 dark:bg-emerald-950/40"
              />
              <StatCard
                icon={TrendingDown}
                label={t("dashboard.expensesMonth")}
                value={formatRupiah(expense)}
                color="text-red-600 dark:text-red-400"
                bg="bg-red-50 dark:bg-red-950/40"
              />
              <StatCard
                icon={Landmark}
                label={t("dashboard.totalBalance")}
                value={formatRupiah(totalBalance)}
                color="text-indigo-600 dark:text-indigo-400"
                bg="bg-indigo-50 dark:bg-indigo-950/40"
              />
              <StatCard
                icon={CheckSquare}
                label={t("dashboard.openTasks")}
                value={String(tasks.length)}
                color="text-violet-600 dark:text-violet-400"
                bg="bg-violet-50 dark:bg-violet-950/40"
              />
              <StatCard
                icon={Wallet}
                label={t("dashboard.netBalance")}
                value={formatRupiah(income - expense)}
                color="text-slate-700 dark:text-slate-200"
                bg="bg-slate-100 dark:bg-slate-800"
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.upcomingTasks")}</h2>
                    <Link href="/tasks" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                      {t("common.viewAll")}
                    </Link>
                  </div>
                  {tasks.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t("dashboard.noTasks")}
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tasks.map((task) => (
                        <li key={task.id} className="flex items-center justify-between px-6 py-3">
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{task.title}</p>
                            {task.due_date && (
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {t("tasks.due")} {formatDue(task.due_date)}
                              </p>
                            )}
                          </div>
                          <Badge variant={priorityVariant[task.priority]}>
                            {t(`priority.${task.priority}`)}
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("dashboard.upcomingEvents")}</h2>
                    <Link href="/calendar" className="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                      {t("common.viewAll")}
                    </Link>
                  </div>
                  {events.length === 0 ? (
                    <p className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                      {t("dashboard.noEvents")}
                    </p>
                  ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                      {events.map((event) => (
                        <li key={event.id} className="flex items-center gap-3 px-6 py-3">
                          <div
                            className="h-8 w-1 rounded-full"
                            style={{ backgroundColor: event.color }}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {format(parseISO(event.start_at), "EEE, MMM d · h:mm a")}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { href: "/tasks", icon: CheckSquare, label: t("dashboard.quickAddTask"), desc: t("dashboard.quickAddTaskDesc") },
                { href: "/notes", icon: CalendarDays, label: t("dashboard.quickNewNote"), desc: t("dashboard.quickNewNoteDesc") },
                { href: "/calendar", icon: CalendarDays, label: t("dashboard.quickSchedule"), desc: t("dashboard.quickScheduleDesc") },
                { href: "/finance/income", icon: Wallet, label: t("dashboard.quickTransaction"), desc: t("dashboard.quickTransactionDesc") },
              ].map(({ href, icon: Icon, label, desc }) => (
                <Link key={href} href={href}>
                  <Card className="transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
                        <Icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  bg,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
