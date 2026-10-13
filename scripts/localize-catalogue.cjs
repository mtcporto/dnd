const fs = require("node:fs"),
  crypto = require("node:crypto");
const { createClient } = require("@libsql/client");
const source = JSON.parse(fs.readFileSync("data/catalogue.json", "utf8"));
const ui = JSON.parse(fs.readFileSync("data/ui-source.json", "utf8"));
const registry = new Map(
  Object.entries(ui).map(([text, locale]) => [text.trim(), locale]),
);
const provider = process.env.OLLAMA_API_KEY ? "ollama" : "copilot";
const model =
  provider === "ollama"
    ? process.env.OLLAMA_MODEL || "gpt-oss:120b"
    : process.env.AI_MODEL || "gpt-4o";
const baseURL =
  provider === "ollama"
    ? process.env.OLLAMA_BASE_URL || "https://ollama.com/v1/"
    : process.env.AI_BASE_URL;
if (!baseURL || !process.env.TURSO_DATABASE_URL)
  throw Error("Translation provider and Turso must be configured.");
const fields = new Set(["name", "desc", "description", "repeatable", "note"]);
function collect(value, key) {
  if (typeof value === "string" && fields.has(key) && value.trim())
    registry.set(value.trim(), "en");
  else if (Array.isArray(value)) value.forEach((item) => collect(item, key));
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) collect(v, k);
}
collect(source);
const hash = (text) => crypto.createHash("sha256").update(text).digest("hex");
const entries = [...registry].map(([text, sourceLocale]) => ({
  id: hash(sourceLocale + "\n" + text),
  text,
  sourceLocale,
}));
fs.mkdirSync("data/local", { recursive: true });
const cachePath = "data/local/translation-cache.json";
const cache = fs.existsSync(cachePath)
  ? JSON.parse(fs.readFileSync(cachePath, "utf8"))
  : {};
function numbers(text) {
  return (text.match(/\d+(?:\.\d+)?/g) || []).sort().join("|");
}
function valid(entry, row) {
  return (
    row &&
    ["en", "pt", "es"].every(
      (locale) =>
        typeof row[locale] === "string" &&
        row[locale].trim() &&
        numbers(row[locale]) === numbers(entry.text) &&
        (locale === entry.sourceLocale ||
          entry.text.length <= 50 ||
          row[locale] !== entry.text),
    )
  );
}
// Reuse the versioned translations even on a fresh checkout without a local cache.
const manifestPath = "data/translation-manifest.json";
if (fs.existsSync(manifestPath) && fs.existsSync("data/ui-translations.json")) {
  const published = JSON.parse(
    fs.readFileSync("data/ui-translations.json", "utf8"),
  );
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const entry of entries) {
    if (valid(entry, cache[entry.id]) || !manifest.translations[entry.id])
      continue;
    const row = Object.fromEntries(
      ["en", "pt", "es"].map((locale) => [
        locale,
        published[locale]?.[entry.text],
      ]),
    );
    row.provider = manifest.translations[entry.id];
    if (valid(entry, row)) cache[entry.id] = row;
  }
}
const pending = entries.filter((entry) => !valid(entry, cache[entry.id]));
const batches = [];
let batch = [],
  size = 0;
for (const entry of pending) {
  if (batch.length && (batch.length >= 20 || size + entry.text.length > 2500)) {
    batches.push(batch);
    batch = [];
    size = 0;
  }
  batch.push(entry);
  size += entry.text.length;
}
if (batch.length) batches.push(batch);
const system = `You are a professional Dungeons & Dragons 5e SRD translator. Translate ALL supplied texts, never summarize, omit content or alter rules. Each entry has id, text and sourceLocale (en or pt). Return JSON object {"translations":[{"id":"...","en":"...","pt":"...","es":"..."}]}. en is fluent English, pt is Brazilian Portuguese, es is Spanish. Preserve the sourceLocale text verbatim in that language. Preserve ALL numeric digits exactly (including dice like 2d6, signs, numbers in placeholders {0}, ranges, decimal formatting, list numbering); do not convert feet to metres or change mechanics. Preserve Markdown, tables, URLs, IDs, placeholders {0}/{1}, and proper personal names. All descriptive text and headings must be translated. Glossary: Fighter=Guerreiro/Guerrero; Wizard=Mago/Mago; Sorcerer=Feiticeiro/Hechicero; Warlock=Bruxo/Brujo; Rogue=Ladino/Pícaro; Ranger=Patrulheiro/Explorador; Cleric=Clérigo/Clérigo; Bard=Bardo/Bardo; Barbarian=Bárbaro/Bárbaro; Paladin=Paladino/Paladín; Monk=Monge/Monje; Druid=Druida/Druida. Background=Antecedente/Trasfondo; species=espécie/especie; feat=talento/dote; saving throw=teste de resistência/tirada de salvación; hit points=pontos de vida/puntos de golpe; hit die=dado de vida/dado de golpe; proficiency=proficiência/competencia; Strength=Força/Fuerza; Dexterity=Destreza/Destreza; Constitution=Constituição/Constitución; Intelligence=Inteligência/Inteligencia; Wisdom=Sabedoria/Sabiduría; Charisma=Carisma/Carisma. Common=Comum/Común, Medium=Médio/Mediano, Small=Pequeno/Pequeño. A UI draft is Rascunho/Borrador. No invented information. Translate every item; output JSON only.`;
let next = 0,
  completed = 0;
