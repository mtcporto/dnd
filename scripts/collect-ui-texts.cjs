const fs = require("node:fs"),
  path = require("node:path"),
  ts = require("typescript");
function files(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((x) =>
      x.isDirectory()
        ? files(path.join(dir, x.name))
        : [path.join(dir, x.name)],
    )
    .filter((x) => /\.(tsx|ts)$/.test(x));
}
const result = {};
function add(text, lang = "pt") {
  text = text.trim();
  if (/[a-zA-ZÀ-ÿ]/.test(text) && text.length < 5000) result[text] = lang;
}
function human(text) {
  return (
    /[À-ÿ]|\s+[a-zA-Z]|^[A-Z][a-z][a-z]/.test(text) &&
    !/^[/#]|https?:|^\.[/]|^rgb|^var\(|^--/.test(text) &&
    !/^[-\w]+\.(json|webp|png|svg|ts|cjs)$/.test(text)
  );
}
for (const file of [
  ...files("app"),
  ...files("components"),
  ...files("lib").filter((x) => /labels|presentation/.test(x)),
  ...files("domain"),
]) {
  const source = ts.createSourceFile(
    file,
    fs.readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  function walk(node) {
    if (
      ts.isJsxAttribute(node) &&
      ![
        "alt",
        "aria-label",
        "aria-roledescription",
        "title",
        "placeholder",
        "caption",
      ].includes(node.name.getText(source))
    ) {
      // Event handlers can contain translated errors even when the attribute
      // itself is code rather than a user-facing string.
      function translations(child) {
        if (
          ts.isCallExpression(child) &&
          ts.isIdentifier(child.expression) &&
          child.expression.text === "t" &&
          child.arguments[0] &&
          ts.isStringLiteral(child.arguments[0])
        )
          add(child.arguments[0].text);
        ts.forEachChild(child, translations);
      }
      ts.forEachChild(node, translations);
      return;
    }
    if (ts.isImportDeclaration(node)) return;
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === "t" &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    )
      add(node.arguments[0].text);
    if (ts.isJsxText(node)) add(node.text.replace(/\s+/g, " "));
    if (ts.isStringLiteral(node) && human(node.text)) add(node.text);
    if (
      ts.isTemplateExpression(node) &&
      human(
        node.head.text +
          node.templateSpans.map((s) => s.literal.text).join(" "),
      )
    ) {
      add(
        node.head.text +
          node.templateSpans
            .map((s, i) => "{" + i + "}" + s.literal.text)
            .join(""),
      );
    }
    ts.forEachChild(node, walk);
  }
  walk(source);
}
for (const text of [
  "Idioma",
  "Escolha o idioma",
  "English",
  "Português",
  "Español",
  "Não foi possível trocar o idioma.",
  " ou ",
  " e ",
  "Classe",
  "Espécie",
  "Antecedente",
  "Escolha",
  "Pontos de vida",
  "Pequeno ou Médio",
  "proficiente",
  "carrossel",
  "HP",
  "CA",
  "STR",
  "DEX",
  "CON",
  "INT",
  "WIS",
  "CHA",
])
  add(text);
for (const file of ["lib/class-presentation.ts"]) {
  const source = fs.readFileSync(file, "utf8");
  for (const block of source.matchAll(/tags:\s*\[([^\]]+)\]/g))
    for (const match of block[1].matchAll(/"([^"]+)"/g)) add(match[1], "en");
}
fs.writeFileSync("data/ui-source.json", JSON.stringify(result, null, 2) + "\n");
console.log("Collected", Object.keys(result).length, "UI text keys.");
