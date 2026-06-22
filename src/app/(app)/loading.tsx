"use client";

import { LoadingScreen } from "@/components/ui/loading-screen";
import { useTranslation } from "@/components/providers/i18n-provider";

export default function AppLoading() {
  const { t } = useTranslation();
  return <LoadingScreen label={t("common.loadingWorkspace")} />;
}
