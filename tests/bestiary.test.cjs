const test = require("node:test");
const assert = require("node:assert/strict");
const source = require("../data/bestiary.json");
const images = require("../data/bestiary-images.json");
const {
  filterMonsters,
  queryHref,
  challengeLabel,
} = require("../domain/monster.ts");
const localized = {
  en: source,
  pt: require("../data/bestiary.pt.json"),
  es: require("../data/bestiary.es.json"),
};
const summaries = (locale) =>
  localized[locale].monsters.map((m, i) => ({
    index: m.index,
    name: m.name,
    canonicalName: source.monsters[i].name,
    type: m.type,
    size: m.size,
    challengeRating: m.challenge_rating,
  }));
function rulesOnly(value, key = "") {
  if (["name", "desc", "description", "repeatable", "note"].includes(key))
    return undefined;
  if (Array.isArray(value)) return value.map((v) => rulesOnly(v));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([k]) =>
            !["name", "desc", "description", "repeatable", "note"].includes(k),
        )
        .map(([k, v]) => [k, rulesOnly(v, k)]),
    );
  return value;
}
test("all 341 unique 2024 creatures retain their original rules in every language", () => {
  assert.equal(source.edition, "2024");
  assert.equal(source.count, 341);
  assert.equal(source.monsters.length, 341);
  assert.equal(new Set(source.monsters.map((m) => m.index)).size, 341);
  for (const [locale, snapshot] of Object.entries(localized)) {
    assert.equal(snapshot.monsters.length, 341);
    for (const [i, m] of snapshot.monsters.entries()) {
      assert.deepEqual(
        rulesOnly(m),
        rulesOnly(source.monsters[i]),
        locale + " " + m.index,
      );
      assert(m.name.trim());
      assert(m.url.startsWith("/api/2024/monsters/"));
      for (const k of [
        "strength",
        "dexterity",
        "constitution",
        "intelligence",
        "wisdom",
        "charisma",
        "hit_points",
        "challenge_rating",
        "proficiency_bonus",
      ])
        assert(Number.isFinite(m[k]));
    }
  }
});
test("translated rule descriptions preserve every numeric token", () => {
  const numbers = (text) => (text.match(/\d+(?:\.\d+)?/g) || []).sort();
  function check(original, translated, key = "") {
    if (
      typeof original === "string" &&
      ["name", "desc", "description", "repeatable", "note"].includes(key)
    ) {
      assert.deepEqual(numbers(translated), numbers(original));
    } else if (Array.isArray(original))
      original.forEach((value, index) => check(value, translated[index], key));
    else if (original && typeof original === "object")
      for (const [field, value] of Object.entries(original))
        check(value, translated[field], field);
  }
  for (const locale of ["pt", "es"])
    check(source.monsters, localized[locale].monsters);
});

test("pagination makes all creatures reachable without duplicates; CR 0 and fractions filter correctly", () => {
  const items = summaries("en");
  const first = filterMonsters(items, {}, "en");
  assert.equal(first.total, 341);
  assert.equal(first.pages, 15);
  const visited = Array.from(
    { length: first.pages },
    (_, i) => filterMonsters(items, { page: String(i + 1) }, "en").entries,
  ).flat();
  assert.equal(visited.length, 341);
  assert.equal(new Set(visited.map((m) => m.index)).size, 341);
  for (const cr of ["0", "0.125", "0.25", "0.5"]) {
    const result = filterMonsters(items, { cr }, "en");
    assert(result.total > 0);
    assert(result.entries.every((m) => m.challengeRating === Number(cr)));
  }
  assert.equal(challengeLabel(0.125), "1/8");
  assert.equal(challengeLabel(0.25), "1/4");
  assert.equal(challengeLabel(0.5), "1/2");
  assert.equal(filterMonsters(items, { page: "Infinity" }, "en").page, 1);
  assert.equal(filterMonsters(items, { page: "-1" }, "en").page, 1);
  assert.equal(filterMonsters(items, { page: "999" }, "en").page, 15);
});
test("localized and English names are searchable, filters combine, and sorting respects CR", () => {
  for (const locale of ["pt", "es"]) {
    const items = summaries(locale),
      dragon = items.find((m) => m.index === "adult-red-dragon");
    assert(dragon);
    for (const q of [
      dragon.name.toUpperCase(),
      dragon.name.normalize("NFD").replace(/\p{Diacritic}/gu, ""),
      dragon.canonicalName,
    ])
      assert(
        filterMonsters(items, { q }, locale).entries.some(
          (m) => m.index === dragon.index,
        ),
      );
    const result = filterMonsters(
      items,
      { type: "dragon", size: "Huge", cr: "17" },
      locale,
    );
    assert(result.entries.some((m) => m.index === dragon.index));
    assert(
      result.entries.every(
        (m) =>
          m.type === "dragon" && m.size === "Huge" && m.challengeRating === 17,
      ),
    );
    for (const sort of ["cr-asc", "cr-desc"]) {
      const rows = filterMonsters(items, { sort }, locale).entries;
      assert(
        rows.every(
          (m, i) =>
            i === 0 ||
            (sort === "cr-asc"
              ? m.challengeRating >= rows[i - 1].challengeRating
              : m.challengeRating <= rows[i - 1].challengeRating),
        ),
      );
    }
  }
  assert.equal(
    filterMonsters(summaries("en"), { q: "no-matching-monster-xyz" }, "en")
      .total,
    0,
  );
  assert(
    queryHref({ q: "a&size=Huge", page: "2" }).startsWith(
      "/bestiario?q=a%26size%3DHuge&page=2",
    ),
  );
});
test("images only use audited API URLs, retaining a neutral fallback when absent", () => {
  assert.equal(Object.keys(images).length, 341);
  let available = 0;
  for (const m of source.monsters) {
    assert(Object.hasOwn(images, m.index));
    if (images[m.index]) {
      available++;
      assert.match(
        images[m.index],
        /^https:\/\/www\.dnd5eapi\.co\/api\/images\/monsters\/[a-zA-Z0-9_.-]+$/,
      );
    } else assert.equal(images[m.index], null);
  }
  assert.equal(available, 294);
});
