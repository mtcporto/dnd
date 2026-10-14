import "server-only";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import original from "@/data/bestiary.json";
import portuguese from "@/data/bestiary.pt.json";
import spanish from "@/data/bestiary.es.json";
import labels from "@/data/bestiary-labels.json";
import imageManifest from "@/data/bestiary-images.json";
import { bestiaryEntries } from "@/server/db/schema";
import { getDb } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { createTranslator, type Locale } from "@/lib/i18n/shared";
import type { Bestiary, Monster, MonsterSummary } from "@/domain/monster";
export const bestiarySource = {
  count: original.count,
  edition: original.edition,
  srdVersion: original.srdVersion,
  source: original.source,
};
function packaged(locale: Locale) {
  return (locale === "pt"
    ? portuguese
    : locale === "es"
      ? spanish
      : original) as unknown as Bestiary;
}
export function monsterImage(index: string): string | undefined {
  return (imageManifest as Record<string, string | null>)[index] ?? undefined;
}
export const getBestiaryLabels = cache(async () =>
  createTranslator(labels[await getLocale()]),
);
export const getMonsterSummaries = cache(
  async (): Promise<MonsterSummary[]> => {
    const locale = await getLocale();
    if (process.env.TURSO_DATABASE_URL) {
      try {
        const rows = await getDb()
          .select({
            index: bestiaryEntries.monsterIndex,
            name: bestiaryEntries.name,
            canonicalName: bestiaryEntries.canonicalName,
            type: bestiaryEntries.creatureType,
            size: bestiaryEntries.creatureSize,
            challengeRating: bestiaryEntries.challengeRating,
          })
          .from(bestiaryEntries)
          .where(
            and(
              eq(bestiaryEntries.edition, "2024"),
              eq(bestiaryEntries.locale, locale),
            ),
          );
        if (rows.length === original.count) return rows;
      } catch {
        console.warn(
          "Bestiary database unavailable; using packaged reference data.",
        );
      }
    }
    const names = new Map(original.monsters.map((m) => [m.index, m.name]));
    return packaged(locale).monsters.map((m) => ({
      index: m.index,
      name: m.name,
      canonicalName: names.get(m.index)!,
      type: m.type,
      size: m.size,
      challengeRating: m.challenge_rating,
    }));
  },
);
export const getMonster = cache(
  async (index: string): Promise<Monster | undefined> => {
    // The API index is the allow-list; unknown routes never query user-controlled paths.
    if (!original.monsters.some((m) => m.index === index)) return undefined;
    const locale = await getLocale();
    if (process.env.TURSO_DATABASE_URL) {
      try {
        const [row] = await getDb()
          .select({ payload: bestiaryEntries.payload })
          .from(bestiaryEntries)
          .where(
            and(
              eq(bestiaryEntries.edition, "2024"),
              eq(bestiaryEntries.locale, locale),
              eq(bestiaryEntries.monsterIndex, index),
            ),
          );
        if (row) return row.payload;
      } catch {
        console.warn(
          "Monster database unavailable; using packaged reference data.",
        );
      }
    }
    return packaged(locale).monsters.find((m) => m.index === index);
  },
);
