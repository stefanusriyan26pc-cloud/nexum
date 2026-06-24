"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/layout/sidebar-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-[#020617]">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
      </div>
    </SidebarProvider>
  );
}
