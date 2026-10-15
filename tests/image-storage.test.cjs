const test = require("node:test"),
  assert = require("node:assert/strict"),
  crypto = require("node:crypto"),
  fs = require("node:fs");
test("all image manifests contain verified content-addressed R2 URLs and preserve resolution", () => {
  const site = require("../data/site-image-assets.json"),
    bestiary = require("../data/bestiary-assets.json"),
    items = require("../data/item-image-assets.json");
  assert.equal(site.count, 29);
  assert.equal(bestiary.count, 294);
  assert.equal(items.count, 73);
  for (const m of [site, bestiary, items])
    for (const a of Object.values(m.assets)) {
      assert.match(
        a.publicUrl,
        /^https:\/\/dnd-images\.mosaicoworkers\.workers\.dev\//,
      );
      assert(a.publicUrl.endsWith(a.objectKey));
      assert(a.objectKey.endsWith("-" + a.sha256.slice(0, 16) + ".webp"));
      assert(a.width > 0 && a.height > 0);
      assert.equal(a.storage, "r2");
    }
  assert(bestiary.webpBytes < bestiary.originalBytes * 0.1);
});
test("R2 Worker authenticates uploads, validates hashes and serves cached GET, HEAD and 304", async () => {
  const worker = (await import("../cloudflare/images/worker.mjs")).default;
  const cache = new Map(),
    objects = new Map();
  global.caches = {
    default: {
      match: async (r) => cache.get(r.url)?.clone(),
      put: async (r, s) => cache.set(r.url, s),
    },
  };
  const tasks = [],
    ctx = { waitUntil: (p) => tasks.push(p) },
    env = {
      UPLOAD_TOKEN: "test-only-secret",
      IMAGES: {
        put: async (key, bytes, meta) => objects.set(key, { bytes, meta }),
        get: async (key) => object(key),
        head: async (key) => object(key),
      },
    };
  function object(key) {
    const o = objects.get(key);
    if (!o) return null;
    return {
      body: o.bytes,
      size: o.bytes.byteLength,
      httpEtag: '"test-etag"',
      writeHttpMetadata: (h) => {
        h.set("content-type", o.meta.httpMetadata.contentType);
        h.set("cache-control", o.meta.httpMetadata.cacheControl);
      },
    };
  }
  const bytes = fs.readFileSync("assets/images/classes/fighter.webp"),
    hash = crypto.createHash("sha256").update(bytes).digest("hex"),
    key = "site/classes/fighter-" + hash.slice(0, 16) + ".webp",
    url = "https://images.example/" + key;
  const send = (method, headers = {}, body) =>
    worker.fetch(new Request(url, { method, headers, body }), env, ctx);
  assert.equal((await send("PUT", {}, bytes)).status, 401);
  assert.equal(objects.size, 0);
  const invalid = Buffer.from("not-an-image");
  assert.equal(
    (await send("PUT", { authorization: "Bearer test-only-secret" }, invalid))
      .status,
    400,
  );
  assert.equal(
    (await send("PUT", { authorization: "Bearer test-only-secret" }, bytes))
      .status,
    200,
  );
  const r = await send("GET");
  assert.equal(r.headers.get("content-type"), "image/webp");
  assert(r.headers.get("cache-control").includes("immutable"));
  assert.deepEqual(Buffer.from(await r.arrayBuffer()), bytes);
  await Promise.all(tasks);
  const head = await send("HEAD");
  assert.equal(head.headers.get("content-length"), String(bytes.length));
  assert.equal((await head.arrayBuffer()).byteLength, 0);
  assert.equal(
    (await send("GET", { "if-none-match": '"test-etag"' })).status,
    304,
  );
  assert.equal(
    (await worker.fetch(new Request("https://images.example/secret"), env, ctx))
      .status,
    404,
  );
  const wrong =
    "https://images.example/site/classes/fighter-0000000000000000.webp";
  assert.equal(
    (
      await worker.fetch(
        new Request(wrong, {
          method: "PUT",
          headers: { authorization: "Bearer test-only-secret" },
          body: bytes,
        }),
        env,
        ctx,
      )
    ).status,
    400,
  );
});
