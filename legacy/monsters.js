// Banco de dados de monstros para o sistema de combate
const monsters = [
  {
    id: "goblin",
    name: "Goblin",
    challenge_rating: 0.25,
    hp: 7,
    ac: 15,
    stats: {
      str: 8,
      dex: 14,
      con: 10,
      int: 10,
      wis: 8,
      cha: 8
    },
    initiative_bonus: 2,
    attacks: [
      {
        name: "Cimitarra",
        attack_bonus: 4,
        damage_dice: "1d6",
        damage_bonus: 2,
        damage_type: "cortante"
      },
      {
        name: "Arco Curto",
        attack_bonus: 4,
        damage_dice: "1d6",
        damage_bonus: 2,
        damage_type: "perfurante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/351/1000/1000/636252777818652432.jpeg",
    description: "Goblins são pequenos humanoides de pele verde com olhos amarelos brilhantes. São conhecidos por sua covardia e táticas de emboscada."
  },
  {
    id: "skeleton",
    name: "Esqueleto",
    challenge_rating: 0.25,
    hp: 13,
    ac: 13,
    stats: {
      str: 10,
      dex: 14,
      con: 15,
      int: 6,
      wis: 8,
      cha: 5
    },
    initiative_bonus: 2,
    attacks: [
      {
        name: "Espada Curta",
        attack_bonus: 4,
        damage_dice: "1d6",
        damage_bonus: 2,
        damage_type: "perfurante"
      },
      {
        name: "Arco Curto",
        attack_bonus: 4,
        damage_dice: "1d6",
        damage_bonus: 2,
        damage_type: "perfurante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/213/1000/1000/636252764731637373.jpeg",
    description: "Esqueletos são os restos animados de mortos-vivos que seguem as ordens de necromantes malignos ou surgem em lugares imbuídos de magia da morte."
  },
  {
    id: "zombie",
    name: "Zumbi",
    challenge_rating: 0.25,
    hp: 22,
    ac: 8,
    stats: {
      str: 13,
      dex: 6,
      con: 16,
      int: 3,
      wis: 6,
      cha: 5
    },
    initiative_bonus: -2,
    attacks: [
      {
        name: "Pancada",
        attack_bonus: 3,
        damage_dice: "1d6",
        damage_bonus: 1,
        damage_type: "contundente"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/119/1000/1000/636252741877769042.jpeg",
    description: "Zumbis são criaturas sem mente que rastejam nas sombras de cemitérios ou vagam por pântanos, atacando qualquer criatura viva que encontram."
  },
  {
    id: "wolf",
    name: "Lobo",
    challenge_rating: 0.25,
    hp: 11,
    ac: 13,
    stats: {
      str: 12,
      dex: 15,
      con: 12,
      int: 3,
      wis: 12,
      cha: 6
    },
    initiative_bonus: 2,
    attacks: [
      {
        name: "Mordida",
        attack_bonus: 4,
        damage_dice: "2d4",
        damage_bonus: 2,
        damage_type: "perfurante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/16/482/1000/1000/636376300223855742.jpeg",
    description: "Lobos são predadores ferozes que caçam em matilhas e são conhecidos por sua inteligência e trabalho em equipe."
  },
  {
    id: "orc",
    name: "Orc",
    challenge_rating: 0.5,
    hp: 15,
    ac: 13,
    stats: {
      str: 16,
      dex: 12,
      con: 16,
      int: 7,
      wis: 11,
      cha: 10
    },
    initiative_bonus: 1,
    attacks: [
      {
        name: "Machado Grande",
        attack_bonus: 5,
        damage_dice: "1d12",
        damage_bonus: 3,
        damage_type: "cortante"
      },
      {
        name: "Lança",
        attack_bonus: 5,
        damage_dice: "1d6",
        damage_bonus: 3,
        damage_type: "perfurante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/301/1000/1000/636252771691385727.jpeg",
    description: "Orcs são humanoides selvagens e brutais com faces semelhantes a porcos, conhecidos por sua ferocidade em batalha e ódio por outras raças."
  },
  {
    id: "giant_spider",
    name: "Aranha Gigante",
    challenge_rating: 1,
    hp: 26,
    ac: 14,
    stats: {
      str: 14,
      dex: 16,
      con: 12,
      int: 2,
      wis: 11,
      cha: 4
    },
    initiative_bonus: 3,
    attacks: [
      {
        name: "Mordida",
        attack_bonus: 5,
        damage_dice: "1d8",
        damage_bonus: 3,
        damage_type: "perfurante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/323/1000/1000/636252775648743317.jpeg",
    description: "Aranhas gigantes tecem teias em cavernas escuras e florestas densas, capturando presas desavisadas em suas armadilhas pegajosas."
  },
  {
    id: "dire_wolf",
    name: "Lobo Atroz",
    challenge_rating: 1,
    hp: 37,
    ac: 14,
    stats: {
      str: 17,
      dex: 15,
      con: 15,
      int: 3,
      wis: 12,
      cha: 7
    },
    initiative_bonus: 2,
    attacks: [
      {
        name: "Mordida",
        attack_bonus: 5,
        damage_dice: "2d6",
        damage_bonus: 3,
        damage_type: "perfurante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/16/484/1000/1000/636376302568959523.jpeg",
    description: "Lobos atrozes são versões maiores e mais ferozes dos lobos comuns, frequentemente usados como montarias por goblins e orcs."
  },
  {
    id: "ogre",
    name: "Ogro",
    challenge_rating: 2,
    hp: 59,
    ac: 11,
    stats: {
      str: 19,
      dex: 8,
      con: 16,
      int: 5,
      wis: 7,
      cha: 7
    },
    initiative_bonus: -1,
    attacks: [
      {
        name: "Clava Gigante",
        attack_bonus: 6,
        damage_dice: "2d8",
        damage_bonus: 4,
        damage_type: "contundente"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/285/1000/1000/636252770535203221.jpeg",
    description: "Ogros são humanoides gigantes e brutamontes que confiam em sua força bruta para resolver problemas e conseguir comida."
  },
  {
    id: "owlbear",
    name: "Urso-Coruja",
    challenge_rating: 3,
    hp: 59,
    ac: 13,
    stats: {
      str: 20,
      dex: 12,
      con: 17,
      int: 3,
      wis: 12,
      cha: 7
    },
    initiative_bonus: 1,
    attacks: [
      {
        name: "Bico",
        attack_bonus: 7,
        damage_dice: "1d10",
        damage_bonus: 5,
        damage_type: "perfurante"
      },
      {
        name: "Garras",
        attack_bonus: 7,
        damage_dice: "2d8",
        damage_bonus: 5,
        damage_type: "cortante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/315/1000/1000/636252772225295187.jpeg",
    description: "Ursos-coruja são monstruosidades ferozes que combinam características de ursos e corujas, conhecidos por seu temperamento agressivo e territorialismo."
  },
  {
    id: "troll",
    name: "Troll",
    challenge_rating: 5,
    hp: 84,
    ac: 15,
    stats: {
      str: 18,
      dex: 13,
      con: 20,
      int: 7,
      wis: 9,
      cha: 7
    },
    initiative_bonus: 1,
    attacks: [
      {
        name: "Mordida",
        attack_bonus: 7,
        damage_dice: "1d6",
        damage_bonus: 4,
        damage_type: "perfurante"
      },
      {
        name: "Garras",
        attack_bonus: 7,
        damage_dice: "2d6",
        damage_bonus: 4,
        damage_type: "cortante"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/103/1000/1000/636252741877684245.jpeg",
    description: "Trolls são gigantes horrendos com pele esverdeada e regeneração rápida. Apenas fogo ou ácido podem impedir que um troll se regenere."
  },
  {
    id: "young_dragon",
    name: "Dragão Jovem Vermelho",
    challenge_rating: 10,
    hp: 178,
    ac: 18,
    stats: {
      str: 23,
      dex: 10,
      con: 21,
      int: 14,
      wis: 11,
      cha: 19
    },
    initiative_bonus: 0,
    attacks: [
      {
        name: "Mordida",
        attack_bonus: 10,
        damage_dice: "2d10",
        damage_bonus: 6,
        damage_type: "perfurante"
      },
      {
        name: "Garras",
        attack_bonus: 10,
        damage_dice: "2d6",
        damage_bonus: 6,
        damage_type: "cortante"
      },
      {
        name: "Sopro de Fogo (Recarga 5-6)",
        attack_bonus: 0,
        damage_dice: "16d6",
        damage_bonus: 0,
        damage_type: "fogo",
        special: "Teste de Resistência de Destreza CD 17 para metade do dano"
      }
    ],
    image_url: "https://www.dndbeyond.com/avatars/thumbnails/0/239/1000/1000/636252767319464533.jpeg",
    description: "Dragões vermelhos são os mais gananciosos, violentos e temperamentais dos dragões cromáticos. Eles respiram fogo e habitam vulcões e montanhas."
  }
];

// Função para selecionar um monstro apropriado para o nível do personagem
function selectMonsterForLevel(level) {
  // Definir faixas de ND (Nível de Desafio) apropriadas para cada nível de personagem
  // Ajustado para garantir que os monstros sejam do mesmo nível ou no máximo +1
  let appropriateCRs;
  
  if (level <= 2) {
    appropriateCRs = [0.25, 0.5];
  } else if (level <= 4) {
    appropriateCRs = [0.5, 1];
  } else if (level <= 6) {
    appropriateCRs = [1, 2];
  } else if (level <= 8) {
    appropriateCRs = [2, 3];
  } else if (level <= 10) {
    appropriateCRs = [3, 5];
  } else if (level <= 15) {
    appropriateCRs = [5, 7];
  } else {
    appropriateCRs = [7, 10];
  }
  
  // Filtrar monstros com ND apropriado
  const appropriateMonsters = monsters.filter(monster => 
    appropriateCRs.includes(monster.challenge_rating)
  );
  
  // Se não houver monstros apropriados, retornar o monstro de menor ND
  if (appropriateMonsters.length === 0) {
    return monsters.sort((a, b) => a.challenge_rating - b.challenge_rating)[0];
  }
  
  // Selecionar um monstro aleatório da lista de monstros apropriados
  const randomIndex = Math.floor(Math.random() * appropriateMonsters.length);
  return appropriateMonsters[randomIndex];
}

// Função para calcular o modificador de atributo
function calculateModifier(attributeValue) {
  return Math.floor((attributeValue - 10) / 2);
}

// Função para rolar dados (ex: "2d6+3")
function rollDice(diceNotation) {
  // Separar a notação em partes (número de dados, faces, modificador)
  const regex = /(\d+)d(\d+)(?:([+-])(\d+))?/;
  const match = diceNotation.match(regex);
  
  if (!match) {
    return 0;
  }
  
  const numDice = parseInt(match[1]);
  const numFaces = parseInt(match[2]);
  const operator = match[3] || '+';
  const modifier = match[4] ? parseInt(match[4]) : 0;
  
  // Rolar os dados
  let total = 0;
  for (let i = 0; i < numDice; i++) {
    total += Math.floor(Math.random() * numFaces) + 1;
  }
  
  // Aplicar o modificador
  if (operator === '+') {
    total += modifier;
  } else if (operator === '-') {
    total -= modifier;
  }
  
  return total;
}

// Adicionar esta função
function getCorrectImageUrl(monsterName, originalUrl) {
  // Mapeamento de URLs corretas conhecidas
  const imageUrlMap = {
    'zombie': 'https://www.dndbeyond.com/avatars/thumbnails/47005/522/1000/1000/638736718981177990.jpeg',
    'zumbi': 'https://www.dndbeyond.com/avatars/thumbnails/47005/522/1000/1000/638736718981177990.jpeg',
    'skeleton': 'https://www.dndbeyond.com/avatars/thumbnails/30835/849/1000/1000/638063922565505819.png',
    'esqueleto': 'https://www.dndbeyond.com/avatars/thumbnails/30835/849/1000/1000/638063922565505819.png',
    'wolf': 'https://www.dndbeyond.com/avatars/thumbnails/16/482/1000/1000/636376300223855327.jpeg',
    'lobo': 'https://www.dndbeyond.com/avatars/thumbnails/16/482/1000/1000/636376300223855327.jpeg',
    'goblin': 'https://www.dndbeyond.com/avatars/thumbnails/30783/955/1000/1000/638062024584880857.png',
    'orc': 'https://www.dndbeyond.com/avatars/thumbnails/30834/160/1000/1000/638063882785865067.png'
  };
  
  // Converter nome do monstro para lowercase para comparação
  const normalizedName = monsterName.toLowerCase();
  
  // Se temos um URL conhecido para este monstro, usar ele
  if (imageUrlMap[normalizedName]) {
    return imageUrlMap[normalizedName];
  }
  
  // Se o URL original aparenta ser da dndbeyond e contém problemas conhecidos
  if (originalUrl && originalUrl.includes('dndbeyond.com') && 
      (originalUrl.includes('636252') || originalUrl.includes('636376'))) {
    // Tentar URL alternativo baseado no padrão que funciona
    return `https://www.dndbeyond.com/avatars/thumbnails/${normalizedName.toLowerCase()}.png`;
  }
  
  // Se nada der certo, retornar o URL original
  return originalUrl;
}

// Exportar as funções e dados para uso em outros arquivos
if (typeof module !== 'undefined') {
  module.exports = {
    monsters,
    selectMonsterForLevel,
    calculateModifier,
    rollDice
  };
}
