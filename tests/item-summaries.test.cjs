const test = require("node:test"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const source = require("../data/items.json"),
  summaries = require("../data/item-summaries.json");
const {
  supportedSummaryNumbers,
} = require("../domain/item-summary-validation.ts");
const { itemEffects } = require("../domain/item-presentation.ts");
const hash = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
const numeric = (text) => (text.match(/\d+(?:[.,]\d+)?/g) || []).sort();
test("all catalogue items have source-bound persisted summaries in three languages", () => {
  assert.equal(summaries.count, source.count);
  assert.equal(Object.keys(summaries.items).length, source.count);
  assert.equal(summaries.sourceHash, hash(source));
  for (const item of source.items) {
    const row = summaries.items[item.id];
    assert(row, item.id);
    assert.equal(row.sourceHash, hash(item), item.id);
    assert(row.model && row.evidence.length === row.en.length, item.id);
    for (const locale of ["en", "pt", "es"]) {
      const lines = row[locale];
      assert(
        Array.isArray(lines) && lines.length > 0 && lines.length <= 10,
        item.id + locale,
      );
      assert.equal(lines.length, row.en.length, item.id + locale);
      assert(
        lines.every(
          (line) =>
            typeof line === "string" && line.trim() && !/[\n|]/.test(line),
        ),
        item.id + locale,
      );
      assert.deepEqual(
        numeric(lines.join(" ")),
        numeric(row.en.join(" ")),
        item.id + locale,
      );
      const dice = (text) =>
        (text.match(/\b\d+d\d+\b/gi) || []).map((s) => s.toLowerCase()).sort();
      assert.deepEqual(
        dice(lines.join(" ")),
        dice(row.en.join(" ")),
        item.id + locale,
      );
      assert.deepEqual(itemEffects({ ...item, effects: lines }), lines);
    }
    if (row.model !== "api-structured-fields") {
      const prose = [
        item.name,
        item.rarity?.name || "",
        ...(item.desc || []),
        ...(item.description || []),
        ...(item.notes || []),
      ]
        .filter(Boolean)
        .join("\n\n")
        .replace(/\s+/g, " ");
      row.evidence.forEach((quote) =>
        assert(prose.includes(quote.replace(/\s+/g, " ")), item.id),
      );
      row.en.forEach((line, i) => {
        const allowed = supportedSummaryNumbers(row.evidence[i]);
        numeric(line).forEach((n) =>
          assert(allowed.has(n), item.id + ": unsupported " + n),
        );
      });
    }
  }
});

test("source number validation accepts written counts without inventing converted units", () => {
  const allowed = supportedSummaryNumbers(
    "Three uses; throw the object up to 20 feet; roll 1d8.",
  );
  assert(
    allowed.has("3") &&
      allowed.has("20") &&
      allowed.has("1") &&
      allowed.has("8"),
  );
  assert(!allowed.has("6.1")); // An unrequested metres conversion is not a source fact.
});
