const test = require("node:test"),
  assert = require("node:assert/strict");
const { itemRarity } = require("../domain/item-rarity.ts");
const source = require("../data/items.json");
test("rarity colors distinguish fixed API variants from multi-rarity families", () => {
  for (const [name, expected] of [
    ["Common", "common"],
    ["Uncommon", "uncommon"],
    ["Rare (+2)", "rare"],
    ["Very Rare (+3)", "very-rare"],
    ["Legendary", "legendary"],
    ["Artifact", "artifact"],
    ["Rarity Varies", "variable"],
    ["Uncommon (+1), Rare (+2), or Very Rare (+3)", "variable"],
    [
      "Rare (Silver or Brass), Very Rare (Bronze), or Legendary (Iron)",
      "variable",
    ],
  ])
    assert.equal(itemRarity({ kind: "magic", rarity: { name } }), expected);
  assert.equal(itemRarity({ kind: "equipment" }), "common");
  assert.equal(itemRarity({ kind: "magic" }), "variable");
});
test("canonical rarity produces the same colors in Portuguese and Spanish", () => {
  for (const locale of ["pt", "es"]) {
    const translated = require("../data/items." + locale + ".json");
    for (const original of source.items) {
      const item = translated.items.find((i) => i.id === original.id);
      assert.equal(
        itemRarity({ ...item, rarityKey: original.rarity?.name }),
        itemRarity(original),
        original.id,
      );
    }
  }
});
