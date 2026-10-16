import type { Item } from "./items.ts";
type Translate = (key: string, values?: (string | number)[]) => string;
// Presentation only: these reviewed summaries never change inventory mechanics.
export function itemEffects(
  item: Pick<Item, "kind" | "index">,
  t: Translate,
): string[] {
  if (item.kind !== "magic") return [];
  switch (item.index) {
    case "brooch-of-shielding":
      return [
        t("Resistência a dano de Força."),
        t("Imunidade ao dano da magia Mísseis Mágicos."),
      ];
    case "armor-of-resistance":
      return [
        t("Resistência a um tipo de dano escolhido pelo mestre."),
        t("Disponível como armadura leve, média ou pesada."),
      ];
    case "ammunition-of-slaying":
      return [
        t("Afeta um tipo de criatura escolhido pelo mestre."),
        t(
          "+6d10 de dano de Força contra uma criatura do tipo escolhido que sofra dano da munição.",
        ),
        t(
          "Resistência de Constituição CD 17: metade do dano adicional em caso de sucesso.",
        ),
        t("Torna-se não mágica após causar o dano adicional."),
      ];
    case "ring-of-protection":
    case "cloak-of-protection":
      return [
        t("+1 na Classe de Armadura."),
        t("+1 nos testes de resistência."),
      ];
    case "gauntlets-of-ogre-power":
      return [
        t("Força passa a ser 19."),
        t("Sem efeito se a Força já for 19 ou maior sem o item."),
      ];
    case "amulet-of-health":
      return [
        t("Constituição passa a ser 19."),
        t("Sem efeito se a Constituição já for 19 ou maior sem o item."),
      ];
    case "headband-of-intellect":
      return [
        t("Inteligência passa a ser 19."),
        t("Sem efeito se a Inteligência já for 19 ou maior sem o item."),
      ];
    default:
      return [];
  }
}
export function itemDescription(
  item: Pick<Item, "desc" | "description" | "notes">,
) {
  return [
    ...(item.desc || []),
    ...(item.description || []),
    ...(item.notes || []),
  ].join("\n\n");
}
// Restore contiguous GFM rows after API arrays were joined as paragraphs.
export function normalizeRulesMarkdown(text: string) {
  return text
    .replace(/\*\*([^\n*]+)\*\*/g, (_, label: string) => `**${label.trim()}**`)
    .replace(/(^[ \t]*\|[^\n]*\|[ \t]*)\n(?:[ \t]*\n)+(?=[ \t]*\|)/gm, "$1\n");
}
export function itemEffectChoices(item: Item): string[] {
  if (
    item.kind !== "magic" ||
    !["ammunition-of-slaying", "armor-of-resistance"].includes(item.index)
  )
    return [];
  return itemDescription(item)
    .split("\n")
    .map((row) =>
      /^\|\s*\d+(?:-\d+)?\s*\|\s*([^|]+)\|\s*$/.exec(row.trim())?.[1]?.trim(),
    )
    .filter((s): s is string => !!s);
}
