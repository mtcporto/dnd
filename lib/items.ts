import "server-only";
import { cache } from "react";
import { and, eq } from "drizzle-orm";
import original from "@/data/items.json";
import portuguese from "@/data/items.pt.json";
import spanish from "@/data/items.es.json";
import imageAssets from "@/data/item-image-assets.json";
import { getDb } from "@/lib/db";
import { getLocale } from "@/lib/i18n/server";
import { itemCatalogues } from "@/server/db/schema";
import type { ItemCatalogue } from "@/domain/items";
export const canonicalItems = original as unknown as ItemCatalogue;
const originals = new Map(canonicalItems.items.map((item) => [item.id, item]));
function presented(catalogue: ItemCatalogue): ItemCatalogue {
  return {
    ...catalogue,
    items: catalogue.items.map((item) => ({
      ...item,
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
  if (process.env.TURSO_DATABASE_URL) {
    try {
      const [row] = await getDb()
        .select({ payload: itemCatalogues.payload })
        .from(itemCatalogues)
        .where(
          and(
            eq(itemCatalogues.edition, "2024"),
            eq(itemCatalogues.locale, locale),
          ),
        );
      if (row?.payload.items.length === original.count)
        return presented(row.payload);
    } catch {
      console.warn("Item catalogue database unavailable; using packaged data.");
    }
  }
  return presented(
    (locale === "pt"
      ? portuguese
      : locale === "es"
        ? spanish
        : original) as unknown as ItemCatalogue,
  );
});
