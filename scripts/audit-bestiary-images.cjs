const fs = require("fs");
const source = require("../data/bestiary.json");
(async () => {
  const images = {},
    paths = [...new Set(source.monsters.map((m) => m.image).filter(Boolean))];
  let next = 0,
    checked = 0;
  const valid = new Map();
  await Promise.all(
    Array.from({ length: 6 }, async () => {
      while (next < paths.length) {
        const path = paths[next++];
        let url = null;
        if (/^\/api\/images\/monsters\/[a-zA-Z0-9_.-]+$/.test(path)) {
          for (let attempt = 0; attempt < 3; attempt++) {
            try {
              const r = await fetch("https://www.dnd5eapi.co" + path, {
                method: "HEAD",
                signal: AbortSignal.timeout(20000),
              });
              if (r.ok && r.headers.get("content-type")?.startsWith("image/"))
                url = "https://www.dnd5eapi.co" + path;
              else if (r.status >= 500) throw Error("Image server unavailable");
              break;
            } catch (e) {
              if (attempt === 2) console.log("Image unavailable:", path);
              else await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
            }
          }
        }
        valid.set(path, url);
        if (++checked % 50 === 0)
          console.log("Checked images:", checked + "/" + paths.length);
      }
    }),
  );
  for (const m of source.monsters) images[m.index] = valid.get(m.image) || null;
  fs.writeFileSync(
    "data/bestiary-images.json",
    JSON.stringify(images, null, 2) + "\n",
  );
  console.log(
    "Available API images:",
    Object.values(images).filter(Boolean).length + "/" + source.count,
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
