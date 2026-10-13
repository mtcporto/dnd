import type { ReactNode } from "react";
export const locales = ["en", "pt", "es"] as const;
export type Locale = (typeof locales)[number];
export type Dictionary = Record<string, string>;
export function isLocale(value: unknown): value is Locale {
  return locales.includes(value as Locale);
}
export function negotiateLocale(acceptLanguage: string | null): Locale {
  const preferences = (acceptLanguage ?? "")
    .split(",")
    .map((entry) => {
      const [tag, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((value) => value.trim().startsWith("q="));
      return {
        locale: tag.toLowerCase().split("-")[0],
        quality: quality ? Number(quality.trim().slice(2)) : 1,
      };
    })
    .filter(
      (entry) =>
        Number.isFinite(entry.quality) &&
        entry.quality > 0 &&
        entry.quality <= 1,
    )
    .sort((a, b) => b.quality - a.quality);
  return (
    (preferences.find((entry) => isLocale(entry.locale))?.locale as Locale) ??
    "en"
  );
}
export function createTranslator(dictionary: Dictionary) {
  const patterns = Object.entries(dictionary)
    .filter(([key]) => /\{\d+\}/.test(key))
    .map(([key, value]) => {
      const slots: string[] = [];
      const escaped = key
        .split(/(\{\d+\})/)
        .map((part) => {
          if (/^\{\d+\}$/.test(part)) {
            slots.push(part);
            return "(.+?)";
          }
          return part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        })
        .join("");
      return { regex: new RegExp(`^${escaped}$`), slots, value };
    });
  function t(text: string, params: unknown[] = []): string {
    if (!text.trim()) return text;
    const key = text.trim();
    let translated = dictionary[key];
    if (translated === undefined) {
      for (const pattern of patterns) {
        const match = key.match(pattern.regex);
        if (match) {
          translated = pattern.value;
          pattern.slots.forEach((slot, i) => {
            translated = translated.replaceAll(
              slot,
              dictionary[match[i + 1]] ?? match[i + 1],
            );
          });
          break;
        }
      }
    }
    if (translated === undefined && text.includes("\n\n"))
      return text
        .split("\n\n")
        .map((value) => t(value))
        .join("\n\n");
    translated ??= key;
    params.forEach((value, i) => {
      translated = translated.replaceAll(`{${i}}`, String(value));
    });
    return (
      (text.match(/^\s*/)?.[0] ?? "") +
      translated +
      (text.match(/\s*$/)?.[0] ?? "")
    );
  }
  function l(value: ReactNode): ReactNode {
    return typeof value === "string"
      ? t(value)
      : Array.isArray(value)
        ? value.map(l)
        : value;
  }
  return { t, l };
}
export function localizeRecord<T>(value: T, t: (text: string) => string): T {
  if (typeof value === "string") return t(value) as T;
  if (Array.isArray(value))
    return value.map((item) => localizeRecord(item, t)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        ["image", "color", "icon"].includes(key)
          ? item
          : localizeRecord(item, t),
      ]),
    ) as T;
  return value;
}
