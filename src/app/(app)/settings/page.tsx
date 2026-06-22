"use client";

import { Header } from "@/components/layout/header";
import { useProfile } from "@/components/layout/profile-provider";
import { useTranslation } from "@/components/providers/i18n-provider";
import { ThemeToggle } from "@/components/settings/theme-toggle";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select } from "@/components/ui/input";
import { useCurrencyPreference } from "@/hooks/use-currency-preference";
import { useLocalePreference } from "@/hooks/use-locale-preference";
import { type Locale } from "@/lib/i18n";
import { Bell, Globe, Moon, Shield } from "lucide-react";

export default function SettingsPage() {
  const profile = useProfile();
  const { t } = useTranslation();
  const { locale, changeLocale } = useLocalePreference();
  const { currency, changeCurrency } = useCurrencyPreference();

  return (
    <>
      <Header title={t("settings.title")} subtitle={t("settings.subtitle")} profile={profile} />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("settings.regional")}</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("settings.currencyLabel")}
                </label>
                <Select
                  value={currency}
                  onChange={(e) => changeCurrency(e.target.value)}
                >
                  <option value="IDR">{t("settings.currencyIdr")}</option>
                </Select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{t("settings.currencyHint")}</p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {t("language.title")}
                </label>
                <Select
                  value={locale}
                  onChange={(e) => changeLocale(e.target.value as Locale)}
                >
                  <option value="en">{t("language.en")}</option>
                  <option value="id">{t("language.id")}</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Moon className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("theme.title")}</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("theme.description")}</p>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("settings.notifications")}</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("common.comingSoon")}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">{t("settings.security")}</h2>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t("settings.securityHint")}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