async function translate(allItems) {
  let items = allItems;
  for (let attempt = 0; attempt < 6; attempt++) {
    items = allItems.filter((item) => !valid(item, cache[item.id]));
    if (!items.length) return;
    if (attempt > 0 && items.length > 5) {
      for (let i = 0; i < items.length; i += 5)
        await translate(items.slice(i, i + 5));
      return;
    }
    try {
      const response = await fetch(
        new URL(
          "chat/completions",
          baseURL.endsWith("/") ? baseURL : baseURL + "/",
        ),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(provider === "ollama"
              ? { Authorization: `Bearer ${process.env.OLLAMA_API_KEY}` }
              : {}),
          },
          body: JSON.stringify({
            model,
            ...(provider === "ollama" && model.startsWith("gpt-oss")
              ? { reasoning_effort: "low" }
              : {}),
            messages: [
              { role: "system", content: system },
              {
                role: "user",
                content: JSON.stringify(
                  items.map((item, index) => ({ ...item, id: String(index) })),
                ),
              },
            ],
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 12000,
          }),
          signal: AbortSignal.timeout(120000),
        },
      );
      if (!response.ok) throw Error("Provider HTTP " + response.status);
      const body = await response.json();
      const raw = body.choices?.[0]?.message?.content;
      if (typeof raw !== "string") throw Error("No translation response");
      const decoded = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, ""));
      const rows = new Map(
        (decoded.translations || []).map((row) => [row.id, row]),
      );
      const invalid = [];
      for (const item of items) {
        const row = rows.get(String(items.indexOf(item)));
        if (row) row[item.sourceLocale] = item.text;
        if (valid(item, row)) cache[item.id] = { ...row, provider: model };
        else invalid.push({ item, row });
      }
      fs.writeFileSync(cachePath + ".tmp", JSON.stringify(cache));
      fs.renameSync(cachePath + ".tmp", cachePath);
      if (invalid.length) {
        const { item, row } = invalid[0];
        console.log(
          "Rejected text:",
          item.text.slice(0, 90),
          "numbers:",
          numbers(item.text),
          "received:",
          row
            ? ["en", "pt", "es"].map((l) => numbers(row[l] || "")).join(" / ")
            : "missing",
        );
        throw Error(
          "Numeric integrity or coverage: " + invalid.length + " entries",
        );
      }
      return;
    } catch (error) {
      if (attempt === 5) throw error;
      console.log("Retrying translation batch:", error.message);
      await new Promise((r) => setTimeout(r, 3000 * (attempt + 1)));
    }
  }
}
function localized(value, key, locale) {
  if (typeof value === "string" && fields.has(key) && value.trim()) {
    const id = hash("en\n" + value.trim());
    const translated = cache[id]?.[locale];
    if (!translated) throw Error("Missing catalogue text");
    return (
      value.slice(0, value.indexOf(value.trim())) +
      translated +
      value.slice(value.indexOf(value.trim()) + value.trim().length)
    );
  }
  if (Array.isArray(value))
    return value.map((item) => localized(item, key, locale));
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, localized(v, k, locale)]),
    );
  return value;
}
(async () => {
  console.log(
    "Translation workload:",
    entries.length,
    "unique texts;",
    batches.length,
    "uncached batches.",
  );
  await Promise.all(
    Array.from({ length: 2 }, async () => {
      while (next < batches.length) {
        const i = next++;
        await translate(batches[i]);
        console.log("Translated batch", ++completed + "/" + batches.length);
      }
    }),
  );
  for (const entry of entries)
    if (!valid(entry, cache[entry.id]))
      throw Error("Translation coverage incomplete");
  const provenance = Object.fromEntries(
    entries.map((entry) => [entry.id, cache[entry.id].provider || "gpt-4o"]),
  );
  const usedModels = [...new Set(Object.values(provenance))].sort().join("; ");
  const snapshots = {
    en: source,
    pt: localized(source, "", "pt"),
    es: localized(source, "", "es"),
  };
  const dictionaries = { en: {}, pt: {}, es: {} };
  for (const [text, sourceLocale] of registry) {
    const row = cache[hash(sourceLocale + "\n" + text)];
    for (const locale of ["en", "pt", "es"])
      dictionaries[locale][text] = row[locale];
  }
  const outputs = {
    [manifestPath]: {
      sourceHash: hash(JSON.stringify(source)),
      translations: provenance,
    },
    "data/catalogue.pt.json": snapshots.pt,
    "data/catalogue.es.json": snapshots.es,
    "data/ui-translations.json": dictionaries,
  };
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  try {
    const sourceHash = hash(JSON.stringify(source));
    await client.batch(
      Object.entries(snapshots).map(([locale, payload]) => ({
        sql: "INSERT INTO catalogue_snapshots (edition,locale,payload,source_hash,source_url,translation_model,updated_at) VALUES (?,?,?,?,?,?,?) ON CONFLICT (edition,locale) DO UPDATE SET payload=excluded.payload,source_hash=excluded.source_hash,source_url=excluded.source_url,translation_model=excluded.translation_model,updated_at=excluded.updated_at",
        args: [
          source.edition,
          locale,
          JSON.stringify(payload),
          sourceHash,
          source.source,
          locale === "en" ? null : usedModels,
          Date.now(),
        ],
      })),
      "write",
    );
    // Publish packaged fallbacks only after the database transaction succeeds.
    for (const [file, value] of Object.entries(outputs)) {
      fs.writeFileSync(file + ".tmp", JSON.stringify(value, null, 2) + "\n");
      fs.renameSync(file + ".tmp", file);
    }
    console.log(
      "Stored English original and complete Portuguese/Spanish catalogues in the shared Turso database.",
    );
  } finally {
    client.close();
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
