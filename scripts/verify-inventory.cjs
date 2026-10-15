const assert = require("node:assert/strict"),
  fs = require("node:fs");
const { createClient } = require("@libsql/client"),
  { drizzle } = require("drizzle-orm/libsql"),
  { betterAuth } = require("better-auth"),
  { drizzleAdapter } = require("@better-auth/drizzle-adapter"),
  { eq, inArray } = require("drizzle-orm");
const schema = require("../server/db/schema.ts");
const origin = process.env.DND_VERIFY_ORIGIN || "http://localhost:3001",
  client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  }),
  db = drizzle(client, { schema });
const auth = betterAuth({
  appName: "DND inventory verification",
  baseURL: origin,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, { provider: "sqlite" }),
  emailAndPassword: { enabled: true },
});
const users = [];
let keepFixture = false;
async function identity() {
  const r = await auth.api.signUpEmail({
    body: {
      email: "inventory-" + crypto.randomUUID() + "@example.test",
      name: "Inventory verification",
      password: crypto.randomUUID(),
    },
    asResponse: true,
  });
  assert.equal(r.status, 200);
  const data = await r.json();
  users.push(data.user.id);
  return {
    id: data.user.id,
    cookie: r.headers
      .getSetCookie()
      .map((s) => s.split(";")[0])
      .join("; "),
  };
}
async function request(
  path,
  cookie,
  body,
  expected = 200,
  originHeader = origin,
) {
  const r = await fetch(origin + path, {
    method: body ? "POST" : "GET",
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      ...(body
        ? { "Content-Type": "application/json", Origin: originHeader }
        : {}),
      ...(cookie ? { "Accept-Language": "en" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const text = await r.text();
  assert.equal(r.status, expected, text.slice(0, 500));
  return text ? JSON.parse(text) : undefined;
}
(async () => {
  try {
    const a = await identity(),
      b = await identity();
    const input = {
      name: "Inventory browser verification",
      classIndex: "fighter",
      speciesIndex: "dwarf",
      backgroundIndex: "soldier",
      attributes: { STR: 15, DEX: 14, CON: 13, INT: 8, WIS: 12, CHA: 10 },
      bonusTwo: "STR",
      bonusOne: "CON",
      notes: "Temporary inventory test",
      proficiencySelections: {
        "class-0": ["skill-perception", "skill-survival"],
        "background-0": ["tool-dice"],
      },
    };
    const created = await request("/api/personagens", a.cookie, input, 201),
      id = created.id,
      path = "/api/personagens/" + id + "/inventario";
    let view = await request(path, a.cookie);
    assert.equal(view.revision, 0);
    assert.equal(view.state.entries.length, 0);
    const savedBefore = (await request("/api/personagens", a.cookie)).find(
      (c) => c.id === id,
    ).draft;
    await request(path, null, undefined, 401);
    await request(path, b.cookie, undefined, 404);
    await request(
      path,
      b.cookie,
      { action: "wallet", revision: 0, copper: 999 },
      404,
    );
    await request(
      path,
      a.cookie,
      { action: "wallet", revision: 0, copper: 999 },
      403,
      "https://evil.example",
    );
    await request(
      path,
      a.cookie,
      { action: "wallet", revision: 0, copper: 99, userId: b.id },
      400,
    );
    await request(
      path,
      a.cookie,
      { action: "add", revision: 0, itemId: "equipment:forged", quantity: 1 },
      400,
    );
    async function mutate(body, expected = 200) {
      const result = await request(
        path,
        a.cookie,
        { ...body, revision: view.revision },
        expected,
      );
      if (expected === 200) view = result;
      return result;
    }
    await mutate({ action: "add", itemId: "equipment:longsword", quantity: 1 });
    await request(
      path,
      a.cookie,
      { action: "add", revision: 0, itemId: "equipment:dagger", quantity: 1 },
      409,
    );
    const revision = view.revision;
    const results = await Promise.all(
      [0, 1].map(() =>
        fetch(origin + path, {
          method: "POST",
          headers: {
            Cookie: a.cookie,
            Origin: origin,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "add",
            revision,
            itemId: "equipment:potion-of-healing",
            quantity: 1,
          }),
        }),
      ),
    );
    assert.deepEqual(results.map((r) => r.status).sort(), [200, 409]);
    view = await request(path, a.cookie);
    assert.equal(
      view.state.entries.find((e) => e.itemId === "equipment:potion-of-healing")
        .quantity,
      1,
    );
    await mutate({
      action: "add",
      itemId: "equipment:potion-of-healing",
      quantity: 1,
    });
    await mutate({ action: "health", currentHP: 1 });
    const healed = await mutate({
      action: "use",
      itemId: "equipment:potion-of-healing",
    });
    assert(healed.recovered >= 4 && healed.recovered <= 10);
    assert.equal(healed.state.currentHP, 1 + healed.recovered);
    assert.equal(
      healed.state.entries.find(
        (e) => e.itemId === "equipment:potion-of-healing",
      ).quantity,
      1,
    );
    for (const item of ["chain-mail", "shield", "greatsword"])
      await mutate({ action: "add", itemId: "equipment:" + item, quantity: 1 });
    await mutate({
      action: "equip",
      itemId: "equipment:chain-mail",
      slot: "armor",
    });
    await mutate({
      action: "equip",
      itemId: "equipment:shield",
      slot: "offHand",
    });
    await mutate(
      { action: "equip", itemId: "equipment:greatsword", slot: "mainHand" },
      400,
    );
    await mutate({
      action: "equip",
      itemId: "equipment:longsword",
      slot: "mainHand",
    });
    await mutate({
      action: "add",
      itemId: "magic:adamantine-armor",
      quantity: 1,
    });
    await mutate(
      { action: "equip", itemId: "magic:adamantine-armor", slot: "armor" },
      400,
    );
    await mutate(
      {
        action: "equip",
        itemId: "magic:adamantine-armor",
        slot: "armor",
        baseItemId: "equipment:leather-armor",
      },
      400,
    );
    await mutate({
      action: "equip",
      itemId: "magic:adamantine-armor",
      slot: "armor",
      baseItemId: "equipment:chain-mail",
    });
    assert.equal(view.state.equipment.armor, "magic:adamantine-armor");
    assert.equal(
      view.state.entries.find((e) => e.itemId === "magic:adamantine-armor")
        .baseItemId,
      "equipment:chain-mail",
    );
    await mutate({ action: "wallet", copper: 1234 });
    assert.deepEqual(
      (await request("/api/personagens", a.cookie)).find((c) => c.id === id)
        .draft,
      savedBefore,
    );
    assert.deepEqual(await request(path, a.cookie), {
      state: view.state,
      revision: view.revision,
    });
    for (const locale of ["en", "pt", "es"]) {
      const r = await fetch(origin + "/personagens/" + id + "/inventario", {
        headers: { Cookie: a.cookie + "; dnd-locale=" + locale },
      });
      assert.equal(r.status, 200);
      const html = await r.text();
      assert(html.includes(input.name));
      assert(html.includes("1234"));
    }
    console.log(
      "Verified inventory persistence, owner isolation, CSRF, invalid/forged inputs, concurrent revisions, real healing rolls, equipped items, all languages and unchanged saved character.",
    );
    if (process.env.DND_VERIFY_BROWSER) {
      const file = "/tmp/dnd-inventory-browser-session.json";
      fs.writeFileSync(
        file,
        JSON.stringify({ origin, cookie: a.cookie, id, users }),
        { mode: 0o600 },
      );
      keepFixture = true;
      console.log("Temporary browser fixture ready.");
      return;
    }
  } finally {
    if (!keepFixture && users.length)
      await db.delete(schema.user).where(inArray(schema.user.id, users));
    client.close();
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
