import type { Item } from "./items.ts";
// These persisted summaries are presentation only; they do not change mechanics.
export function itemEffects(item: Pick<Item, "effects">): string[] {
  return item.effects || [];
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
