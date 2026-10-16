const assert = require("node:assert/strict"),
  crypto = require("node:crypto");
const { createClient } = require("@libsql/client");
const {
  databaseFetch,
  readDatabase,
} = require("../domain/database-transport.ts");
const source = require("../data/items.json"),
  snapshot = require("../data/item-summaries.json");
const hash = (value) =>
  crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
(async () => {
  assert.equal(snapshot.count, source.count);
  assert.equal(snapshot.sourceHash, hash(source));
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
    fetch: databaseFetch,
  });
  try {
    const result = await readDatabase(() =>
      db.execute(
        "SELECT locale,item_id,source_hash,effects FROM item_summaries WHERE edition='2024'",
      ),
    );
    assert.equal(result.rows.length, source.count * 3);
    for (const item of source.items)
      for (const locale of ["en", "pt", "es"]) {
        const row = result.rows.find(
          (r) => r.item_id === item.id && r.locale === locale,
        );
        assert(row, item.id + locale);
        assert.equal(row.source_hash, hash(item));
        assert.deepEqual(
          JSON.parse(row.effects),
          snapshot.items[item.id][locale],
        );
      }
    const original = await readDatabase(() =>
      db.execute(
        "SELECT payload FROM item_catalogues WHERE edition='2024' AND locale='en'",
      ),
    );
    assert.deepEqual(JSON.parse(original.rows[0].payload), source);
    console.log(
      "Verified all " +
        source.count +
        " items in three languages (" +
        result.rows.length +
        " Turso summaries), source hashes, saved text and unchanged original API catalogue.",
    );
  } finally {
    db.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
