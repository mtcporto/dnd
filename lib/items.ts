import "server-only";
import { createHash } from "node:crypto";
import summarySnapshot from "@/data/item-summaries.json";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import original from "@/data/items.json";
import portuguese from "@/data/items.pt.json";
import spanish from "@/data/items.es.json";
import imageAssets from "@/data/item-image-assets.json";
import { getDb } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { itemCatalogues, itemSummaries } from "@/server/db/schema";
import type { ItemCatalogue } from "@/domain/items";
export const canonicalItems = original as unknown as ItemCatalogue;
const catalogueHash = createHash("sha256")
  .update(JSON.stringify(canonicalItems))
  .digest("hex");
const originals = new Map(canonicalItems.items.map((item) => [item.id, item]));
type Summary = { sourceHash: string; effects: string[] };
const canonicalHashes = new Map(
  canonicalItems.items.map((item) => [
    item.id,
    createHash("sha256").update(JSON.stringify(item)).digest("hex"),
  ]),
);
function presented(
  catalogue: ItemCatalogue,
  summaries: Map<string, Summary>,
): ItemCatalogue {
  return {
    ...catalogue,
    items: catalogue.items.map((item) => ({
      ...item,
      effects:
        summaries.get(item.id)?.sourceHash === canonicalHashes.get(item.id)
          ? summaries.get(item.id)?.effects
          : undefined,
      canonicalName: originals.get(item.id)?.name,
      rarityKey: originals.get(item.id)?.rarity?.name,
      image: (imageAssets.assets as Record<string, { publicUrl: string }>)[
        item.id
      ]?.publicUrl,
    })),
  };
}
export const getItems = cache(async (): Promise<ItemCatalogue> => {
  const locale = await getLocale();
  let catalogue = (locale === "pt"
    ? portuguese
    : locale === "es"
      ? spanish
      : original) as unknown as ItemCatalogue;
  const packaged = summarySnapshot.items as Record<
    string,
    { sourceHash: string; en: string[]; pt: string[]; es: string[] }
  >;
  const summaries = new Map<string, Summary>(
    Object.entries(packaged).map(([id, row]) => [
      id,
      { sourceHash: row.sourceHash, effects: row[locale] },
    ]),
  );
  if (process.env.TURSO_DATABASE_URL) {
    const [catalogueResult, summaryResult] = await Promise.allSettled([
      getDb()
        .select({
          payload: itemCatalogues.payload,
          sourceHash: itemCatalogues.sourceHash,
        })
        .from(itemCatalogues)
        .where(
          and(
            eq(itemCatalogues.edition, "2024"),
            eq(itemCatalogues.locale, locale),
          ),
        ),
      getDb()
        .select({
          itemId: itemSummaries.itemId,
          sourceHash: itemSummaries.sourceHash,
          effects: itemSummaries.effects,
        })
        .from(itemSummaries)
        .where(
          and(
            eq(itemSummaries.edition, "2024"),
            eq(itemSummaries.locale, locale),
          ),
        ),
    ]);
    if (catalogueResult.status === "fulfilled") {
      const row = catalogueResult.value[0];
      if (
        row?.payload.items.length === original.count &&
        row.sourceHash === catalogueHash
      )
        catalogue = row.payload;
    } else
      console.warn("Item catalogue database unavailable; using packaged data.");
    if (summaryResult.status === "fulfilled") {
      for (const row of summaryResult.value)
        if (
          row.sourceHash === canonicalHashes.get(row.itemId) &&
          Array.isArray(row.effects) &&
          row.effects.length
        )
          summaries.set(row.itemId, {
            sourceHash: row.sourceHash,
            effects: row.effects,
          });
    } else
      console.warn("Item summary database unavailable; using packaged data.");
  }
  return presented(catalogue, summaries);
});
