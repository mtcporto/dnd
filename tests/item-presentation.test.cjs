const test = require("node:test"),
  assert = require("node:assert/strict");
const {
  itemEffects,
  itemEffectChoices,
  itemDescription,
} = require("../domain/item-presentation.ts");
const original = require("../data/items.json");
const identity = (x) => x;
test("reviewed item effects preserve limits, source numbers and source records", () => {
  const before = JSON.stringify(original);
  const find = (index) => original.items.find((i) => i.index === index);
  const brooch = itemEffects(find("brooch-of-shielding"), identity);
  assert.equal(brooch.length, 2);
  assert(brooch[1].includes("dano da magia"));
  const ammo = itemEffects(find("ammunition-of-slaying"), identity).join(" ");
  assert(
    ammo.includes("6d10") &&
      ammo.includes("17") &&
      ammo.includes("metade") &&
      ammo.includes("não mágica"),
  );
  for (const index of [
    "gauntlets-of-ogre-power",
    "amulet-of-health",
    "headband-of-intellect",
  ]) {
    const effects = itemEffects(find(index), identity);
    assert(effects[0].includes("19"));
    assert(effects[1].includes("19 ou maior"));
  }
  assert.deepEqual(itemEffects(find("longsword"), identity), []);
  assert.equal(itemEffectChoices(find("armor-of-resistance")).length, 10);
  assert.equal(itemEffectChoices(find("ammunition-of-slaying")).length, 14);
  assert(itemDescription(find("armor-of-resistance")).includes("| 1d10 |"));
  assert.equal(JSON.stringify(original), before);
});
