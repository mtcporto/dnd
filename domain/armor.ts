import {
  hasCategory,
  isArmor,
  isShield,
  type Item,
  type ItemCatalogue,
} from "./items.ts";
interface ArmorProfile {
  slot: "armor" | "offHand";
  bonus?: number;
  types?: string[];
  bases?: string[];
  exclude?: string[];
  mithral?: boolean;
  trained?: boolean;
}
// Explicit base models and unconditional AC bonuses from the 2024 API descriptions.
// Conditional effects and attunement-dependent bonuses remain inactive.
const profiles: Record<string, ArmorProfile> = {
  "adamantine-armor": {
    slot: "armor",
    types: ["medium-armor", "heavy-armor"],
    exclude: ["hide-armor"],
  },
  "mithral-armor": {
    slot: "armor",
    types: ["medium-armor", "heavy-armor"],
    exclude: ["hide-armor"],
    mithral: true,
  },
  "armor-1": { slot: "armor", bonus: 1 },
  "armor-2": { slot: "armor", bonus: 2 },
  "armor-3": { slot: "armor", bonus: 3 },
  "armor-of-invulnerability": { slot: "armor", bases: ["plate-armor"] },
  "armor-of-resistance": { slot: "armor" },
  "armor-of-vulnerability": { slot: "armor" },
  "demon-armor": { slot: "armor", bonus: 1 },
  "dragon-scale-mail": { slot: "armor", bases: ["scale-mail"], bonus: 1 },
  "dwarven-plate": {
    slot: "armor",
    bases: ["half-plate-armor", "plate-armor"],
    bonus: 2,
  },
  "elven-chain": {
    slot: "armor",
    bases: ["chain-mail", "chain-shirt"],
    bonus: 1,
    trained: true,
  },
  "glamoured-studded-leather": {
    slot: "armor",
    bases: ["studded-leather-armor"],
    bonus: 1,
  },
  "plate-armor-of-etherealness": {
    slot: "armor",
    bases: ["half-plate-armor", "plate-armor"],
  },
  "shield-1": { slot: "offHand", bonus: 1 },
  "shield-2": { slot: "offHand", bonus: 2 },
  "shield-3": { slot: "offHand", bonus: 3 },
  "animated-shield": { slot: "offHand" },
  "arrow-catching-shield": { slot: "offHand" },
  "shield-of-missile-attraction": { slot: "offHand" },
  "spellguard-shield": { slot: "offHand" },
};
export const magicArmorProfile = (item: Item) =>
  item.kind === "magic" ? profiles[item.index] : undefined;
export function armorBases(item: Item, catalogue: ItemCatalogue): Item[] {
  const profile = magicArmorProfile(item);
  if (!profile) return [];
  return catalogue.items.filter((base) =>
    profile.slot === "offHand"
      ? isShield(base)
      : isArmor(base) &&
        (!profile.types || profile.types.some((t) => hasCategory(base, t))) &&
        (!profile.bases || profile.bases.includes(base.index)) &&
        !profile.exclude?.includes(base.index),
  );
}
export function resolvedArmor(
  item: Item,
  baseId: string | undefined,
  catalogue: ItemCatalogue,
): Item | undefined {
  if (isArmor(item) || isShield(item)) return item;
  const profile = magicArmorProfile(item);
  if (!profile) return undefined;
  const bases = armorBases(item, catalogue);
  const base = baseId
    ? bases.find((i) => i.id === baseId)
    : bases.length === 1
      ? bases[0]
      : undefined;
  if (!base?.armor_class) return undefined;
  return {
    ...base,
    id: item.id,
    name: item.name,
    armor_class: {
      ...base.armor_class,
      base: base.armor_class.base + (item.attunement ? 0 : profile.bonus || 0),
    },
    ...(profile.mithral ? { str_minimum: 0, stealth_disadvantage: false } : {}),
  };
}
