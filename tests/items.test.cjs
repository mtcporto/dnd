const test = require("node:test"),
  assert = require("node:assert/strict");
const source = require("../data/items.json");
const localized = {
  en: source,
  pt: require("../data/items.pt.json"),
  es: require("../data/items.es.json"),
};
const { filterItems, itemCostCopper } = require("../domain/items.ts");
const textKeys = new Set([
  "name",
  "desc",
  "description",
  "notes",
  "note",
  "repeatable",
]);
function mechanical(v, key = "") {
  if (textKeys.has(key)) return undefined;
  if (Array.isArray(v)) return v.map((x) => mechanical(x));
  if (v && typeof v === "object")
    return Object.fromEntries(
      Object.entries(v)
        .filter(([k]) => !textKeys.has(k))
        .map(([k, x]) => [k, mechanical(x, k)]),
    );
  return v;
}
test("all 444 item records preserve source mechanics, references and numeric text in three languages", () => {
  const numbers = (t) => (t.match(/\d+(?:\.\d+)?/g) || []).sort();
  function check(original, translated, key = "") {
    if (typeof original === "string" && textKeys.has(key)) {
      assert.equal(typeof translated, "string");
      assert.deepEqual(numbers(translated), numbers(original));
      if (original.length > 90) assert.notEqual(translated, original);
    } else if (Array.isArray(original))
      original.forEach((v, i) => check(v, translated[i], key));
    else if (original && typeof original === "object")
      for (const [k, v] of Object.entries(original)) check(v, translated[k], k);
  }
  assert.equal(source.count, 444);
  assert.equal(source.categories.length, 30);
  for (const locale of ["pt", "es"]) {
    assert.deepEqual(mechanical(localized[locale]), mechanical(source));
    check(source, localized[locale]);
  }
});
test("items search supports localized and canonical English names, stable rarity keys and complete pagination", () => {
  for (const locale of ["en", "pt", "es"]) {
    const items = localized[locale].items.map((i, n) => ({
      ...i,
      canonicalName: source.items[n].name,
      rarityKey: source.items[n].rarity?.name,
    }));
    for (const q of [
      "Potion of Healing",
      items.find((i) => i.id === "equipment:potion-of-healing").name,
    ])
      assert(
        filterItems(items, { q }, locale).items.some(
          (i) => i.id === "equipment:potion-of-healing",
        ),
      );
    const rows = Array.from(
      { length: 19 },
      (_, i) => filterItems(items, { page: String(i + 1) }, locale).items,
    ).flat();
    assert.equal(rows.length, 444);
    assert.equal(new Set(rows.map((i) => i.id)).size, 444);
    const magic = filterItems(
      items,
      { kind: "magic", rarity: "Uncommon" },
      locale,
    );
    assert(magic.total > 0);
    assert(magic.items.every((i) => i.rarityKey === "Uncommon"));
  }
  assert.equal(
    itemCostCopper(source.items.find((i) => i.id === "equipment:longsword")),
    1500,
  );
  assert.equal(
    filterItems(source.items, { q: "zzznomatchingitem" }, "en").total,
    0,
  );
});
