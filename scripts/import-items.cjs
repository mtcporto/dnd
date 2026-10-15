const fs = require("node:fs/promises");
const origin = "https://www.dnd5eapi.co";
async function load(url) {
  if (!/^\/api\/2024\/[a-z0-9/()-]+$/.test(url))
    throw Error("Invalid API reference");
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(origin + url, {
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) throw Error("API HTTP " + r.status);
      return await r.json();
    } catch (e) {
      if (i === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
(async () => {
  const kinds = [
    "equipment",
    "magic-items",
    "equipment-categories",
    "weapon-properties",
    "weapon-mastery-properties",
  ];
  const lists = await Promise.all(kinds.map((k) => load("/api/2024/" + k)));
  const tasks = lists.flatMap((list, i) => {
    if (list.count !== list.results.length) throw Error("Incomplete index");
    return list.results.map((ref) => ({ kind: kinds[i], ref }));
  });
  const rows = [];
  let next = 0,
    done = 0;
  await Promise.all(
    Array.from({ length: 5 }, async () => {
      while (next < tasks.length) {
        const { kind, ref } = tasks[next++],
          item = await load(ref.url);
        if (item.index !== ref.index || !item.name) throw Error("Invalid item");
        rows.push({ kind, item });
        if (++done % 60 === 0)
          console.log("Imported " + done + "/" + tasks.length);
      }
    }),
  );
  const group = (kind) =>
    rows
      .filter((r) => r.kind === kind)
      .map((r) => r.item)
      .sort((a, b) => a.index.localeCompare(b.index));
  const equipment = group("equipment"),
    magic = group("magic-items");
  const items = [
    ...equipment.map((item) => ({
      ...item,
      id: "equipment:" + item.index,
      kind: "equipment",
    })),
    ...magic.map((item) => ({
      ...item,
      id: "magic:" + item.index,
      kind: "magic",
    })),
  ];
  const source = {
    edition: "2024",
    srdVersion: "5.2.1",
    source: origin + "/api/2024",
    importedAt: new Date().toISOString(),
    count: items.length,
    equipmentCount: equipment.length,
    magicCount: magic.length,
    items,
    categories: group("equipment-categories"),
    properties: group("weapon-properties"),
    masteries: group("weapon-mastery-properties"),
  };
  await fs.writeFile(
    "data/items.json.tmp",
    JSON.stringify(source, null, 2) + "\n",
  );
  await fs.rename("data/items.json.tmp", "data/items.json");
  console.log("Imported " + items.length + " items.");
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
