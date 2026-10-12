import type {
  Catalogue,
  DraftInput,
  ProficiencyChoice,
  Reference,
  Scores,
  Ability,
} from "./character.ts";

export interface TrainingGroup {
  id: string;
  source: string;
  choose: number;
  options: Reference[];
}
function options(choice: ProficiencyChoice): Reference[] {
  return (choice.from.options || []).flatMap((option) => {
    if (option.item)
      return [
        {
          index: option.item.url?.includes("/skills/")
            ? "skill-" + option.item.index
            : option.item.index,
          name: option.item.name,
        },
      ];
    // Nested alternatives choosing one tool can be presented as a single list.
    if (option.choice?.choose === 1) return options(option.choice);
    return [];
  });
}
export function getTrainingGroups(
  input: Pick<DraftInput, "classIndex" | "speciesIndex" | "backgroundIndex">,
  catalogue: Catalogue,
): TrainingGroup[] {
  const selectedClass = catalogue.classes.find(
    (c) => c.index === input.classIndex,
  );
  const background = catalogue.backgrounds.find(
    (b) => b.index === input.backgroundIndex,
  );
  const species = catalogue.species.find((s) => s.index === input.speciesIndex);
  const groups: TrainingGroup[] = [];
  function add(choice: ProficiencyChoice, id: string, source: string) {
    const choices = options(choice);
    if (choices.length)
      groups.push({ id, source, choose: choice.choose, options: choices });
  }
  selectedClass?.proficiency_choices?.forEach((choice, i) =>
    add(choice, `class-${i}`, "Classe"),
  );
  // The raw background API uses an array, whereas traits use a single choice.
  const backgroundChoices = background?.proficiency_choices;
  if (Array.isArray(backgroundChoices))
    backgroundChoices.forEach((choice, i) =>
      add(choice, `background-${i}`, "Antecedente"),
    );
  species?.traits.forEach((trait) => {
    if (trait.proficiency_choices)
      add(trait.proficiency_choices, `species-${trait.index}`, "Espécie");
  });
  return groups;
}
export function getFixedProficiencies(
  input: Pick<DraftInput, "classIndex" | "backgroundIndex">,
  catalogue: Catalogue,
): Reference[] {
  const refs = [
    ...(catalogue.classes.find((c) => c.index === input.classIndex)
      ?.proficiencies || []),
    ...(catalogue.backgrounds.find((b) => b.index === input.backgroundIndex)
      ?.proficiencies || []),
  ];
  return [...new Map(refs.map((ref) => [ref.index, ref])).values()];
}
export function deriveProficiencies(
  input: DraftInput,
  catalogue: Catalogue,
  modifiers: Scores,
) {
  const groups = getTrainingGroups(input, catalogue);
  const selected = input.proficiencySelections || {};
  if (
    Object.keys(selected).some((id) => !groups.some((group) => group.id === id))
  )
    throw Error("Escolha proficiências válidas para a origem atual.");
  const known = new Map(
    getFixedProficiencies(input, catalogue).map((ref) => [ref.index, ref]),
  );
  const pending: string[] = [];
  for (const group of groups) {
    const picks = selected[group.id] || [];
    if (picks.length > group.choose || new Set(picks).size !== picks.length)
      throw Error(
        "Escolha a quantidade correta de proficiências, sem repetir.",
      );
    for (const index of picks) {
      const ref = group.options.find((option) => option.index === index);
      if (!ref || known.has(index))
        throw Error(
          "Escolha proficiências disponíveis que você ainda não possui.",
        );
      known.set(index, ref);
    }
    if (picks.length < group.choose)
      pending.push(
        `${group.source}: escolher ${group.choose - picks.length} proficiência(s)`,
      );
  }
  const saves =
    catalogue.classes.find((c) => c.index === input.classIndex)
      ?.saving_throws || [];
  const savingThrows = Object.fromEntries(
    Object.keys(modifiers).map((key) => [
      key,
      {
        proficient: saves.some((save) => save.index.toUpperCase() === key),
        bonus:
          modifiers[key as Ability] +
          (saves.some((save) => save.index.toUpperCase() === key) ? 2 : 0),
      },
    ]),
  ) as Record<Ability, { proficient: boolean; bonus: number }>;
  const skills = (catalogue.skills || []).map((skill) => {
    const ability = skill.ability_score.index.toUpperCase() as Ability;
    const proficient = known.has("skill-" + skill.index);
    return {
      index: skill.index,
      name: skill.name,
      ability,
      proficient,
      bonus: modifiers[ability] + (proficient ? 2 : 0),
    };
  });
  return {
    proficiencies: [...known.values()],
    savingThrows,
    skills,
    passivePerception:
      10 +
      (skills.find((s) => s.index === "perception")?.bonus ?? modifiers.WIS),
    pending,
  };
}
