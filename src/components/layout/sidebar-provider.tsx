"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SIDEBAR_COLLAPSED_KEY = "nexum-sidebar-collapsed";
const LG_BREAKPOINT = 1024;

type SidebarContextValue = {
  isMobile: boolean;
  isOpen: boolean;
  isCollapsed: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  toggleCollapse: () => void;
};

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored === "true") {
      setIsCollapsed(true);
    }

    const mq = window.matchMedia(`(max-width: ${LG_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (isMobile && isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
    document.body.style.overflow = "";
  }, [isMobile, isOpen]);

  useEffect(() => {
    if (!isMobile) {
      setIsOpen(false);
    }
  }, [isMobile]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((value) => !value), []);
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((value) => {
      const next = !value;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      isMobile,
      isOpen,
      isCollapsed,
      open,
      close,
      toggle,
      toggleCollapse,
    }),
    [isMobile, isOpen, isCollapsed, open, close, toggle, toggleCollapse]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
}
