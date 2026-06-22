import type { Task, TaskPriority, TaskStatus } from "@/types/database";
import { isPast, isToday, parseISO, startOfDay } from "date-fns";

export type TaskStatusFilter = "all" | TaskStatus;
export type TaskPriorityFilter = "all" | TaskPriority;
export type TaskDueFilter = "all" | "overdue" | "today" | "upcoming" | "none";

export type TaskFilters = {
  status: TaskStatusFilter;
  priority: TaskPriorityFilter;
  due: TaskDueFilter;
  search: string;
};

export const defaultTaskFilters: TaskFilters = {
  status: "all",
  priority: "all",
  due: "all",
  search: "",
};

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const q = filters.search.trim().toLowerCase();
  const today = startOfDay(new Date());

  return tasks.filter((task) => {
    if (filters.status !== "all" && task.status !== filters.status) return false;
    if (filters.priority !== "all" && task.priority !== filters.priority) return false;

    if (filters.due !== "all") {
      if (!task.due_date) {
        if (filters.due !== "none") return false;
      } else {
        const due = startOfDay(parseISO(task.due_date));
        if (filters.due === "none") return false;
        if (filters.due === "overdue" && (!isPast(due) || isToday(due) || task.status === "done"))
          return false;
        if (filters.due === "today" && !isToday(due)) return false;
        if (filters.due === "upcoming" && (isPast(due) && !isToday(due))) return false;
      }
    }

    if (q) {
      const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}
