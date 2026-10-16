import { itemRarity } from "@/domain/item-rarity";
import type { Item } from "@/domain/items";
import { MonsterImage } from "@/components/monster-image";
export function ItemArt({
  image,
  name,
  large = false,
  item,
}: {
  image?: string;
  name: string;
  large?: boolean;
  item?: Item;
}) {
  return (
    <div
      className={large ? "item-art-large" : "item-thumbnail"}
      data-rarity={item ? itemRarity(item) : undefined}
    >
      <MonsterImage
        key={image || name}
        src={image}
        name={name}
        priority={large}
      />
    </div>
  );
}
