import { z } from "zod";
import { deriveProficiencies } from "./proficiencies.ts";
export const ABILITIES = ["STR", "DEX", "CON", "INT", "WIS", "CHA"] as const;
export type Ability = (typeof ABILITIES)[number];
export type Scores = Record<Ability, number>;
export const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const score = z.number().int().min(8).max(15);
export const draftInputSchema = z
  .object({
    name: z.string().trim().min(1, "Informe um nome.").max(60),
    classIndex: z.string().regex(/^[a-z-]+$/),
    speciesIndex: z.string().regex(/^[a-z-]+$/),
    backgroundIndex: z.string().regex(/^[a-z-]+$/),
    attributes: z
      .object({
        STR: score,
        DEX: score,
        CON: score,
        INT: score,
        WIS: score,
        CHA: score,
      })
      .strict(),
    bonusTwo: z.enum(ABILITIES),
    bonusOne: z.enum(ABILITIES),
    notes: z.string().max(2000).default(""),
    proficiencySelections: z
      .record(
        z.string().max(100),
        z.array(z.string().regex(/^[a-z-]+$/)).max(4),
      )
      .default({}),
  })
  .strict();
export type DraftInput = z.infer<typeof draftInputSchema>;
export interface Reference {
  index: string;
  name: string;
  desc?: string[];
}
export interface ProficiencyChoice {
  choose: number;
  desc?: string;
  from: {
    option_set_type: string;
    options?: {
      option_type: string;
      item?: Reference & { url?: string };
      choice?: ProficiencyChoice;
    }[];
  };
}
export interface ClassEntry extends Reference {
  hit_die: number;
  levelOne: { features: Reference[] };
  primary_ability?: {
    ability_scores: Reference[];
    ability_score_options?: ProficiencyChoice;
  };
  proficiency_choices?: ProficiencyChoice[];
  proficiencies?: Reference[];
  saving_throws?: Reference[];
  starting_equipment_options?: unknown[];
}
export interface SpeciesEntry extends Reference {
  speed: number;
  size: string;
  size_options?: { from: { options?: { size: string }[] } };
  traits: (Reference & { proficiency_choices?: ProficiencyChoice })[];
  subspecies?: Reference[];
}
export interface BackgroundEntry extends Reference {
  ability_scores: Reference[];
  feat: Reference;
  proficiencies: Reference[];
  proficiency_choices?: ProficiencyChoice[];
}
export interface Catalogue {
  edition: string;
  srdVersion: string;
  importedAt: string;
  classes: ClassEntry[];
  species: SpeciesEntry[];
  backgrounds: BackgroundEntry[];
  skills?: (Reference & { ability_score: Reference })[];
}
export const modifier = (score: number) => Math.floor((score - 10) / 2);
export function deriveDraft(input: DraftInput, catalogue: Catalogue) {
  const selectedClass = catalogue.classes.find(
      (entry) => entry.index === input.classIndex,
    ),
    species = catalogue.species.find(
      (entry) => entry.index === input.speciesIndex,
    ),
    background = catalogue.backgrounds.find(
      (entry) => entry.index === input.backgroundIndex,
    );
  if (!selectedClass || !species || !background)
    throw Error("Escolha uma classe, espécie e antecedente disponíveis.");
  if (
    [...Object.values(input.attributes)].sort((a, b) => b - a).join(",") !==
    STANDARD_ARRAY.join(",")
  )
    throw Error("Use cada valor da matriz padrão uma única vez.");
  const allowed = background.ability_scores.map((score) =>
    score.index.toUpperCase(),
  );
  if (
    input.bonusOne === input.bonusTwo ||
    !allowed.includes(input.bonusOne) ||
    !allowed.includes(input.bonusTwo)
  )
    throw Error(
      "Escolha dois atributos diferentes permitidos pelo antecedente.",
    );
  const attributes = { ...input.attributes };
  attributes[input.bonusTwo] += 2;
  attributes[input.bonusOne] += 1;
  const modifiers = Object.fromEntries(
    ABILITIES.map((key) => [key, modifier(attributes[key])]),
  ) as Scores;
  const dwarfBonus = species.traits.some(
    (trait) => trait.index === "dwarven-toughness",
  )
    ? 1
    : 0;
  const unarmoredAC =
    10 +
    modifiers.DEX +
    (selectedClass.levelOne.features.some(
      (feature) => feature.index === "barbarian-unarmored-defense",
    )
      ? modifiers.CON
      : selectedClass.levelOne.features.some(
            (feature) => feature.index === "monk-unarmored-defense",
          )
        ? modifiers.WIS
        : 0);
  const training = deriveProficiencies(input, catalogue, modifiers);
  return {
    input,
    edition: "2024" as const,
    srdVersion: catalogue.srdVersion,
    catalogueDate: catalogue.importedAt,
    status: "draft" as const,
    level: 1,
    attributes,
    modifiers,
    hitPoints: Math.max(1, selectedClass.hit_die + modifiers.CON + dwarfBonus),
    unarmoredAC,
    initiative: modifiers.DEX + (background.feat.index === "alert" ? 2 : 0),
    proficiencyBonus: 2,
    speed: species.speed,
    features: selectedClass.levelOne.features,
    traits: species.traits,
    originFeat: background.feat,
    training,
    pending: [
      ...training.pending,
      "Escolhas de idiomas",
      "Equipamento inicial e defesa",
      "Escolhas de classe, espécie e talentos",
      ...([
        "bard",
        "cleric",
        "druid",
        "paladin",
        "ranger",
        "sorcerer",
        "warlock",
        "wizard",
      ].includes(selectedClass.index)
        ? ["Seleção de magias e recursos de conjuração"]
        : []),
    ],
  };
}
export type CharacterDraft = ReturnType<typeof deriveDraft>;
