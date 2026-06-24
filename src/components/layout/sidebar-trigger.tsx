"use client";

import { useSidebar } from "@/components/layout/sidebar-provider";
import { useTranslation } from "@/components/providers/i18n-provider";
import { IconButton } from "@/components/ui/icon-button";
import { Menu } from "lucide-react";

export function SidebarTrigger() {
  const { isMobile, toggle } = useSidebar();
  const { t } = useTranslation();

  if (!isMobile) {
    return null;
  }

  return (
    <IconButton
      icon={Menu}
      label={t("nav.openMenu")}
      onClick={toggle}
      className="-ml-1 shrink-0"
    />
  );
}
