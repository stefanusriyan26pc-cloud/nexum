"use client";

import { Header } from "@/components/layout/header";
import { useProfile } from "@/components/layout/profile-provider";
import { TaskCalendar } from "@/components/tasks/task-calendar";
import { TaskKanban } from "@/components/tasks/task-kanban";
import { TaskList } from "@/components/tasks/task-list";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { EmptyState, ViewToggle } from "@/components/ui/view-toggle";
import { FilterBar } from "@/components/ui/filter-bar";
import { useTranslation } from "@/components/providers/i18n-provider";
import {
  defaultTaskFilters,
  filterTasks,
  type TaskDueFilter,
  type TaskPriorityFilter,
  type TaskStatusFilter,
} from "@/lib/filters/task-filters";
import { createClient } from "@/lib/supabase/client";
import type { Task, TaskPriority, TaskStatus } from "@/types/database";
import { CheckSquare, CalendarDays, LayoutGrid, List, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type View = "kanban" | "list" | "calendar";

const emptyForm = {
  title: "",
  description: "",
  status: "todo" as TaskStatus,
  priority: "medium" as TaskPriority,
  due_date: "",
};

export default function TasksPage() {
  const profile = useProfile();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<View>("kanban");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(defaultTaskFilters.status);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>(defaultTaskFilters.priority);
  const [dueFilter, setDueFilter] = useState<TaskDueFilter>(defaultTaskFilters.due);
  const [search, setSearch] = useState("");

  const filteredTasks = useMemo(
    () =>
      filterTasks(tasks, {
        status: statusFilter,
        priority: priorityFilter,
        due: dueFilter,
        search,
      }),
    [tasks, statusFilter, priorityFilter, dueFilter, search]
  );

  const showFilters = view === "kanban" || view === "list";
  const displayTasks = showFilters ? filteredTasks : tasks;

  const loadTasks = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .order("position", { ascending: true });
    setTasks(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const openCreate = () => {
    setEditingTask(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      due_date: task.due_date ?? "",
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (editingTask) {
      const { data } = await supabase
        .from("tasks")
        .update({
          title: form.title,
          description: form.description || null,
          status: form.status,
          priority: form.priority,
          due_date: form.due_date || null,
        })
        .eq("id", editingTask.id)
        .select()
        .single();
      if (data) setTasks(tasks.map((t) => (t.id === data.id ? data : t)));
    } else {
      const { data } = await supabase
        .from("tasks")
        .insert({
          user_id: user!.id,
          title: form.title,
          description: form.description || null,
          status: form.status,
          priority: form.priority,
          due_date: form.due_date || null,
          position: tasks.length,
        })
        .select()
        .single();
      if (data) setTasks([...tasks, data]);
    }

    setSaving(false);
    setModalOpen(false);
  };

  const handleDelete = async () => {
    if (!editingTask) return;
    const supabase = createClient();
    await supabase.from("tasks").delete().eq("id", editingTask.id);
    setTasks(tasks.filter((t) => t.id !== editingTask.id));
    setModalOpen(false);
  };

  return (
    <>
      <Header title={t("tasks.title")} subtitle={t("tasks.subtitle")} profile={profile}>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4" />
          {t("tasks.newTask")}
        </Button>
      </Header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="mb-6 space-y-4">
          <ViewToggle
            views={[
              { id: "kanban" as View, label: t("tasks.kanban"), icon: LayoutGrid },
              { id: "list" as View, label: t("tasks.list"), icon: List },
              { id: "calendar" as View, label: t("tasks.calendar"), icon: CalendarDays },
            ]}
            active={view}
            onChange={setView}
          />
          {showFilters && (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <FilterBar
                filters={[
                  {
                    id: "status",
                    label: t("filters.status"),
                    value: statusFilter,
                    onChange: (v) => setStatusFilter(v as TaskStatusFilter),
                    options: [
                      { value: "all", label: t("filters.all") },
                      { value: "todo", label: t("tasks.statusTodo") },
                      { value: "in_progress", label: t("tasks.statusInProgress") },
                      { value: "done", label: t("tasks.statusDone") },
                    ],
                  },
                  {
                    id: "priority",
                    label: t("filters.priority"),
                    value: priorityFilter,
                    onChange: (v) => setPriorityFilter(v as TaskPriorityFilter),
                    options: [
                      { value: "all", label: t("filters.all") },
                      { value: "low", label: t("tasks.priorityLow") },
                      { value: "medium", label: t("tasks.priorityMedium") },
                      { value: "high", label: t("tasks.priorityHigh") },
                    ],
                  },
                  {
                    id: "due",
                    label: t("filters.due"),
                    value: dueFilter,
                    onChange: (v) => setDueFilter(v as TaskDueFilter),
                    options: [
                      { value: "all", label: t("filters.all") },
                      { value: "overdue", label: t("filters.overdue") },
                      { value: "today", label: t("filters.today") },
                      { value: "upcoming", label: t("filters.upcoming") },
                      { value: "none", label: t("filters.noDueDate") },
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
          )}
        </div>

        {loading ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ) : tasks.length === 0 ? (
          <EmptyState
            icon={CheckSquare}
            title={t("tasks.emptyTitle")}
            description={t("tasks.emptyDesc")}
            action={
              <Button onClick={openCreate}>
                <Plus className="h-4 w-4" />
                {t("tasks.createTask")}
              </Button>
            }
          />
        ) : showFilters && displayTasks.length === 0 ? (
          <p className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
            {t("common.noData")}
          </p>
        ) : (
          <>
            {view === "kanban" && (
              <TaskKanban tasks={displayTasks} onUpdate={setTasks} onEdit={openEdit} />
            )}
            {view === "list" && (
              <TaskList tasks={displayTasks} onUpdate={setTasks} onEdit={openEdit} />
            )}
            {view === "calendar" && (
              <TaskCalendar tasks={displayTasks} onEdit={openEdit} />
            )}
          </>
        )}
      </main>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? t("tasks.editTask") : t("tasks.newTask")}
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("tasks.titleLabel")}</label>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("tasks.titleLabel")}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("tasks.descriptionLabel")}</label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("tasks.statusLabel")}</label>
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
              >
                <option value="todo">{t("tasks.statusTodo")}</option>
                <option value="in_progress">{t("tasks.statusInProgress")}</option>
                <option value="done">{t("tasks.statusDone")}</option>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("tasks.priorityLabel")}</label>
              <Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
              >
                <option value="low">{t("tasks.priorityLow")}</option>
                <option value="medium">{t("tasks.priorityMedium")}</option>
                <option value="high">{t("tasks.priorityHigh")}</option>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">{t("tasks.dueDateLabel")}</label>
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between pt-2">
            {editingTask ? (
              <IconButton
                icon={Trash2}
                label={t("common.delete")}
                variant="danger"
                onClick={handleDelete}
              />
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving || !form.title.trim()}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
