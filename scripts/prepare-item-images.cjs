const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  sharp = require("sharp");
const root = path.resolve(__dirname, ".."),
  work = path.join(root, "data/local/item-images"),
  source = require("../data/items.json");
const hash = (b) => crypto.createHash("sha256").update(b).digest("hex");
sharp.concurrency(1);
(async () => {
  await fs.mkdir(work, { recursive: true });
  const urls = [...new Set(source.items.map((i) => i.image).filter(Boolean))],
    converted = new Map();
  let next = 0,
    done = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < urls.length) {
        const image = urls[next++];
        if (
          !/^\/api\/images\/[a-zA-Z0-9_/.()-]+$/.test(image) ||
          image.includes("..")
        ) {
          converted.set(image, null);
          done++;
          continue;
        }
        const url = "https://www.dnd5eapi.co" + image,
          originalFile = path.join(work, hash(url) + ".original");
        let bytes;
        try {
          bytes = await fs.readFile(originalFile);
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
          for (let attempt = 0; attempt < 4; attempt++) {
            try {
              const r = await fetch(url, {
                signal: AbortSignal.timeout(60000),
              });
              if (
                r.status >= 400 &&
                r.status < 500 &&
                ![408, 429].includes(r.status)
              ) {
                bytes = null;
                break;
              }
              if (!r.ok || !r.headers.get("content-type")?.startsWith("image/"))
                throw Error("Image HTTP " + r.status);
              bytes = Buffer.from(await r.arrayBuffer());
              await sharp(bytes).metadata();
              await fs.writeFile(originalFile, bytes);
              break;
            } catch (e) {
              if (attempt === 3) throw e;
              await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
            }
          }
        }
        if (bytes) {
          const m = await sharp(bytes).metadata(),
            output = await sharp(bytes)
              .webp({ quality: 85, alphaQuality: 100, effort: 6 })
              .toBuffer(),
            n = await sharp(output).metadata();
          if (m.width !== n.width || m.height !== n.height)
            throw Error("Changed dimensions");
          const sha256 = hash(output),
            localFile = sha256 + ".webp";
          await fs.writeFile(path.join(work, localFile), output);
          converted.set(image, {
            sourceUrl: url,
            sourceSha256: hash(bytes),
            sha256,
            width: m.width,
            height: m.height,
            originalBytes: bytes.length,
            webpBytes: output.length,
            quality: 85,
            localFile,
          });
        } else converted.set(image, null);
        if (++done % 30 === 0 || done === urls.length)
          console.log("Checked item image " + done + "/" + urls.length);
      }
    }),
  );
  const assets = {},
    unavailable = [];
  for (const item of source.items) {
    const a = converted.get(item.image);
    if (a)
      assets[item.id] = {
        ...a,
        objectKey:
          "items/" +
          item.kind +
          "/" +
          item.index.replace(/[^a-z0-9-]/g, "-") +
          "-" +
          a.sha256.slice(0, 16) +
          ".webp",
      };
    else if (item.image) unavailable.push(item.id);
  }
  const entries = Object.values(assets);
  const manifest = {
    version: 1,
    count: entries.length,
    unavailable,
    originalBytes: entries.reduce((s, a) => s + a.originalBytes, 0),
    webpBytes: entries.reduce((s, a) => s + a.webpBytes, 0),
    assets,
  };
  await fs.writeFile(
    path.join(work, "manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n",
  );
  console.log(
    "Prepared " +
      manifest.count +
      " item images; " +
      unavailable.length +
      " unavailable.",
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
