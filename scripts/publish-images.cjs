const fs = require("node:fs/promises"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  { createClient } = require("@libsql/client");
const root = path.resolve(__dirname, ".."),
  work = path.join(root, "data/local/bestiary-images");
async function retry(fn) {
  for (let i = 0; i < 4; i++) {
    try {
      return await fn();
    } catch (e) {
      if (i === 3) throw e;
      await new Promise((r) => setTimeout(r, 1500 * (i + 1)));
    }
  }
}
(async () => {
  const {
    R2_PUBLIC_URL,
    R2_UPLOAD_URL,
    R2_UPLOAD_TOKEN,
    TURSO_DATABASE_URL,
    TURSO_AUTH_TOKEN,
  } = process.env;
  if (
    !R2_PUBLIC_URL ||
    !R2_UPLOAD_URL ||
    !R2_UPLOAD_TOKEN ||
    !TURSO_DATABASE_URL
  )
    throw Error("Configure R2 public/upload URLs, upload token and Turso.");
  for (const endpoint of [R2_PUBLIC_URL, R2_UPLOAD_URL])
    if (new URL(endpoint).protocol !== "https:")
      throw Error("Storage endpoints require HTTPS");
  const manifest = JSON.parse(
    await fs.readFile(path.join(work, "manifest.json"), "utf8"),
  );
  const siteWork = path.join(root, "data/local/site-images");
  const site = JSON.parse(
    await fs.readFile(path.join(siteWork, "manifest.json"), "utf8"),
  );
  const itemWork = path.join(root, "data/local/item-images");
  const itemImages = JSON.parse(
    await fs.readFile(path.join(itemWork, "manifest.json"), "utf8"),
  );
  const expected = Object.values(
    require("../data/bestiary-images.json"),
  ).filter(Boolean).length;
  if (
    manifest.count !== expected ||
    Object.keys(manifest.assets).length !== expected
  )
    throw Error("Incomplete conversion manifest");
  const entries = [
    ...Object.entries(manifest.assets).map(([key, a]) => [key, a, "bestiary"]),
    ...Object.entries(site.assets).map(([key, a]) => [key, a, "site"]),
    ...Object.entries(itemImages.assets).map(([key, a]) => [key, a, "item"]),
  ];
  let next = 0,
    done = 0;
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      while (next < entries.length) {
        const [index, asset, kind] = entries[next++];
        const bytes = await fs.readFile(
          kind === "bestiary"
            ? path.join(work, index + ".webp")
            : path.join(kind === "item" ? itemWork : siteWork, asset.localFile),
        );
        if (
          crypto.createHash("sha256").update(bytes).digest("hex") !==
          asset.sha256
        )
          throw Error("Invalid local hash: " + index);
        const publicUrl =
          R2_PUBLIC_URL.replace(/\/$/, "") + "/" + asset.objectKey;
        await retry(async () => {
          const existing = await fetch(publicUrl, {
            method: "HEAD",
            signal: AbortSignal.timeout(30000),
          });
          if (
            !existing.ok ||
            existing.headers.get("x-content-sha256") !== asset.sha256 ||
            Number(existing.headers.get("content-length")) !== asset.webpBytes
          ) {
            const uploaded = await fetch(
              R2_UPLOAD_URL.replace(/\/$/, "") + "/" + asset.objectKey,
              {
                method: "PUT",
                headers: {
                  authorization: "Bearer " + R2_UPLOAD_TOKEN,
                  "content-type": "image/webp",
                },
                body: bytes,
                signal: AbortSignal.timeout(60000),
              },
            );
            if (!uploaded.ok)
              throw Error(
                "Upload failed: " + index + " HTTP " + uploaded.status,
              );
          }
          const response = await fetch(publicUrl, {
            signal: AbortSignal.timeout(60000),
          });
          if (
            !response.ok ||
            !response.headers.get("content-type")?.startsWith("image/webp")
          )
            throw Error("Public image verification failed: " + index);
          const returned = Buffer.from(await response.arrayBuffer());
          if (
            returned.length !== asset.webpBytes ||
            crypto.createHash("sha256").update(returned).digest("hex") !==
              asset.sha256
          )
            throw Error("Public hash mismatch: " + index);
        });
        asset.publicUrl = publicUrl;
        asset.storage = "r2";
        if (++done % 25 === 0 || done === entries.length)
          console.log("Uploaded and verified " + done + "/" + entries.length);
      }
    }),
  );
  const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
  try {
    await client.batch(
      entries.map(([index, a, kind]) => ({
        sql: "INSERT INTO bestiary_image_assets (monster_index,source_url,object_key,public_url,sha256,width,height,original_bytes,webp_bytes,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(monster_index) DO UPDATE SET source_url=excluded.source_url,object_key=excluded.object_key,public_url=excluded.public_url,sha256=excluded.sha256,width=excluded.width,height=excluded.height,original_bytes=excluded.original_bytes,webp_bytes=excluded.webp_bytes,updated_at=excluded.updated_at"
          .replaceAll(
            "bestiary_image_assets",
            kind === "bestiary"
              ? "bestiary_image_assets"
              : kind === "item"
                ? "item_image_assets"
                : "image_assets",
          )
          .replaceAll(
            "monster_index",
            kind === "bestiary"
              ? "monster_index"
              : kind === "item"
                ? "item_id"
                : "source_path",
          ),
        args: [
          index,
          a.sourceUrl,
          a.objectKey,
          a.publicUrl,
          a.sha256,
          a.width,
          a.height,
          a.originalBytes,
          a.webpBytes,
          Date.now(),
        ],
      })),
      "write",
    );
  } finally {
    client.close();
  }
  for (const [name, data] of [
    ["bestiary-assets", manifest],
    ["site-image-assets", site],
    ["item-image-assets", itemImages],
  ]) {
    for (const asset of Object.values(data.assets)) delete asset.localFile;
    const file = path.join(root, "data/" + name + ".json");
    await fs.writeFile(
      file + ".tmp",
      JSON.stringify(
        { ...data, publishedAt: new Date().toISOString() },
        null,
        2,
      ) + "\n",
    );
    await fs.rename(file + ".tmp", file);
  }
  console.log(
    "Published " +
      done +
      " verified R2 references in Turso and packaged manifest.",
  );
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
