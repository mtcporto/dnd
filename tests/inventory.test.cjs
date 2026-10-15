const test = require("node:test"),
  assert = require("node:assert/strict");
const { deriveDraft } = require("../domain/character.ts"),
  {
    emptyInventory,
    inventoryCommandSchema,
    applyInventoryCommand,
    inventoryStats,
  } = require("../domain/inventory.ts");
const catalogue = require("../data/catalogue.json"),
  items = require("../data/items.json");
const input = {
  name: "Inventory test",
  classIndex: "fighter",
  speciesIndex: "dwarf",
  backgroundIndex: "soldier",
  attributes: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 12, CHA: 10 },
  bonusTwo: "STR",
  bonusOne: "CON",
  notes: "",
  proficiencySelections: {
    "class-0": ["skill-perception", "skill-survival"],
    "background-0": ["tool-dice"],
  },
};
const draft = deriveDraft(input, catalogue);
function run(state, command, character = draft, roll = () => 1) {
  return applyInventoryCommand(
    state,
    inventoryCommandSchema.parse({ revision: 0, ...command }),
    character,
    items,
    roll,
  ).state;
}
const add = (state, id, quantity = 1) =>
  run(state, { action: "add", itemId: "equipment:" + id, quantity });
test("inventory keeps coins, health and equipment separate from the saved character draft", () => {
  const before = structuredClone(draft),
    empty = emptyInventory(draft),
    s = run(empty, { action: "wallet", copper: 1234 });
  assert.equal(s.copper, 1234);
  assert.equal(empty.copper, 0);
  assert.deepEqual(draft, before);
  assert.equal(s.currentHP, draft.hitPoints);
  assert.equal(s.entries.length, 0);
});
test("quantities reject forgery, negatives and fractions; last removal unequips and duplicate slots require two copies", () => {
  for (const c of [
    { action: "add", revision: 0, itemId: "equipment:dagger", quantity: -1 },
    {
      action: "quantity",
      revision: 0,
      itemId: "equipment:dagger",
      quantity: 0.5,
    },
    { action: "wallet", revision: 0, copper: NaN },
    { action: "wallet", revision: 0, copper: 1, userId: "other" },
  ])
    assert.equal(inventoryCommandSchema.safeParse(c).success, false);
  let state = add(emptyInventory(draft), "dagger");
  state = run(state, {
    action: "equip",
    itemId: "equipment:dagger",
    slot: "mainHand",
  });
  assert.throws(
    () =>
      run(state, {
        action: "equip",
        itemId: "equipment:dagger",
        slot: "offHand",
      }),
    /duas unidades/,
  );
  state = add(state, "dagger");
  state = run(state, {
    action: "equip",
    itemId: "equipment:dagger",
    slot: "offHand",
  });
  state = run(state, {
    action: "quantity",
    itemId: "equipment:dagger",
    quantity: 1,
  });
  assert(!state.equipment.offHand);
  state = run(state, {
    action: "quantity",
    itemId: "equipment:dagger",
    quantity: 0,
  });
  assert.equal(state.entries.length, 0);
  assert(!state.equipment.mainHand);
  assert.throws(
    () =>
      run(state, { action: "add", itemId: "equipment:forged", quantity: 1 }),
    /não encontrado/,
  );
});
test("armor and shields calculate AC without replacing base defense; shield and two-hand grip conflict", () => {
  let state = emptyInventory(draft);
  for (const id of ["chain-mail", "shield", "longsword", "greatsword"])
    state = add(state, id);
  state = run(state, {
    action: "equip",
    itemId: "equipment:chain-mail",
    slot: "armor",
  });
  state = run(state, {
    action: "equip",
    itemId: "equipment:shield",
    slot: "offHand",
  });
  state = run(state, {
    action: "equip",
    itemId: "equipment:longsword",
    slot: "mainHand",
  });
  assert.equal(inventoryStats(state, draft, items).armorClass, 18);
  assert.equal(inventoryStats(state, draft, items).weapon.attackBonus, 5);
  assert.equal(inventoryStats(state, draft, items).weapon.damageDice, "1d8");
  assert.equal(draft.unarmoredAC, 12);
  assert.throws(
    () =>
      run(state, {
        action: "equip",
        itemId: "equipment:greatsword",
        slot: "mainHand",
      }),
    /Libere/,
  );
  state = run(state, { action: "unequip", slot: "offHand" });
  state = run(state, {
    action: "equip",
    itemId: "equipment:longsword",
    slot: "mainHand",
    grip: "two",
  });
  assert.equal(inventoryStats(state, draft, items).weapon.damageDice, "1d10");
  assert.throws(
    () =>
      run(state, {
        action: "equip",
        itemId: "equipment:shield",
        slot: "offHand",
      }),
    /duas mãos/,
  );
  assert.throws(
    () =>
      run(state, {
        action: "equip",
        itemId: "equipment:chain-mail",
        slot: "mainHand",
      }),
    /espaço/,
  );
});
test("monk shield removes unarmored Wisdom benefit and medium armor retains negative Dexterity", () => {
  const monk = deriveDraft(
    { ...input, classIndex: "monk", proficiencySelections: {} },
    catalogue,
  );
  let state = add(emptyInventory(monk), "shield");
  state = run(
    state,
    { action: "equip", itemId: "equipment:shield", slot: "offHand" },
    monk,
  );
  assert.equal(
    inventoryStats(state, monk, items).armorClass,
    10 + monk.modifiers.DEX + 2,
  );
  assert(inventoryStats(state, monk, items).warnings.length > 0);
  const negative = { ...draft, modifiers: { ...draft.modifiers, DEX: -1 } };
  state = add(emptyInventory(negative), "hide-armor");
  state = run(
    state,
    { action: "equip", itemId: "equipment:hide-armor", slot: "armor" },
    negative,
  );
  assert.equal(inventoryStats(state, negative, items).armorClass, 11);
});
test("healing rolls are server-injected, capped, consume exactly one potion and cannot run at full HP or unconscious", () => {
  let state = add(emptyInventory(draft), "potion-of-healing", 2);
  assert.throws(
    () => run(state, { action: "use", itemId: "equipment:potion-of-healing" }),
    /completos/,
  );
  state = run(state, { action: "health", currentHP: 1 });
  let calls = 0;
  const result = applyInventoryCommand(
    state,
    { action: "use", revision: 0, itemId: "equipment:potion-of-healing" },
    draft,
    items,
    (sides) => {
      assert.equal(sides, 4);
      calls++;
      return 4;
    },
  );
  assert.equal(calls, 2);
  assert.equal(result.state.currentHP, 11);
  assert.equal(result.recovered, 10);
  assert.equal(result.state.entries[0].quantity, 1);
  assert.equal(state.entries[0].quantity, 2);
  const capped = run(
    result.state,
    { action: "use", itemId: "equipment:potion-of-healing" },
    draft,
    () => 4,
  );
  assert.equal(capped.currentHP, draft.hitPoints);
  assert.equal(capped.entries.length, 0);
  state = run(state, { action: "health", currentHP: 0 });
  assert.throws(
    () => run(state, { action: "use", itemId: "equipment:potion-of-healing" }),
    /inconsciente/,
  );
  assert.throws(
    () => run(state, { action: "health", currentHP: draft.hitPoints + 1 }),
    /máximo/,
  );
});
test("catalogue IDs distinguish equipment and magic records and preserve all 2024 source categories", () => {
  assert.equal(items.count, 444);
  assert.equal(items.equipmentCount, 182);
  assert.equal(items.magicCount, 262);
  assert.equal(new Set(items.items.map((i) => i.id)).size, 444);
  assert(items.items.every((i) => i.url.startsWith("/api/2024/")));
  assert(
    items.items.find((i) => i.id === "magic:stone-of-good-luck-(luckstone)"),
  );
});

