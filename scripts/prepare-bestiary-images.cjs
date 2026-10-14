const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  sharp = require("sharp");
const sources = require("../data/bestiary-images.json");
const root = path.resolve(__dirname, ".."),
  work = path.join(root, "data/local/bestiary-images");
const hash = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
sharp.concurrency(1);
async function atomic(file, value) {
  await fs.writeFile(file + ".tmp", JSON.stringify(value, null, 2) + "\n");
  await fs.rename(file + ".tmp", file);
}
async function retry(fn) {
  for (let i = 0; i < 4; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 3) throw e;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
(async () => {
  await fs.mkdir(work, { recursive: true });
  const entries = Object.entries(sources).filter(([, url]) => url),
    assets = {};
  let next = 0,
    done = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < entries.length) {
        const [index, url] = entries[next++];
        if (
          !/^[a-z0-9-]+$/.test(index) ||
          !/^https:\/\/www\.dnd5eapi\.co\/api\/images\/monsters\/[a-zA-Z0-9_.-]+$/.test(
            url,
          )
        )
          throw Error("Invalid source");
        const originalFile = path.join(work, index + ".original");
        let bytes;
        try {
          bytes = await fs.readFile(originalFile);
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
          bytes = await retry(async () => {
            const r = await fetch(url, { signal: AbortSignal.timeout(90000) });
            if (!r.ok || !r.headers.get("content-type")?.startsWith("image/"))
              throw Error(
                "Image download failed: " + index + " HTTP " + r.status,
              );
            const b = Buffer.from(await r.arrayBuffer());
            await sharp(b, { limitInputPixels: 50000000 }).metadata();
            return b;
          });
          await fs.writeFile(originalFile + ".tmp", bytes);
          await fs.rename(originalFile + ".tmp", originalFile);
        }
        const original = await sharp(bytes).metadata();
        const output = await sharp(bytes, { limitInputPixels: 50000000 })
          .webp({ quality: 85, alphaQuality: 100, effort: 6 })
          .toBuffer();
        const converted = await sharp(output).metadata();
        if (
          original.width !== converted.width ||
          original.height !== converted.height ||
          converted.format !== "webp"
        )
          throw Error("Dimensions changed: " + index);
        const sha256 = hash(output),
          objectKey = "bestiary/" + index + "-" + sha256.slice(0, 16) + ".webp";
        await fs.writeFile(path.join(work, index + ".webp"), output);
        assets[index] = {
          sourceUrl: url,
          sourceSha256: hash(bytes),
          objectKey,
          sha256,
          width: original.width,
          height: original.height,
          originalBytes: bytes.length,
          webpBytes: output.length,
          quality: 85,
        };
        if (++done % 25 === 0 || done === entries.length)
          console.log("Prepared " + done + "/" + entries.length);
      }
    }),
  );
  const totals = Object.values(assets).reduce(
    (t, a) => ({
      originalBytes: t.originalBytes + a.originalBytes,
      webpBytes: t.webpBytes + a.webpBytes,
    }),
    { originalBytes: 0, webpBytes: 0 },
  );
  await atomic(path.join(work, "manifest.json"), {
    version: 1,
    preparedAt: new Date().toISOString(),
    count: done,
    ...totals,
    assets,
  });
  console.log(
    JSON.stringify({
      count: done,
      ...totals,
      reductionPercent: +(
        100 *
        (1 - totals.webpBytes / totals.originalBytes)
      ).toFixed(2),
    }),
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
