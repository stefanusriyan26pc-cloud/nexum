import en from "@/locales/en.json";
import id from "@/locales/id.json";

export type Locale = "en" | "id";

export const locales: Locale[] = ["en", "id"];

export const defaultLocale: Locale = "en";

const dictionaries = { en, id } as const;

export type TranslationKey = string;

function getNestedValue(obj: Record<string, unknown>, path: string): string | undefined {
  const keys = path.split(".");
  let current: unknown = obj;
  for (const key of keys) {
    if (current === null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "string" ? current : undefined;
}

export function translate(locale: Locale, key: TranslationKey): string {
  const value = getNestedValue(dictionaries[locale] as Record<string, unknown>, key);
  if (value) return value;
  const fallback = getNestedValue(dictionaries.en as Record<string, unknown>, key);
  return fallback ?? key;
}

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export const LOCALE_STORAGE_KEY = "nexum-locale";
