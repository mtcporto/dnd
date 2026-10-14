export interface MonsterReference {
  index: string;
  name: string;
  url?: string;
}
export interface MonsterRule {
  name: string;
  desc?: string;
  attack_bonus?: number;
  damage?: Array<{ damage_dice?: string; damage_type?: MonsterReference }>;
  dc?: { dc_type?: MonsterReference; dc_value: number; success_type?: string };
  usage?: { type: string; times?: number; dice?: string; min_value?: number };
  [key: string]: unknown;
}
export interface Monster {
  index: string;
  name: string;
  size: string;
  type: string;
  alignment: string;
  armor_class: Array<{
    value: number;
    armor?: MonsterReference[];
    type?: string;
  }>;
  hit_points: number;
  hit_dice: string;
  hit_points_roll: string;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
  challenge_rating: number;
  proficiency_bonus: number;
  xp: number;
  xp_in_lair?: number;
  speed: Record<string, string | boolean>;
  senses: Record<string, string | number>;
  languages: string;
  gear?: string;
  image?: string;
  url: string;
  updated_at: string;
  proficiencies: Array<{ value: number; proficiency: MonsterReference }>;
  damage_resistances: string[];
  damage_immunities: string[];
  damage_vulnerabilities: string[];
  condition_immunities: MonsterReference[];
  special_abilities: MonsterRule[];
  actions: MonsterRule[];
  bonus_actions: MonsterRule[];
  reactions: MonsterRule[];
  legendary_actions: MonsterRule[];
  forms: unknown[];
  desc?: string | string[];
  description?: string;
}
export interface Bestiary {
  edition: string;
  srdVersion: string;
  source: string;
  importedAt: string;
  count: number;
  monsters: Monster[];
}
export interface MonsterSummary {
  index: string;
  name: string;
  canonicalName: string;
  type: string;
  size: string;
  challengeRating: number;
}
export interface BestiaryQuery {
  q?: string;
  type?: string;
  size?: string;
  cr?: string;
  sort?: string;
  page?: string;
}
export const PAGE_SIZE = 24;
export const normalizeSearch = (text: string) =>
  text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
export function challengeLabel(value: number): string {
  return value === 0.125
    ? "1/8"
    : value === 0.25
      ? "1/4"
      : value === 0.5
        ? "1/2"
        : String(value);
}
export function queryHref(query: BestiaryQuery): string {
  const params = new URLSearchParams();
  for (const key of ["q", "type", "size", "cr", "sort", "page"] as const)
    if (query[key])
      params.set(key, query[key]!.slice(0, key === "q" ? 120 : 60));
  return "/bestiario" + (params.size ? "?" + params.toString() : "");
}
export function filterMonsters(
  entries: MonsterSummary[],
  query: BestiaryQuery,
  locale: string,
) {
  const term = normalizeSearch((query.q || "").slice(0, 120));
  const filtered = entries.filter(
    (m) =>
      (!term ||
        normalizeSearch(m.name).includes(term) ||
        normalizeSearch(m.canonicalName).includes(term)) &&
      (!query.type || m.type === query.type) &&
      (!query.size || m.size === query.size) &&
      (!query.cr || m.challengeRating === Number(query.cr)),
  );
  filtered.sort((a, b) =>
    query.sort === "cr-desc"
      ? b.challengeRating - a.challengeRating ||
        a.name.localeCompare(b.name, locale)
      : query.sort === "cr-asc"
        ? a.challengeRating - b.challengeRating ||
          a.name.localeCompare(b.name, locale)
        : a.name.localeCompare(b.name, locale),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rawPage = Number(query.page);
  const page = Math.max(
    1,
    Math.min(pages, Number.isSafeInteger(rawPage) ? rawPage : 1),
  );
  return {
    entries: filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: filtered.length,
    page,
    pages,
  };
}