test("adamantine armor requires a legal base model, equips in armor slot, persists the model and contributes AC and weight", () => {
  let state = run(emptyInventory(draft), {
    action: "add",
    itemId: "magic:adamantine-armor",
    quantity: 1,
  });
  assert.throws(
    () =>
      run(state, {
        action: "equip",
        itemId: "magic:adamantine-armor",
        slot: "armor",
      }),
    /modelo/,
  );
  for (const baseItemId of [
    "equipment:leather-armor",
    "equipment:hide-armor",
    "equipment:longsword",
    "magic:armor-3",
  ])
    assert.throws(
      () =>
        run(state, {
          action: "equip",
          itemId: "magic:adamantine-armor",
          slot: "armor",
          baseItemId,
        }),
      /modelo/,
    );
  state = run(state, {
    action: "equip",
    itemId: "magic:adamantine-armor",
    slot: "armor",
    baseItemId: "equipment:chain-mail",
  });
  assert.equal(state.equipment.armor, "magic:adamantine-armor");
  assert.equal(state.entries[0].baseItemId, "equipment:chain-mail");
  assert.equal(inventoryStats(state, draft, items).armorClass, 16);
  assert.equal(inventoryStats(state, draft, items).weight, 55);
  state = run(state, { action: "unequip", slot: "armor" });
  assert.equal(
    inventoryStats(state, draft, items).armorClass,
    draft.unarmoredAC,
  );
  state = run(state, {
    action: "equip",
    itemId: "magic:adamantine-armor",
    slot: "armor",
  });
  assert.equal(inventoryStats(state, draft, items).armorClass, 16);
});
test("magical armor bonuses use the chosen base and magical shields obey hand occupancy", () => {
  let state = run(emptyInventory(draft), {
    action: "add",
    itemId: "magic:armor-1",
    quantity: 1,
  });
  state = run(state, {
    action: "equip",
    itemId: "magic:armor-1",
    slot: "armor",
    baseItemId: "equipment:plate-armor",
  });
  assert.equal(inventoryStats(state, draft, items).armorClass, 19);
  state = run(state, { action: "add", itemId: "magic:shield-1", quantity: 1 });
  state = run(state, {
    action: "equip",
    itemId: "magic:shield-1",
    slot: "offHand",
  });
  assert.equal(inventoryStats(state, draft, items).armorClass, 22);
  state = add(state, "greatsword");
  assert.throws(
    () =>
      run(state, {
        action: "equip",
        itemId: "equipment:greatsword",
        slot: "mainHand",
      }),
    /Libere/,
  );
});
