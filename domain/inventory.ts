import { z } from "zod";
import type { CharacterDraft } from "./character.ts";
import {
  isArmor,
  isShield,
  isWeapon,
  isTwoHanded,
  hasCategory,
  type Item,
  type ItemCatalogue,
} from "./items.ts";
export interface InventoryState {
  entries: { itemId: string; quantity: number }[];
  equipment: { armor?: string; mainHand?: string; offHand?: string };
  grip: "one" | "two";
  copper: number;
  currentHP: number;
}
export interface InventoryView {
  state: InventoryState;
  revision: number;
}
const itemId = z
  .string()
  .max(120)
  .regex(/^(equipment|magic):[a-z0-9()-]+$/);
const revision = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
export const inventoryCommandSchema = z.discriminatedUnion("action", [
  z
    .object({
      action: z.literal("add"),
      revision,
      itemId,
      quantity: z.number().int().min(1).max(999),
    })
    .strict(),
  z
    .object({
      action: z.literal("quantity"),
      revision,
      itemId,
      quantity: z.number().int().min(0).max(999),
    })
    .strict(),
  z
    .object({
      action: z.literal("equip"),
      revision,
      itemId,
      slot: z.enum(["armor", "mainHand", "offHand"]),
      grip: z.enum(["one", "two"]).default("one"),
    })
    .strict(),
  z
    .object({
      action: z.literal("unequip"),
      revision,
      slot: z.enum(["armor", "mainHand", "offHand"]),
    })
    .strict(),
  z
    .object({
      action: z.literal("wallet"),
      revision,
      copper: z.number().int().min(0).max(1000000000),
    })
    .strict(),
  z
    .object({
      action: z.literal("health"),
      revision,
      currentHP: z.number().int().min(0).max(10000),
    })
    .strict(),
  z.object({ action: z.literal("use"), revision, itemId }).strict(),
]);
export type InventoryCommand = z.infer<typeof inventoryCommandSchema>;
export const emptyInventory = (draft: CharacterDraft): InventoryState => ({
  entries: [],
  equipment: {},
  grip: "one",
  copper: 0,
  currentHP: draft.hitPoints,
});
export function healingDice(
  item: Item,
): { count: number; sides: number; bonus: number } | undefined {
  if (item.kind === "equipment" && item.index === "potion-of-healing")
    return { count: 2, sides: 4, bonus: 2 };
  return undefined;
}
export function inventoryStats(
  state: InventoryState,
  draft: CharacterDraft,
  catalogue: ItemCatalogue,
) {
  const find = (id?: string) => catalogue.items.find((i) => i.id === id);
  const armor = find(state.equipment.armor),
    shield = find(state.equipment.offHand),
    weapon = find(state.equipment.mainHand);
  const shieldBonus =
    shield && isShield(shield) ? shield.armor_class?.base || 2 : 0;
  let ac = draft.unarmoredAC;
  if (armor?.armor_class) {
    const a = armor.armor_class;
    ac =
      a.base +
      (a.dex_bonus
        ? Math.min(draft.modifiers.DEX, a.max_bonus ?? Infinity)
        : 0);
  } else if (shieldBonus && draft.input.classIndex === "monk")
    ac = 10 + draft.modifiers.DEX;
  ac += shieldBonus;
  const weight = state.entries.reduce(
    (sum, e) => sum + (find(e.itemId)?.weight || 0) * e.quantity,
    0,
  );
  const trained = new Set(
    draft.training?.proficiencies.map((p) => p.index) || [],
  );
  const warnings: string[] = [];
  if (armor && !categoriesTraining(armor, trained))
    warnings.push("Sem treinamento para esta armadura.");
  if (shieldBonus && !trained.has("shields"))
    warnings.push("Sem treinamento para escudos.");
  if (armor?.str_minimum && draft.attributes.STR < armor.str_minimum)
    warnings.push("Força insuficiente: deslocamento reduzido em 10 pés.");
  if (armor?.stealth_disadvantage)
    warnings.push("Esta armadura impõe desvantagem em Furtividade.");
  const properties = weapon?.properties?.map((p) => p.index) || [];
  const finesse = properties.includes("finesse");
  const ranged = weapon && hasCategory(weapon, "ranged-weapons");
  const ability = ranged
    ? finesse
      ? Math.max(draft.modifiers.STR, draft.modifiers.DEX)
      : draft.modifiers.DEX
    : finesse
      ? Math.max(draft.modifiers.STR, draft.modifiers.DEX)
      : draft.modifiers.STR;
  const proficient =
    !!weapon &&
    (trained.has(weapon.index) ||
      trained.has(weapon.index + "s") ||
      trained.has("all-weapons") ||
      categoriesTraining(weapon, trained));
  return {
    armorClass: ac,
    weight: Math.round(weight * 100) / 100,
    warnings,
    speed: Math.max(
      0,
      draft.speed -
        (armor?.str_minimum && draft.attributes.STR < armor.str_minimum
          ? 10
          : 0),
    ),
    weapon: weapon
      ? {
          id: weapon.id,
          attackBonus: ability + (proficient ? draft.proficiencyBonus : 0),
          damageDice:
            state.grip === "two" && weapon.two_handed_damage
              ? weapon.two_handed_damage.damage_dice
              : weapon.damage?.damage_dice,
          damageBonus: ability,
          proficient,
        }
      : undefined,
  };
}
function categoriesTraining(item: Item, trained: Set<string>) {
  return (
    (item.equipment_categories || []).some((c) => trained.has(c.index)) ||
    (isArmor(item) && trained.has("all-armor"))
  );
}
export function applyInventoryCommand(
  current: InventoryState,
  command: InventoryCommand,
  draft: CharacterDraft,
  catalogue: ItemCatalogue,
  roll: (sides: number) => number,
) {
  const state: InventoryState = structuredClone(current);
  let recovered: number | undefined;
  const item =
    "itemId" in command
      ? catalogue.items.find((i) => i.id === command.itemId)
      : undefined;
  if ("itemId" in command && !item) throw Error("Item não encontrado.");
  const entry = item
    ? state.entries.find((e) => e.itemId === item.id)
    : undefined;
  if (command.action === "add") {
    if (!entry && state.entries.length >= 250)
      throw Error("O inventário atingiu o limite de itens.");
    if ((entry?.quantity || 0) + command.quantity > 999)
      throw Error("Quantidade acima do limite.");
    if (entry) entry.quantity += command.quantity;
    else state.entries.push({ itemId: item!.id, quantity: command.quantity });
  } else if (command.action === "quantity") {
    if (!entry) throw Error("O item não está no inventário.");
    entry.quantity = command.quantity;
    if (!entry.quantity) {
      state.entries = state.entries.filter((e) => e !== entry);
      for (const slot of ["armor", "mainHand", "offHand"] as const)
        if (state.equipment[slot] === item!.id) delete state.equipment[slot];
    }
    if (
      state.equipment.mainHand === item!.id &&
      state.equipment.offHand === item!.id &&
      command.quantity < 2
    )
      delete state.equipment.offHand;
  } else if (command.action === "equip") {
    if (!entry) throw Error("O item não está no inventário.");
    const valid =
      command.slot === "armor"
        ? isArmor(item!)
        : command.slot === "mainHand"
          ? isWeapon(item!)
          : isShield(item!) || (isWeapon(item!) && !isTwoHanded(item!));
    if (!valid) throw Error("Este item não pode ser equipado nesse espaço.");
    if (command.slot === "mainHand") {
      if (
        command.grip === "two" &&
        !isTwoHanded(item!) &&
        !item!.two_handed_damage
      )
        throw Error("Esta arma não permite empunhadura com duas mãos.");
      const grip = isTwoHanded(item!) ? "two" : command.grip;
      if (grip === "two" && state.equipment.offHand)
        throw Error("Libere a mão secundária antes de usar duas mãos.");
      state.grip = grip;
    }
    if (
      command.slot === "offHand" &&
      state.equipment.mainHand &&
      state.grip === "two"
    )
      throw Error("A arma principal ocupa as duas mãos.");
    const other = command.slot === "mainHand" ? "offHand" : "mainHand";
    if (
      command.slot !== "armor" &&
      state.equipment[other] === item!.id &&
      entry.quantity < 2
    )
      throw Error("Você precisa de duas unidades para ocupar as duas mãos.");
    state.equipment[command.slot] = item!.id;
  } else if (command.action === "unequip") {
    delete state.equipment[command.slot];
    if (command.slot === "mainHand") state.grip = "one";
  } else if (command.action === "wallet") state.copper = command.copper;
  else if (command.action === "health") {
    if (command.currentHP > draft.hitPoints)
      throw Error("Os pontos de vida não podem ultrapassar o máximo.");
    state.currentHP = command.currentHP;
  } else if (command.action === "use") {
    if (!entry) throw Error("O item não está no inventário.");
    const dice = healingDice(item!);
    if (!dice)
      throw Error("O uso automático deste item ainda não está disponível.");
    if (state.currentHP === 0)
      throw Error("Um personagem inconsciente não pode beber a própria poção.");
    if (state.currentHP >= draft.hitPoints)
      throw Error("Os pontos de vida já estão completos.");
    let healing = dice.bonus;
    for (let i = 0; i < dice.count; i++) {
      const value = roll(dice.sides);
      if (!Number.isInteger(value) || value < 1 || value > dice.sides)
        throw Error("Dado inválido.");
      healing += value;
    }
    recovered = Math.min(healing, draft.hitPoints - state.currentHP);
    state.currentHP += recovered;
    if (--entry.quantity === 0)
      state.entries = state.entries.filter((e) => e !== entry);
  }
  if (!state.equipment.mainHand) state.grip = "one";
  return { state, recovered };
}
