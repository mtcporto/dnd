export const classNames: Record<string, string> = {
  barbarian: "Bárbaro",
  bard: "Bardo",
  cleric: "Clérigo",
  druid: "Druida",
  fighter: "Guerreiro",
  monk: "Monge",
  paladin: "Paladino",
  ranger: "Patrulheiro",
  rogue: "Ladino",
  sorcerer: "Feiticeiro",
  warlock: "Bruxo",
  wizard: "Mago",
};
export const speciesNames: Record<string, string> = {
  dragonborn: "Draconato",
  dwarf: "Anão",
  elf: "Elfo",
  gnome: "Gnomo",
  goliath: "Goliath",
  halfling: "Halfling",
  human: "Humano",
  orc: "Orc",
  tiefling: "Tiefling",
};
export const backgroundNames: Record<string, string> = {
  acolyte: "Acólito",
  criminal: "Criminoso",
  sage: "Sábio",
  soldier: "Soldado",
};
export const abilityNames: Record<string, string> = {
  STR: "Força",
  DEX: "Destreza",
  CON: "Constituição",
  INT: "Inteligência",
  WIS: "Sabedoria",
  CHA: "Carisma",
};

export const skillNames: Record<string, string> = {
  acrobatics: "Acrobacia",
  "animal-handling": "Lidar com Animais",
  arcana: "Arcanismo",
  athletics: "Atletismo",
  deception: "Enganação",
  history: "História",
  insight: "Intuição",
  intimidation: "Intimidação",
  investigation: "Investigação",
  medicine: "Medicina",
  nature: "Natureza",
  perception: "Percepção",
  performance: "Atuação",
  persuasion: "Persuasão",
  religion: "Religião",
  "sleight-of-hand": "Prestidigitação",
  stealth: "Furtividade",
  survival: "Sobrevivência",
};
export function proficiencyName(index: string, name: string): string {
  return (
    skillNames[index.replace(/^skill-/, "")] ||
    name.replace(/^(Skill|Tool|Perícia|Ferramenta|Habilidad|Herramienta): /, "")
  );
}
