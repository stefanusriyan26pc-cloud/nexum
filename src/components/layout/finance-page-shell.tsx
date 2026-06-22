"use client";

import { FinanceTopbar } from "@/components/layout/finance-topbar";
import { Header } from "@/components/layout/header";
import { useProfile } from "@/components/layout/profile-provider";
import { useTranslation } from "@/components/providers/i18n-provider";

export function FinancePageShell({
  action,
  children,
}: {
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  const profile = useProfile();
  const { t } = useTranslation();

  return (
    <>
      <Header title={t("finance.title")} subtitle={t("finance.subtitle")} profile={profile}>
        {action}
      </Header>
      <FinanceTopbar />
      {children}
    </>
  );
}
