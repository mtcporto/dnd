const keyPattern =
  /^(?:bestiary\/[a-z0-9-]+|site\/(?:[a-zA-Z0-9_-]+\/)*[a-zA-Z0-9_-]+)-[a-f0-9]{16}\.webp$/;
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url),
      key = url.pathname.slice(1);
    if (!keyPattern.test(key) || url.search)
      return new Response("Not found", { status: 404 });
    if (request.method === "PUT") {
      if (
        !env.UPLOAD_TOKEN ||
        request.headers.get("authorization") !== `Bearer ${env.UPLOAD_TOKEN}`
      )
        return new Response("Unauthorized", { status: 401 });
      if (Number(request.headers.get("content-length")) > 8 * 1024 * 1024)
        return new Response("Too large", { status: 413 });
      const bytes = await request.arrayBuffer(),
        magic = new Uint8Array(bytes);
      if (bytes.byteLength > 8 * 1024 * 1024)
        return new Response("Too large", { status: 413 });
      if (
        String.fromCharCode(...magic.slice(0, 4)) !== "RIFF" ||
        String.fromCharCode(...magic.slice(8, 12)) !== "WEBP"
      )
        return new Response("Invalid image", { status: 400 });
      const digest = Array.from(
        new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
        (b) => b.toString(16).padStart(2, "0"),
      ).join("");
      if (!key.endsWith("-" + digest.slice(0, 16) + ".webp"))
        return new Response("Hash mismatch", { status: 400 });
      await env.IMAGES.put(key, bytes, {
        httpMetadata: {
          contentType: "image/webp",
          cacheControl: "public, max-age=31536000, immutable",
        },
        customMetadata: { sha256: digest },
      });
      return Response.json({ uploaded: true, sha256: digest });
    }
    if (!["GET", "HEAD"].includes(request.method))
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "GET, HEAD, PUT" },
      });
    const cache = caches.default,
      cacheKey = new Request(url.toString(), { method: "GET" });
    let response =
      request.method === "GET" ? await cache.match(cacheKey) : undefined;
    if (!response) {
      const object =
        request.method === "HEAD"
          ? await env.IMAGES.head(key)
          : await env.IMAGES.get(key);
      if (!object) return new Response("Not found", { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set("etag", object.httpEtag);
      if (object.customMetadata?.sha256)
        headers.set("x-content-sha256", object.customMetadata.sha256);
      headers.set("content-length", String(object.size));
      headers.set("x-content-type-options", "nosniff");
      response = new Response(request.method === "HEAD" ? null : object.body, {
        headers,
      });
      if (request.method === "GET")
        ctx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    if (request.headers.get("if-none-match") === response.headers.get("etag"))
      return new Response(null, { status: 304, headers: response.headers });
    return request.method === "HEAD"
      ? new Response(null, { headers: response.headers })
      : response;
  },
};
