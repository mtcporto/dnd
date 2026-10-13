import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import dictionaries from "@/data/ui-translations.json";
import {
  createTranslator,
  isLocale,
  negotiateLocale,
  type Dictionary,
  type Locale,
} from "./shared";
export const getLocale = cache(async (): Promise<Locale> => {
  const value = (await cookies()).get("dnd-locale")?.value;
  if (isLocale(value)) return value;
  return negotiateLocale((await headers()).get("accept-language"));
});
export const getI18n = cache(async () => {
  const locale = await getLocale();
  const dictionary: Dictionary = dictionaries[locale];
  return { locale, dictionary, ...createTranslator(dictionary) };
});
