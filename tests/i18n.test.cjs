const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
const {
  createTranslator,
  isLocale,
  negotiateLocale,
} = require("../lib/i18n/shared.ts");
const { deriveDraft } = require("../domain/character.ts");
const original = require("../data/catalogue.json"),
  pt = require("../data/catalogue.pt.json"),
  es = require("../data/catalogue.es.json"),
  dictionaries = require("../data/ui-translations.json");
const textFields = new Set([
  "name",
  "desc",
  "description",
  "note",
  "repeatable",
]);
const digits = (text) => (text.match(/\d+(?:\.\d+)?/g) || []).sort();
function compare(source, translated, key, location = "") {
  if (typeof source === "string" && textFields.has(key)) {
    assert.equal(typeof translated, "string", location);
    assert(translated.trim(), location);
    assert.deepEqual(
      digits(translated),
      digits(source),
      location + ": numeric values",
    );
    if (source.length > 50)
      assert.notEqual(
        translated,
        source,
        location + ": untranslated rule text",
      );
  } else if (Array.isArray(source)) {
    assert.equal(translated.length, source.length, location);
    source.forEach((value, i) =>
      compare(value, translated[i], key, location + "[" + i + "]"),
    );
  } else if (source && typeof source === "object") {
    assert.deepEqual(Object.keys(translated), Object.keys(source), location);
    for (const [field, value] of Object.entries(source))
      compare(value, translated[field], field, location + "." + field);
  } else
    assert.deepEqual(translated, source, location + ": canonical rule field");
}
test("all translated catalogues preserve IDs, numbers and every mechanical field", () => {
  compare(original, pt);
  compare(original, es);
});
test("translations never change character calculations or user-authored text", () => {
  const input = {
    name: "Wizard",
    classIndex: "fighter",
    speciesIndex: "dwarf",
    backgroundIndex: "soldier",
    attributes: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 12, CHA: 10 },
    bonusTwo: "STR",
    bonusOne: "CON",
    notes: "Mi historia em português stays as written.",
    proficiencySelections: {
      "class-0": ["skill-perception", "skill-survival"],
      "background-0": ["tool-dice"],
    },
  };
  for (const classIndex of original.classes.map((c) => c.index)) {
    const value = { ...input, classIndex, proficiencySelections: {} };
    const base = deriveDraft(value, original);
    for (const catalogue of [pt, es]) {
      const localized = deriveDraft(value, catalogue);
      for (const key of [
        "input",
        "attributes",
        "modifiers",
        "hitPoints",
        "unarmoredAC",
        "initiative",
        "speed",
        "proficiencyBonus",
      ])
        assert.deepEqual(localized[key], base[key], classIndex + ":" + key);
      assert.deepEqual(
        localized.training.savingThrows,
        base.training.savingThrows,
      );
      assert.deepEqual(
        localized.training.skills.map((s) => [s.index, s.bonus, s.proficient]),
        base.training.skills.map((s) => [s.index, s.bonus, s.proficient]),
      );
    }
  }
});
test("supported languages, placeholders, old saved rule text and dynamic pending choices translate", () => {
  assert(isLocale("en") && isLocale("pt") && isLocale("es"));
  assert(!isLocale("fr") && !isLocale(undefined));
  for (const locale of ["en", "pt", "es"]) {
    const { t, l } = createTranslator(dictionaries[locale]);
    assert.equal(
      t("  Personagens  "),
      "  " + dictionaries[locale].Personagens + "  ",
    );
    assert.equal(
      t("Destacar {0}", ["Wizard"]),
      dictionaries[locale]["Destacar {0}"].replace("{0}", "Wizard"),
    );
    assert(!t("Classe: escolher 2 proficiência(s)").includes("{"));
    if (locale !== "pt")
      assert(!t("Classe: escolher 2 proficiência(s)").includes("escolher"));
    assert.equal(
      l("You have Darkvision with a range of 60 feet."),
      dictionaries[locale]["You have Darkvision with a range of 60 feet."],
    );
  }
});
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? files(path.join(dir, entry.name))
        : [path.join(dir, entry.name)],
    )
    .filter((file) => /\.tsx$/.test(file));
}
test("every literal interface translation has complete dictionary coverage", () => {
  for (const file of [...files("app"), ...files("components")]) {
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    );
    function walk(node) {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === "t" &&
        node.arguments[0] &&
        ts.isStringLiteral(node.arguments[0])
      ) {
        const key = node.arguments[0].text.trim();
        for (const locale of ["en", "pt", "es"])
          assert.equal(
            typeof dictionaries[locale][key],
            "string",
            file + ": missing " + locale + " " + key,
          );
      }
      ts.forEachChild(node, walk);
    }
    walk(source);
  }
});

test("browser language negotiation supports regional variants and weighted preferences", () => {
  for (const [header, expected] of [
    ["pt-BR,pt;q=0.9,en;q=0.8", "pt"],
    ["es-MX,es;q=0.9,en;q=0.8", "es"],
    ["en-GB,en;q=0.9", "en"],
    ["fr-FR,es-ES;q=0.9,pt-BR;q=0.8", "es"],
    ["pt;q=0.2,es;q=0.9,en;q=0.5", "es"],
    ["PT-br; q=0.9,en;q=0.8", "pt"],
    ["pt;q=0,es;q=0.5", "es"],
    ["pt;q=bad,en;q=1", "en"],
    ["fr-FR,de;q=0.8", "en"],
    [null, "en"],
  ])
    assert.equal(negotiateLocale(header), expected);
});
