import type { Item } from "./items.ts";
export type ItemRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "very-rare"
  | "legendary"
  | "artifact"
  | "variable";
// Use the canonical API label, independent of the selected interface language.
// Families spanning multiple rarities must not inherit the first variant's color.
export function itemRarity(
  item: Pick<Item, "kind" | "rarity" | "rarityKey">,
): ItemRarity {
  const value = (item.rarityKey || item.rarity?.name || "").trim();
  if (!value) return item.kind === "equipment" ? "common" : "variable";
  const match =
    /^(Common|Uncommon|Rare|Very Rare|Legendary|Artifact)(?:\s*\(\+[123]\))?$/i.exec(
      value,
    );
  return match
    ? (match[1].toLowerCase().replace(" ", "-") as ItemRarity)
    : "variable";
}
