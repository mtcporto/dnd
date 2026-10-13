const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  Module = require("node:module"),
  ts = require("typescript");
const React = require("react"),
  { renderToStaticMarkup } = require("react-dom/server");
const filename = path.resolve("components/rules-text.tsx");
const compiled = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
  compilerOptions: {
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const component = new Module(filename, module);
component.filename = filename;
component.paths = Module._nodeModulePaths(path.dirname(filename));
component._compile(compiled, filename);
const { RulesText } = component.exports;
const render = (text) =>
  renderToStaticMarkup(React.createElement(RulesText, { text }));
test("actual API Rage descriptions render bold labels and semantic lists in all three languages", () => {
  for (const file of [
    "catalogue.json",
    "catalogue.pt.json",
    "catalogue.es.json",
  ]) {
    const catalogue = require("../data/" + file);
    const feature = catalogue.classes
      .find((c) => c.index === "barbarian")
      .levelOne.features.find((f) => f.index === "barbarian-rage");
    assert(feature);
    const html = render(feature.desc.join("\n\n"));
    assert(html.includes("<strong>"), file);
    assert(html.includes("<ul>") && html.includes("<li>"), file);
    assert(!html.includes("**"), file);
    assert(!html.includes("<p><div"), file);
  }
});
test("Markdown renders spaced bold labels, emphasis, headings and GFM tables", () => {
  const html = render(
    "## Rules\n\n** Important ** and *emphasis*.\n\n| Roll | Damage |\n| --- | --- |\n| 20 | 2d6 |",
  );
  assert(html.includes("<strong>Important</strong>"));
  assert(html.includes("<em>emphasis</em>"));
  assert(html.includes("<h2>Rules</h2>"));
  assert(html.includes("<table>"));
  assert(html.includes("2d6"));
});
test("source Markdown cannot insert executable HTML or javascript links", () => {
  const html = render(
    "<script>alert(1)</script>\n\n[link](javascript:alert)\n\n<img src=x onerror=alert(1)>",
  );
  assert(
    !html.includes("<script") &&
      !html.includes("onerror") &&
      !html.includes('href="javascript:'),
  );
  assert.equal(render(undefined), "");
});
