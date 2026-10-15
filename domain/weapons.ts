import {
  isWeapon,
  hasCategory,
  type Item,
  type ItemCatalogue,
} from "./items.ts";
// Base weapon types explicitly listed by the English 2024 API records.
// Magical powers, attunement and attack/damage bonuses are not automated here.
const profiles: Record<string, string[] | "all" | "melee"> = {
  "berserker-axe": ["battleaxe", "greataxe", "halberd"],
  "dagger-of-venom": ["dagger"],
  "dancing-sword": [
    "greatsword",
    "longsword",
    "rapier",
    "scimitar",
    "shortsword",
  ],
  defender: "melee",
  "dragon-slayer": "all",
  "dwarven-thrower": ["warhammer"],
  "flame-tongue": "melee",
  "frost-brand": [
    "glaive",
    "greatsword",
    "longsword",
    "rapier",
    "scimitar",
    "shortsword",
  ],
  "giant-slayer": "all",
  "hammer-of-thunderbolts": ["maul", "warhammer"],
  "holy-avenger": "all",
  "javelin-of-lightning": ["javelin"],
  "luck-blade": [
    "glaive",
    "greatsword",
    "longsword",
    "rapier",
    "scimitar",
    "sickle",
    "shortsword",
  ],
  "mace-of-disruption": ["mace"],
  "mace-of-smiting": ["mace"],
  "mace-of-terror": ["mace"],
  "nine-lives-stealer": "all",
  oathbow: ["longbow", "shortbow"],
  "scimitar-of-speed": ["scimitar"],
  "sun-blade": ["longsword"],
  "sword-of-life-stealing": [
    "glaive",
    "greatsword",
    "longsword",
    "rapier",
    "scimitar",
    "shortsword",
  ],
  "sword-of-sharpness": ["glaive", "greatsword", "longsword", "scimitar"],
  "sword-of-wounding": [
    "glaive",
    "greatsword",
    "longsword",
    "rapier",
    "scimitar",
    "shortsword",
  ],
  "trident-of-fish-command": ["trident"],
  "vicious-weapon": "all",
  "vorpal-sword": ["glaive", "greatsword", "longsword", "scimitar"],
  "weapon-1": "all",
  "weapon-2": "all",
  "weapon-3": "all",
  "weapon-of-warning": "all",
};
export const isMagicWeapon = (item: Item) =>
  item.kind === "magic" && !!profiles[item.index];
export function weaponBases(item: Item, catalogue: ItemCatalogue): Item[] {
  const profile = item.kind === "magic" ? profiles[item.index] : undefined;
  if (!profile) return [];
  return catalogue.items.filter(
    (base) =>
      isWeapon(base) &&
      (profile === "all" ||
        (profile === "melee"
          ? hasCategory(base, "melee-weapons")
          : profile.includes(base.index))),
  );
}
export function resolvedWeapon(
  item: Item,
  baseId: string | undefined,
  catalogue: ItemCatalogue,
): Item | undefined {
  if (isWeapon(item)) return item;
  const bases = weaponBases(item, catalogue);
  const base = baseId
    ? bases.find((b) => b.id === baseId)
    : bases.length === 1
      ? bases[0]
      : undefined;
  return base ? { ...base, id: item.id, name: item.name } : undefined;
}
