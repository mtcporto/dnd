const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  sharp = require("sharp");
const root = path.resolve(__dirname, ".."),
  sourceDir = path.join(root, "assets/images"),
  work = path.join(root, "data/local/site-images");
async function files(dir) {
  return (
    await Promise.all(
      (await fs.readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory()
          ? files(path.join(dir, e.name))
          : [path.join(dir, e.name)],
      ),
    )
  ).flat();
}
(async () => {
  await fs.mkdir(work, { recursive: true });
  const assets = {};
  for (const file of await files(sourceDir)) {
    if (!/\.(png|jpe?g|webp|avif)$/i.test(file)) continue;
    const relative = path.relative(sourceDir, file).split(path.sep).join("/");
    if (!/^[a-zA-Z0-9_/-]+\.(png|jpe?g|webp|avif)$/i.test(relative))
      throw Error("Unsupported image filename: " + relative);
    const bytes = await fs.readFile(file),
      original = await sharp(bytes).metadata();
    // Existing WebP artwork keeps its exact bytes; avoid a second lossy conversion.
    const output =
      original.format === "webp"
        ? bytes
        : await sharp(bytes)
            .webp({ quality: 85, alphaQuality: 100, effort: 6 })
            .toBuffer();
    const converted = await sharp(output).metadata();
    if (
      original.width !== converted.width ||
      original.height !== converted.height
    )
      throw Error("Resolution changed");
    const sha256 = crypto.createHash("sha256").update(output).digest("hex");
    const objectKey =
      "site/" +
      relative.replace(/\.[^.]+$/, "") +
      "-" +
      sha256.slice(0, 16) +
      ".webp";
    const sourcePath = "/images/" + relative;
    const localFile = sha256 + ".webp";
    await fs.writeFile(path.join(work, localFile), output);
    assets[sourcePath] = {
      sourceUrl: sourcePath,
      sourceSha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      objectKey,
      sha256,
      width: original.width,
      height: original.height,
      originalBytes: bytes.length,
      webpBytes: output.length,
      quality: original.format === "webp" ? null : 85,
      localFile,
    };
  }
  const rows = Object.values(assets);
  await fs.writeFile(
    path.join(work, "manifest.json"),
    JSON.stringify(
      {
        version: 1,
        count: rows.length,
        originalBytes: rows.reduce((t, a) => t + a.originalBytes, 0),
        webpBytes: rows.reduce((t, a) => t + a.webpBytes, 0),
        assets,
      },
      null,
      2,
    ) + "\n",
  );
  console.log("Prepared " + rows.length + " site images.");
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
