import "server-only";
import data from "@/data/catalogue.json";
import type { Catalogue } from "@/domain/character";
export const catalogue = data as unknown as Catalogue;

export function getBuilderCatalogue(): Catalogue {
  const reference = (entry: {
    index: string;
    name: string;
    desc?: string[];
  }) => ({ index: entry.index, name: entry.name, desc: entry.desc });
  return {
    edition: catalogue.edition,
    srdVersion: catalogue.srdVersion,
    importedAt: catalogue.importedAt,
    classes: catalogue.classes.map((entry) => ({
      index: entry.index,
      name: entry.name,
      hit_die: entry.hit_die,
      primary_ability: entry.primary_ability,
      proficiencies: entry.proficiencies?.map(reference),
      proficiency_choices: entry.proficiency_choices,
      saving_throws: entry.saving_throws?.map(reference),
      levelOne: { features: entry.levelOne.features.map(reference) },
    })),
    species: catalogue.species.map((entry) => ({
      index: entry.index,
      name: entry.name,
      speed: entry.speed,
      size: entry.size,
      traits: entry.traits.map((trait) => ({
        ...reference(trait),
        proficiency_choices: trait.proficiency_choices,
      })),
    })),
    backgrounds: catalogue.backgrounds.map((entry) => ({
      index: entry.index,
      name: entry.name,
      ability_scores: entry.ability_scores.map(reference),
      feat: reference(entry.feat),
      proficiencies: entry.proficiencies.map(reference),
      proficiency_choices: entry.proficiency_choices,
    })),
    skills: catalogue.skills?.map((skill) => ({
      ...reference(skill),
      ability_score: reference(skill.ability_score),
    })),
  };
}
