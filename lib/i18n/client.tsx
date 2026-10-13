"use client";
import { createContext, useContext, useMemo, type ReactNode } from "react";
import { createTranslator, type Dictionary, type Locale } from "./shared";
const Context = createContext<
  ({ locale: Locale } & ReturnType<typeof createTranslator>) | null
>(null);
export function I18nProvider({
  locale,
  dictionary,
  children,
}: {
  locale: Locale;
  dictionary: Dictionary;
  children: ReactNode;
}) {
  const value = useMemo(
    () => ({ locale, ...createTranslator(dictionary) }),
    [locale, dictionary],
  );
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useI18n() {
  const context = useContext(Context);
  if (!context) throw Error("I18nProvider is required");
  return context;
}
