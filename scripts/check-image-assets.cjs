const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const root = path.resolve(__dirname, "..");
const site = require("../data/site-image-assets.json"),
  bestiary = require("../data/bestiary-assets.json"),
  sources = require("../data/bestiary-images.json");
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory()
        ? files(path.join(dir, e.name))
        : [path.join(dir, e.name)],
    );
}
for (const file of files(path.join(root, "assets/images")).filter((p) =>
  /\.(png|jpe?g|webp|avif)$/i.test(p),
)) {
  const key =
    "/images/" +
    path
      .relative(path.join(root, "assets/images"), file)
      .split(path.sep)
      .join("/");
  const a = site.assets[key];
  if (
    !a ||
    a.sourceSha256 !==
      crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex")
  )
    throw Error(
      "Unpublished/changed image: " + key + ". Run npm run images:update.",
    );
}
for (const [index, url] of Object.entries(sources))
  if (url && !bestiary.assets[index])
    throw Error("Missing R2 monster: " + index);
for (const manifest of [site, bestiary])
  for (const a of Object.values(manifest.assets))
    if (
      !a.publicUrl?.startsWith(
        "https://dnd-images.mosaicoworkers.workers.dev/",
      ) ||
      !a.publicUrl.endsWith(a.objectKey) ||
      !a.objectKey.endsWith("-" + a.sha256.slice(0, 16) + ".webp") ||
      a.width <= 0 ||
      a.height <= 0
    )
      throw Error("Invalid asset metadata");
console.log(
  "Published image references verified: " + (site.count + bestiary.count),
);
