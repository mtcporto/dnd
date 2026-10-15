export interface ItemReference {
  index: string;
  name: string;
  url?: string;
  desc?: string[];
  description?: string | string[];
}
export interface Item {
  id: string;
  canonicalName?: string;
  rarityKey?: string;
  kind: "equipment" | "magic";
  index: string;
  name: string;
  url: string;
  desc?: string[];
  description?: string[];
  notes?: string[];
  image?: string;
  equipment_categories?: ItemReference[];
  equipment_category?: ItemReference;
  cost?: { quantity: number; unit: string };
  weight?: number;
  damage?: { damage_dice: string; damage_type: ItemReference };
  two_handed_damage?: { damage_dice: string; damage_type: ItemReference };
  armor_class?: { base: number; dex_bonus: boolean; max_bonus?: number | null };
  range?: { normal: number; long?: number };
  properties?: ItemReference[];
  mastery?: ItemReference;
  str_minimum?: number;
  stealth_disadvantage?: boolean;
  rarity?: { name: string };
  attunement?: boolean | string;
  variant?: boolean;
  variants?: ItemReference[];
  contents?: { item: ItemReference; quantity: number }[];
}
export interface ItemCatalogue {
  edition: string;
  srdVersion: string;
  source: string;
  count: number;
  equipmentCount: number;
  magicCount: number;
  items: Item[];
  categories: (ItemReference & { equipment?: ItemReference[] })[];
  properties: ItemReference[];
  masteries: ItemReference[];
}
export const categoriesOf = (item: Item) =>
  item.equipment_categories ||
  ([item.equipment_category].filter(Boolean) as ItemReference[]);
export const hasCategory = (item: Item, category: string) =>
  categoriesOf(item).some((ref) => ref.index === category);
export const isWeapon = (item: Item) =>
  item.kind === "equipment" && !!item.damage && hasCategory(item, "weapons");
export const isShield = (item: Item) =>
  item.kind === "equipment" && item.index === "shield";
export const isArmor = (item: Item) =>
  item.kind === "equipment" && !!item.armor_class && !isShield(item);
export const isTwoHanded = (item: Item) =>
  item.properties?.some((ref) => ref.index === "two-handed") || false;
export function itemPath(item: Pick<Item, "kind" | "index">) {
  return "/itens/" + item.kind + "/" + encodeURIComponent(item.index);
}
export function itemCostCopper(item: Item) {
  const scale: Record<string, number> = {
    cp: 1,
    sp: 10,
    ep: 50,
    gp: 100,
    pp: 1000,
  };
  return item.cost && scale[item.cost.unit] !== undefined
    ? Math.round(item.cost.quantity * scale[item.cost.unit])
    : undefined;
}
export function filterItems(
  items: Item[],
  query: {
    q?: string;
    kind?: string;
    category?: string;
    rarity?: string;
    page?: string;
  },
  locale: string,
) {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .toLowerCase()
      .trim();
  const q = normalize((query.q || "").slice(0, 120));
  const filtered = items
    .filter(
      (item) =>
        (!q ||
          normalize(item.name).includes(q) ||
          normalize(item.canonicalName || "").includes(q)) &&
        (!query.kind || item.kind === query.kind) &&
        (!query.category || hasCategory(item, query.category)) &&
        (!query.rarity ||
          (item.rarityKey || item.rarity?.name) === query.rarity),
    )
    .sort((a, b) => a.name.localeCompare(b.name, locale));
  const pages = Math.max(1, Math.ceil(filtered.length / 24)),
    raw = Number(query.page),
    page = Math.max(1, Math.min(pages, Number.isSafeInteger(raw) ? raw : 1));
  return {
    items: filtered.slice((page - 1) * 24, page * 24),
    total: filtered.length,
    page,
    pages,
  };
}
