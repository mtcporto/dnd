export const classOrder = [
  "fighter",
  "wizard",
  "ranger",
  "rogue",
  "cleric",
  "paladin",
  "barbarian",
  "bard",
  "druid",
  "monk",
  "sorcerer",
  "warlock",
];
export interface ClassPresentation {
  title: string;
  description: string;
  approach: string;
  tags: string[];
  color: string;
  image: string;
  icon: string;
}
export const classPresentation: Record<string, ClassPresentation> = {
  fighter: {
    title: "A força de quem não recua.",
    description:
      "Disciplina, aço e domínio das armas. O guerreiro transforma treino em precisão e encontra seu lugar no centro da batalha.",
    approach: "Combate com armas · resistência · versatilidade",
    tags: ["Second Wind", "Weapon Mastery", "Fighting Style"],
    color: "#c59662",
    image: "fighter",
    icon: "M7 21 21 7M16 5l3-1 5 5-1 3M4 24l4-4M5 17l6 6",
  },
  wizard: {
    title: "O conhecimento é seu poder.",
    description:
      "Cada magia é uma descoberta. O mago estuda os mistérios do mundo e prepara os feitiços certos para mudar o rumo de uma aventura.",
    approach: "Magia preparada · grimório · possibilidades",
    tags: ["Spellcasting", "Ritual Adept", "Arcane Recovery"],
    color: "#9c89d3",
    image: "wizard",
    icon: "M14 3v22M9 8l5-5 5 5M6 18l-3 3 3 3M22 12l3 3-3 3M5 7h3M21 23h3",
  },
  ranger: {
    title: "A trilha termina onde você decide.",
    description:
      "Instinto, rastreamento e domínio do terreno. O patrulheiro une armas e magia da natureza para encontrar seu alvo e proteger o caminho.",
    approach: "Exploração · perseguição · armas e magia",
    tags: ["Favored Enemy", "Spellcasting", "Weapon Mastery"],
    color: "#7aab93",
    image: "ranger",
    icon: "M8 4c15 7 15 13 0 20M8 4v20M5 14h19M20 10l4 4-4 4",
  },
  rogue: {
    title: "Oportunidades não fazem barulho.",
    description:
      "Um passo à frente, um golpe no momento certo. O ladino usa perícia, sutileza e atenção para abrir caminhos que outros sequer percebem.",
    approach: "Precisão · furtividade · perícias",
    tags: ["Sneak Attack", "Expertise", "Thieves’ Cant"],
    color: "#99a4b8",
    image: "rogue",
    icon: "M5 23 21 7l3-3-1 8L9 26M8 16l6 6M4 26l4-4",
  },
  cleric: {
    title: "Sua fé ilumina o desconhecido.",
    description:
      "Um elo entre o sagrado e o mundo. O clérigo canaliza magia divina para apoiar aliados, enfrentar ameaças e seguir a vocação que o move.",
    approach: "Magia divina · apoio · vocação",
    tags: ["Spellcasting", "Divine Order"],
    color: "#d1b775",
    image: "cleric",
    icon: "M14 3v22M5 12h18M10 7h8M8 25h12M5 5l2 2M21 5l-2 2",
  },
  paladin: {
    title: "Um juramento. Uma direção.",
    description:
      "Armadura, convicção e magia divina. O paladino protege quem luta ao seu lado e transforma seus ideais em presença no campo de batalha.",
    approach: "Proteção · combate · magia divina",
    tags: ["Lay On Hands", "Spellcasting", "Weapon Mastery"],
    color: "#cbb37a",
    image: "paladin",
    icon: "M14 3 24 7v7c0 6-10 11-10 11S4 20 4 14V7ZM14 7v14M9 12h10",
  },
  barbarian: {
    title: "A fúria encontra um propósito.",
    description:
      "Força primal e coragem sem rodeios. O bárbaro entra na linha de frente com uma resistência marcada pela fúria e pelo instinto.",
    approach: "Fúria · força · linha de frente",
    tags: ["Rage", "Unarmored Defense", "Weapon Mastery"],
    color: "#bd845f",
    image: "barbarian",
    icon: "M8 25 21 4M12 7c8-6 13-2 13 6l-8-2M7 17l8 5M6 26l3-5",
  },
  bard: {
    title: "Sua história muda outras histórias.",
    description:
      "Palavras, música e magia que inspiram. O bardo encontra poder na expressão e faz da versatilidade sua companheira de viagem.",
    approach: "Inspiração · magia · expressão",
    tags: ["Bardic Inspiration", "Spellcasting"],
    color: "#c285a4",
    image: "bard",
    icon: "M18 3v14M18 3l5 2-5 3M16 13c-7-7-17 5-9 11s17-2 9-11Z",
  },
  druid: {
    title: "Escute o que a terra tem a dizer.",
    description:
      "A magia dos ciclos e das coisas vivas. O druida se conecta à natureza e aprende a guiar sua força para defender o equilíbrio.",
    approach: "Natureza · magia · sabedoria",
    tags: ["Spellcasting", "Druidic", "Primal Order"],
    color: "#8ca876",
    image: "druid",
    icon: "M22 4C7 2 2 12 8 20c8 6 17-1 14-16ZM6 25 19 9M11 18l-1-6M15 14l5 1",
  },
  monk: {
    title: "Corpo e mente, em movimento.",
    description:
      "Cada movimento nasce de disciplina. O monge desenvolve artes marciais e mobilidade, encontrando poder no próprio corpo.",
    approach: "Artes marciais · disciplina · mobilidade",
    tags: ["Martial Arts", "Unarmored Defense"],
    color: "#b99b69",
    image: "monk",
    icon: "M14 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM14 10v8M6 14l8-4 8 4M14 18l-7 7M14 18l7 7",
  },
  sorcerer: {
    title: "A magia sempre esteve em você.",
    description:
      "Um poder que não veio dos livros. O feiticeiro manifesta magia inata e aprende a dar forma à energia que carrega dentro de si.",
    approach: "Magia inata · presença · poder interior",
    tags: ["Spellcasting", "Innate Sorcery"],
    color: "#c78272",
    image: "sorcerer",
    icon: "M14 3c3 8 10 9 9 16-1 8-17 9-18 0-1-5 4-7 5-10 0 5 4 5 4-6ZM13 16c-5 6 5 10 5 4",
  },
  warlock: {
    title: "Há poder além do horizonte.",
    description:
      "Um pacto abre portas para o impossível. O bruxo recebe magia de uma fonte extraordinária e explora dons que fogem dos caminhos comuns.",
    approach: "Pactos · invocações · magia",
    tags: ["Pact Magic", "Eldritch Invocations"],
    color: "#8faf9b",
    image: "warlock",
    icon: "M3 14s5-8 11-8 11 8 11 8-5 8-11 8S3 14 3 14ZM14 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  },
};
