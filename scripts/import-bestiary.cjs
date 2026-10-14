const fs = require("node:fs/promises");
const origin = "https://www.dnd5eapi.co";
async function load(url) {
  if (!url.startsWith("/api/2024/monsters"))
    throw Error("Unsupported bestiary path");
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const r = await fetch(origin + url, {
        signal: AbortSignal.timeout(30000),
      });
      if (!r.ok) throw Error("API HTTP " + r.status);
      return await r.json();
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
}
(async () => {
  const list = await load("/api/2024/monsters");
  if (!Array.isArray(list.results) || list.count !== list.results.length)
    throw Error("Incomplete index");
  const monsters = new Array(list.count);
  let next = 0,
    completed = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < list.count) {
        const i = next++,
          ref = list.results[i],
          m = await load(ref.url);
        if (
          m.index !== ref.index ||
          !Number.isFinite(m.hit_points) ||
          !Number.isFinite(m.challenge_rating)
        )
          throw Error("Invalid monster: " + ref.index);
        monsters[i] = m;
        if (++completed % 40 === 0)
          console.log("Imported", completed + "/" + list.count);
      }
    }),
  );
  if (new Set(monsters.map((m) => m.index)).size !== list.count)
    throw Error("Duplicate monsters");
  const data = {
    edition: "2024",
    srdVersion: "5.2.1",
    source: origin + "/api/2024/monsters",
    importedAt: new Date().toISOString(),
    count: list.count,
    monsters,
  };
  await fs.writeFile(
    "data/bestiary.json.tmp",
    JSON.stringify(data, null, 2) + "\n",
  );
  await fs.rename("data/bestiary.json.tmp", "data/bestiary.json");
  console.log("Imported all", list.count, "original English monster records.");
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
