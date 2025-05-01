// Sistema de recompensas e progressão para D&D 5e

// Tabela de XP por nível
const XP_LEVELS = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
};

// Tabela de multiplicadores de XP baseado no nível do monstro em relação ao personagem
const XP_MULTIPLIERS = {
  much_weaker: 0.25,  // Monstro muito mais fraco (CR < nível/2)
  weaker: 0.5,        // Monstro mais fraco (CR < nível)
  equal: 1.0,         // Monstro de nível equivalente (CR = nível)
  stronger: 1.5,      // Monstro mais forte (CR > nível)
  much_stronger: 2.0  // Monstro muito mais forte (CR > nível*2)
};

// Tabela de recompensas de moedas por nível de desafio (CR)
const COIN_REWARDS = {
  0: { copper: 50, silver: 0, gold: 0 },
  0.25: { copper: 100, silver: 5, gold: 0 },
  0.5: { copper: 150, silver: 10, gold: 0 },
  1: { copper: 200, silver: 15, gold: 0 },
  2: { copper: 100, silver: 30, gold: 5 },
  3: { copper: 50, silver: 40, gold: 10 },
  4: { copper: 0, silver: 50, gold: 15 },
  5: { copper: 0, silver: 25, gold: 25 },
  6: { copper: 0, silver: 0, gold: 50 },
  7: { copper: 0, silver: 0, gold: 75 },
  8: { copper: 0, silver: 0, gold: 100 },
  9: { copper: 0, silver: 0, gold: 125 },
  10: { copper: 0, silver: 0, gold: 150 },
  11: { copper: 0, silver: 0, gold: 200 },
  12: { copper: 0, silver: 0, gold: 250 },
  13: { copper: 0, silver: 0, gold: 300 },
  14: { copper: 0, silver: 0, gold: 350 },
  15: { copper: 0, silver: 0, gold: 400 },
  16: { copper: 0, silver: 0, gold: 500 },
  17: { copper: 0, silver: 0, gold: 600 },
  18: { copper: 0, silver: 0, gold: 700 },
  19: { copper: 0, silver: 0, gold: 800 },
  20: { copper: 0, silver: 0, gold: 1000 }
};

// Lista de itens possíveis como recompensa
const ITEM_REWARDS = {
  common: [
    { name: "Poção de Cura", description: "Restaura 2d4+2 pontos de vida", type: "consumable" },
    { name: "Flechas +1 (5)", description: "Flechas com bônus de +1 para ataque e dano", type: "ammunition" },
    { name: "Antídoto", description: "Cura envenenamento", type: "consumable" },
    { name: "Ração de Viagem (5)", description: "Comida para 5 dias de viagem", type: "consumable" },
    { name: "Corda Élfica", description: "Corda resistente e leve, 15m", type: "gear" }
  ],
  uncommon: [
    { name: "Poção de Cura Maior", description: "Restaura 4d4+4 pontos de vida", type: "consumable" },
    { name: "Pergaminho de Magia (nível 1)", description: "Contém uma magia de nível 1 aleatória", type: "scroll" },
    { name: "Amuleto de Proteção +1", description: "Concede +1 de CA", type: "wearable" },
    { name: "Botas Élficas", description: "Concede vantagem em testes de Furtividade", type: "wearable" },
    { name: "Bolsa de Truques", description: "Contém pequenos objetos mágicos", type: "wondrous" }
  ],
  rare: [
    { name: "Poção de Cura Superior", description: "Restaura 8d4+8 pontos de vida", type: "consumable" },
    { name: "Pergaminho de Magia (nível 3)", description: "Contém uma magia de nível 3 aleatória", type: "scroll" },
    { name: "Arma +1", description: "Concede +1 em jogadas de ataque e dano", type: "weapon" },
    { name: "Armadura +1", description: "Concede +1 de CA além do normal", type: "armor" },
    { name: "Anel de Proteção", description: "Concede +1 em CA e testes de resistência", type: "wearable" }
  ],
  very_rare: [
    { name: "Poção de Cura Suprema", description: "Restaura 10d4+20 pontos de vida", type: "consumable" },
    { name: "Pergaminho de Magia (nível 5)", description: "Contém uma magia de nível 5 aleatória", type: "scroll" },
    { name: "Arma +2", description: "Concede +2 em jogadas de ataque e dano", type: "weapon" },
    { name: "Armadura +2", description: "Concede +2 de CA além do normal", type: "armor" },
    { name: "Capa de Proteção", description: "Concede +1 em CA e testes de resistência", type: "wearable" }
  ],
  legendary: [
    { name: "Poção de Vida", description: "Restaura todos os pontos de vida", type: "consumable" },
    { name: "Pergaminho de Magia (nível 7)", description: "Contém uma magia de nível 7 aleatória", type: "scroll" },
    { name: "Arma +3", description: "Concede +3 em jogadas de ataque e dano", type: "weapon" },
    { name: "Armadura +3", description: "Concede +3 de CA além do normal", type: "armor" },
    { name: "Anel de Resistência a Dano", description: "Concede resistência a um tipo de dano", type: "wearable" }
  ]
};

// Função para calcular XP baseado no nível do personagem e do monstro
function calculateXP(characterLevel, monsterCR) {
  // Base XP do monstro baseado no CR
  const baseXP = getBaseXP(monsterCR);
  
  // Determinar o multiplicador baseado na diferença de nível
  let multiplier;
  if (monsterCR < characterLevel / 2) {
    multiplier = XP_MULTIPLIERS.much_weaker;
  } else if (monsterCR < characterLevel) {
    multiplier = XP_MULTIPLIERS.weaker;
  } else if (monsterCR === characterLevel) {
    multiplier = XP_MULTIPLIERS.equal;
  } else if (monsterCR <= characterLevel * 2) {
    multiplier = XP_MULTIPLIERS.stronger;
  } else {
    multiplier = XP_MULTIPLIERS.much_stronger;
  }
  
  // Calcular XP final
  return Math.floor(baseXP * multiplier);
}

// Função para obter XP base por CR
function getBaseXP(cr) {
  const xpTable = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900,
    11: 7200,
    12: 8400,
    13: 10000,
    14: 11500,
    15: 13000,
    16: 15000,
    17: 18000,
    18: 20000,
    19: 22000,
    20: 25000,
    21: 33000,
    22: 41000,
    23: 50000,
    24: 62000,
    25: 75000,
    26: 90000,
    27: 105000,
    28: 120000,
    29: 135000,
    30: 155000
  };
  
  // Se o CR exato não existir, usar o mais próximo
  if (xpTable[cr] !== undefined) {
    return xpTable[cr];
  } else {
    // Encontrar o CR mais próximo
    const crs = Object.keys(xpTable).map(Number).sort((a, b) => a - b);
    let closest = crs[0];
    
    for (const currentCR of crs) {
      if (Math.abs(currentCR - cr) < Math.abs(closest - cr)) {
        closest = currentCR;
      }
    }
    
    return xpTable[closest];
  }
}

// Função para calcular recompensas de moedas
function calculateCoinRewards(monsterCR) {
  // Encontrar o CR mais próximo na tabela
  const crs = Object.keys(COIN_REWARDS).map(Number).sort((a, b) => a - b);
  let closest = crs[0];
  
  for (const cr of crs) {
    if (Math.abs(cr - monsterCR) < Math.abs(closest - monsterCR)) {
      closest = cr;
    }
  }
  
  // Adicionar variação aleatória (±20%)
  const baseReward = COIN_REWARDS[closest];
  const variation = 0.8 + (Math.random() * 0.4); // Entre 0.8 e 1.2
  
  return {
    copper: Math.floor(baseReward.copper * variation),
    silver: Math.floor(baseReward.silver * variation),
    gold: Math.floor(baseReward.gold * variation)
  };
}

// Melhorar a função selectItemRewards para garantir itens apropriados
function selectItemRewards(monsterCR) {
  // Determinar quantos itens podem ser dropados baseado no CR
  let itemCount = 0;
  if (monsterCR <= 1) {
    // 50% de chance de dropar 1 item para monstros fracos
    itemCount = Math.random() < 0.5 ? 1 : 0;
  } else if (monsterCR <= 5) {
    // 1-2 itens para monstros médios
    itemCount = Math.floor(Math.random() * 2) + 1;
  } else if (monsterCR <= 10) {
    // 2-3 itens para monstros fortes
    itemCount = Math.floor(Math.random() * 2) + 2;
  } else {
    // 3-4 itens para monstros muito fortes
    itemCount = Math.floor(Math.random() * 2) + 3;
  }
  
  // Se não houver itens, retornar array vazio
  if (itemCount === 0) {
    return [];
  }
  
  // Lista de itens comuns que podem ser dropados por qualquer monstro
  const commonItems = [
    { name: 'Poção de Cura', type: 'consumable', rarity: 'common', description: 'Recupera 2d4+2 pontos de vida.' },
    { name: 'Pergaminho de Identificação', type: 'scroll', rarity: 'common', description: 'Permite lançar a magia Identificação uma vez.' },
    { name: 'Flauta', type: 'gear', rarity: 'common', description: 'Um instrumento musical comum.' },
    { name: 'Corda (15m)', type: 'gear', rarity: 'common', description: 'Uma corda resistente de 15 metros.' }
  ];
  
  // Selecionar itens aleatórios
  const rewards = [];
  for (let i = 0; i < itemCount; i++) {
    rewards.push(commonItems[Math.floor(Math.random() * commonItems.length)]);
  }
  
  return rewards;
}

// Corrigir a função checkLevelUp
function checkLevelUp(character, xpGained) {
  const currentXP = character.xp || 0;
  const newXP = currentXP + xpGained;
  const currentLevel = character.level;
  
  // Verificar se o novo XP é suficiente para subir de nível
  let newLevel = currentLevel;
  let leveledUp = false;
  
  // Verificar se há XP suficiente para o próximo nível
  for (let level = currentLevel + 1; level <= 20; level++) {
    const xpRequired = XP_LEVELS[level];
    if (newXP >= xpRequired) {
      newLevel = level;
      leveledUp = true;
    } else {
      break;
    }
  }
  
  return {
    oldLevel: currentLevel,
    newLevel: newLevel,
    leveledUp: leveledUp,
    xpBefore: currentXP,
    xpAfter: newXP
  };
}

// Corrigir a função applyRewards
function applyRewards(character, xpGained, coinRewards, itemRewards, levelInfo) {
  // Adicionar XP
  character.xp = (character.xp || 0) + xpGained;
  console.log(`XP atualizado: ${character.xp}`);
  
  // Atualizar nível se necessário
  if (levelInfo.leveledUp) {
    character.level = levelInfo.newLevel;
    console.log(`Novo nível: ${character.level}`);
    
    // Atualizar pontos de vida se subiu de nível
    const hpPerLevel = getHPPerLevel(character.class);
    character.hp_max += hpPerLevel;
    character.hp_current = character.hp_max; // Restaurar vida ao subir de nível
    console.log(`HP atualizado: ${character.hp_current}/${character.hp_max}`);
  }
  
  // Adicionar moedas
  character.gold = (character.gold || 0) + coinRewards.gold;
  character.silver = (character.silver || 0) + coinRewards.silver;
  character.copper = (character.copper || 0) + coinRewards.copper;
  console.log(`Moedas atualizadas: ${character.gold} ouro, ${character.silver} prata, ${character.copper} cobre`);
  
  // Adicionar itens ao inventário
  if (!character.equipment) {
    character.equipment = [];
  }
  
  itemRewards.forEach(item => {
    character.equipment.push(item.name);
  });
  
  console.log(`Equipamentos atualizados: ${character.equipment}`);
  
  return character;
}

// Adicionar função helper para calcular HP por nível
function getHPPerLevel(characterClass) {
  switch (characterClass.toLowerCase()) {
    case 'barbarian':
      return 12;
    case 'fighter':
    case 'paladin':
    case 'ranger':
      return 10;
    case 'cleric':
    case 'druid':
    case 'monk':
    case 'rogue':
    case 'warlock':
      return 8;
    case 'bard':
    case 'sorcerer':
    case 'wizard':
      return 6;
    default:
      return 8;
  }
}

// Função para obter novas habilidades ao subir de nível
function getNewAbilities(characterClass, oldLevel, newLevel) {
  const newAbilities = [];
  
  // Definir habilidades por classe e nível
  const classAbilities = {
    barbarian: {
      2: ["Fúria Indomável", "Ataque Descuidado"],
      3: ["Caminho Primitivo"],
      4: ["Incremento de Habilidade"],
      5: ["Ataque Extra", "Movimento Rápido"],
      6: ["Característica de Caminho"],
      7: ["Instinto Selvagem"],
      8: ["Incremento de Habilidade"],
      9: ["Crítico Brutal"],
      10: ["Característica de Caminho"],
      11: ["Fúria Implacável"],
      12: ["Incremento de Habilidade"],
      13: ["Crítico Brutal (2)"],
      14: ["Característica de Caminho"],
      15: ["Fúria Persistente"],
      16: ["Incremento de Habilidade"],
      17: ["Crítico Brutal (3)"],
      18: ["Força Indomável"],
      19: ["Incremento de Habilidade"],
      20: ["Campeão Primitivo"]
    },
    bard: {
      2: ["Canção de Descanso", "Inspiração de Bardo (d6)"],
      3: ["Colégio de Bardo", "Aptidão"],
      4: ["Incremento de Habilidade"],
      5: ["Inspiração de Bardo (d8)", "Fonte de Inspiração"],
      6: ["Contramágica", "Característica de Colégio"],
      7: [],
      8: ["Incremento de Habilidade"],
      9: ["Canção de Cura"],
      10: ["Inspiração de Bardo (d10)", "Aptidão", "Segredos Mágicos"],
      11: [],
      12: ["Incremento de Habilidade"],
      13: ["Canção de Descanso (d8)"],
      14: ["Característica de Colégio", "Segredos Mágicos"],
      15: ["Inspiração de Bardo (d12)"],
      16: ["Incremento de Habilidade"],
      17: ["Canção de Descanso (d10)"],
      18: ["Segredos Mágicos"],
      19: ["Incremento de Habilidade"],
      20: ["Inspiração Superior"]
    },
    cleric: {
      2: ["Canalizar Divindade (1/descanso)", "Característica de Domínio"],
      3: [],
      4: ["Incremento de Habilidade"],
      5: ["Destruir Mortos-Vivos (CR 1/2)"],
      6: ["Canalizar Divindade (2/descanso)", "Característica de Domínio"],
      7: [],
      8: ["Incremento de Habilidade", "Destruir Mortos-Vivos (CR 1)", "Característica de Domínio"],
      9: [],
      10: ["Intervenção Divina"],
      11: ["Destruir Mortos-Vivos (CR 2)"],
      12: ["Incremento de Habilidade"],
      13: [],
      14: ["Destruir Mortos-Vivos (CR 3)"],
      15: [],
      16: ["Incremento de Habilidade"],
      17: ["Destruir Mortos-Vivos (CR 4)", "Característica de Domínio"],
      18: ["Canalizar Divindade (3/descanso)"],
      19: ["Incremento de Habilidade"],
      20: ["Intervenção Divina Aprimorada"]
    },
    druid: {
      2: ["Forma Selvagem", "Característica de Círculo"],
      3: [],
      4: ["Incremento de Habilidade", "Forma Selvagem Aprimorada"],
      5: [],
      6: ["Característica de Círculo"],
      7: [],
      8: ["Incremento de Habilidade", "Forma Selvagem Aprimorada"],
      9: [],
      10: ["Característica de Círculo"],
      11: [],
      12: ["Incremento de Habilidade"],
      13: [],
      14: ["Característica de Círculo"],
      15: [],
      16: ["Incremento de Habilidade"],
      17: [],
      18: ["Corpo Atemporal", "Conjuração Bestial"],
      19: ["Incremento de Habilidade"],
      20: ["Arquidruida"]
    },
    fighter: {
      2: ["Surto de Ação (1/descanso)", "Estilo de Luta"],
      3: ["Arquétipo Marcial"],
      4: ["Incremento de Habilidade"],
      5: ["Ataque Extra (1)"],
      6: ["Incremento de Habilidade"],
      7: ["Característica de Arquétipo"],
      8: ["Incremento de Habilidade"],
      9: ["Indomável (1/descanso)"],
      10: ["Característica de Arquétipo"],
      11: ["Ataque Extra (2)"],
      12: ["Incremento de Habilidade"],
      13: ["Indomável (2/descanso)"],
      14: ["Incremento de Habilidade"],
      15: ["Característica de Arquétipo"],
      16: ["Incremento de Habilidade"],
      17: ["Surto de Ação (2/descanso)", "Indomável (3/descanso)"],
      18: ["Característica de Arquétipo"],
      19: ["Incremento de Habilidade"],
      20: ["Ataque Extra (3)"]
    },
    monk: {
      2: ["Defesa sem Armadura", "Movimento sem Armadura"],
      3: ["Tradição Monástica", "Rajada de Golpes"],
      4: ["Incremento de Habilidade", "Queda Lenta"],
      5: ["Ataque Extra", "Ataque Atordoante"],
      6: ["Característica de Tradição", "Golpes Potencializados"],
      7: ["Evasão", "Mente Tranquila"],
      8: ["Incremento de Habilidade"],
      9: ["Movimento sem Armadura Aprimorado"],
      10: ["Pureza Corporal"],
      11: ["Característica de Tradição"],
      12: ["Incremento de Habilidade"],
      13: ["Idioma do Sol e da Lua"],
      14: ["Alma de Diamante"],
      15: ["Mente Atemporal"],
      16: ["Incremento de Habilidade"],
      17: ["Característica de Tradição"],
      18: ["Corpo Vazio"],
      19: ["Incremento de Habilidade"],
      20: ["Self Perfeito"]
    },
    paladin: {
      2: ["Estilo de Luta", "Conjuração", "Destruição Divina"],
      3: ["Juramento Sagrado", "Cura pelas Mãos"],
      4: ["Incremento de Habilidade"],
      5: ["Ataque Extra"],
      6: ["Aura de Proteção"],
      7: ["Característica de Juramento"],
      8: ["Incremento de Habilidade"],
      9: [],
      10: ["Aura de Coragem"],
      11: ["Destruição Divina Aprimorada"],
      12: ["Incremento de Habilidade"],
      13: [],
      14: ["Toque Purificador"],
      15: ["Característica de Juramento"],
      16: ["Incremento de Habilidade"],
      17: [],
      18: ["Auras Aprimoradas"],
      19: ["Incremento de Habilidade"],
      20: ["Característica de Juramento"]
    },
    ranger: {
      2: ["Estilo de Luta", "Conjuração"],
      3: ["Arquétipo de Patrulheiro", "Consciência Primitiva"],
      4: ["Incremento de Habilidade"],
      5: ["Ataque Extra"],
      6: ["Característica de Arquétipo"],
      7: ["Caminhante da Natureza"],
      8: ["Incremento de Habilidade", "Atravessar Terreno"],
      9: [],
      10: ["Esconder-se à Vista", "Característica de Arquétipo"],
      11: ["Característica de Arquétipo"],
      12: ["Incremento de Habilidade"],
      13: [],
      14: ["Desaparecimento"],
      15: ["Característica de Arquétipo"],
      16: ["Incremento de Habilidade"],
      17: [],
      18: ["Sentidos Selvagens"],
      19: ["Incremento de Habilidade"],
      20: ["Matador de Inimigos"]
    },
    rogue: {
      2: ["Ação Astuta"],
      3: ["Arquétipo de Ladino"],
      4: ["Incremento de Habilidade"],
      5: ["Esquiva Sobrenatural"],
      6: ["Aptidão"],
      7: ["Evasão"],
      8: ["Incremento de Habilidade"],
      9: ["Característica de Arquétipo"],
      10: ["Incremento de Habilidade"],
      11: ["Talento Confiável"],
      12: ["Incremento de Habilidade"],
      13: ["Característica de Arquétipo"],
      14: ["Sentido Cego"],
      15: ["Mente Escorregadia"],
      16: ["Incremento de Habilidade"],
      17: ["Característica de Arquétipo"],
      18: ["Esquiva Aprimorada"],
      19: ["Incremento de Habilidade"],
      20: ["Golpe de Sorte"]
    },
    sorcerer: {
      2: ["Fonte de Magia"],
      3: ["Metamagia"],
      4: ["Incremento de Habilidade"],
      5: [],
      6: ["Característica de Origem Mágica"],
      7: [],
      8: ["Incremento de Habilidade"],
      9: [],
      10: ["Metamagia"],
      11: [],
      12: ["Incremento de Habilidade"],
      13: [],
      14: ["Característica de Origem Mágica"],
      15: [],
      16: ["Incremento de Habilidade"],
      17: ["Metamagia"],
      18: ["Característica de Origem Mágica"],
      19: ["Incremento de Habilidade"],
      20: ["Restauração Mágica"]
    },
    warlock: {
      2: ["Invocações Místicas"],
      3: ["Dádiva do Patrono"],
      4: ["Incremento de Habilidade"],
      5: [],
      6: ["Característica de Patrono"],
      7: [],
      8: ["Incremento de Habilidade"],
      9: [],
      10: ["Característica de Patrono"],
      11: ["Arcana Mística (6º nível)"],
      12: ["Incremento de Habilidade"],
      13: ["Arcana Mística (7º nível)"],
      14: ["Característica de Patrono"],
      15: ["Arcana Mística (8º nível)"],
      16: ["Incremento de Habilidade"],
      17: ["Arcana Mística (9º nível)"],
      18: [],
      19: ["Incremento de Habilidade"],
      20: ["Mestre Místico"]
    },
    wizard: {
      2: ["Tradição Arcana"],
      3: [],
      4: ["Incremento de Habilidade"],
      5: [],
      6: ["Característica de Tradição Arcana"],
      7: [],
      8: ["Incremento de Habilidade"],
      9: [],
      10: ["Característica de Tradição Arcana"],
      11: [],
      12: ["Incremento de Habilidade"],
      13: [],
      14: ["Característica de Tradição Arcana"],
      15: [],
      16: ["Incremento de Habilidade"],
      17: [],
      18: ["Domínio de Magia"],
      19: ["Incremento de Habilidade"],
      20: ["Assinatura Mágica"]
    }
  };
  
  // Verificar se a classe existe
  const lowerClass = characterClass.toLowerCase();
  if (!classAbilities[lowerClass]) {
    return newAbilities;
  }
  
  // Adicionar habilidades para cada nível ganho
  for (let level = oldLevel + 1; level <= newLevel; level++) {
    if (classAbilities[lowerClass][level]) {
      classAbilities[lowerClass][level].forEach(ability => {
        newAbilities.push({
          name: ability,
          level: level,
          class: characterClass
        });
      });
    }
  }
  
  return newAbilities;
}

// Função para obter novas magias ao subir de nível
async function getNewSpells(characterClass, oldLevel, newLevel) {
  const newSpells = {
    cantrips: [],
    level1: [],
    level2: [],
    level3: [],
    level4: [],
    level5: [],
    level6: [],
    level7: [],
    level8: [],
    level9: []
  };
  
  // Verificar se a classe é um conjurador
  const spellcasters = ['bard', 'cleric', 'druid', 'paladin', 'ranger', 'sorcerer', 'warlock', 'wizard'];
  const lowerClass = characterClass.toLowerCase();
  
  if (!spellcasters.includes(lowerClass)) {
    return newSpells;
  }
  
  try {
    // Verificar cache
    const cacheKey = `spells_${lowerClass}_${newLevel}`;
    const cachedSpells = localStorage.getItem(cacheKey);
    
    if (cachedSpells) {
      return JSON.parse(cachedSpells);
    }
    
    // Buscar magias da classe
    const response = await fetch(`https://www.dnd5eapi.co/api/classes/${lowerClass}/spells`);
    if (!response.ok) {
      throw new Error(`Erro ao buscar magias da classe: ${response.status}`);
    }
    
    const spellsData = await response.json();
    
    if (spellsData && spellsData.results && Array.isArray(spellsData.results)) {
      // Determinar níveis de magia disponíveis
      let maxSpellLevel = 0;
      
      if (newLevel >= 1) maxSpellLevel = 1;
      if (newLevel >= 3) maxSpellLevel = 2;
      if (newLevel >= 5) maxSpellLevel = 3;
      if (newLevel >= 7) maxSpellLevel = 4;
      if (newLevel >= 9) maxSpellLevel = 5;
      if (newLevel >= 11) maxSpellLevel = 6;
      if (newLevel >= 13) maxSpellLevel = 7;
      if (newLevel >= 15) maxSpellLevel = 8;
      if (newLevel >= 17) maxSpellLevel = 9;
      
      // Filtrar e limitar magias por nível
      const cantripUrls = spellsData.results
        .filter(spell => spell.url.includes('cantrip'))
        .slice(0, 3)
        .map(spell => spell.url);
        
      const level1Urls = maxSpellLevel >= 1 ? spellsData.results
        .filter(spell => spell.url.includes('level-1'))
        .slice(0, 3)
        .map(spell => spell.url) : [];
        
      const level2Urls = maxSpellLevel >= 2 ? spellsData.results
        .filter(spell => spell.url.includes('level-2'))
        .slice(0, 2)
        .map(spell => spell.url) : [];
        
      const level3Urls = maxSpellLevel >= 3 ? spellsData.results
        .filter(spell => spell.url.includes('level-3'))
        .slice(0, 2)
        .map(spell => spell.url) : [];
        
      const level4Urls = maxSpellLevel >= 4 ? spellsData.results
        .filter(spell => spell.url.includes('level-4'))
        .slice(0, 1)
        .map(spell => spell.url) : [];
        
      const level5Urls = maxSpellLevel >= 5 ? spellsData.results
        .filter(spell => spell.url.includes('level-5'))
        .slice(0, 1)
        .map(spell => spell.url) : [];
      
      // Buscar detalhes das magias em paralelo
      const fetchSpellDetails = async (url) => {
        try {
          const spellResponse = await fetch(`https://www.dnd5eapi.co${url}`);
          if (spellResponse.ok) {
            return await spellResponse.json();
          }
        } catch (error) {
          console.error(`Erro ao buscar detalhe da magia ${url}:`, error);
        }
        return null;
      };
      
      // Executar requisições em paralelo
      const [cantripDetails, level1Details, level2Details, level3Details, level4Details, level5Details] = await Promise.all([
        Promise.all(cantripUrls.map(fetchSpellDetails)),
        Promise.all(level1Urls.map(fetchSpellDetails)),
        Promise.all(level2Urls.map(fetchSpellDetails)),
        Promise.all(level3Urls.map(fetchSpellDetails)),
        Promise.all(level4Urls.map(fetchSpellDetails)),
        Promise.all(level5Urls.map(fetchSpellDetails))
      ]);
      
      // Filtrar resultados nulos e adicionar às listas
      newSpells.cantrips = cantripDetails.filter(spell => spell !== null);
      newSpells.level1 = level1Details.filter(spell => spell !== null);
      newSpells.level2 = level2Details.filter(spell => spell !== null);
      newSpells.level3 = level3Details.filter(spell => spell !== null);
      newSpells.level4 = level4Details.filter(spell => spell !== null);
      newSpells.level5 = level5Details.filter(spell => spell !== null);
      
      // Salvar no cache
      localStorage.setItem(cacheKey, JSON.stringify(newSpells));
    }
  } catch (error) {
    console.error('Erro ao obter magias:', error);
  }
  
  return newSpells;
}

// Função para processar recompensas após vitória em combate
async function processCombatRewards(character, monster) {
  console.log('Processando recompensas de combate:', { character, monster });
  
  try {
    // Calcular XP
    const xpGained = calculateXP(character.level, monster.challenge_rating);
    console.log('XP ganho:', xpGained);
    
    // Calcular moedas
    const coinRewards = calculateCoinRewards(monster.challenge_rating);
    console.log('Moedas ganhas:', coinRewards);
    
    // Selecionar itens de recompensa
    const itemRewards = selectItemRewards(monster.challenge_rating);
    console.log('Itens ganhos:', itemRewards);
    
    // Verificar se o personagem subiu de nível
    const oldLevel = character.level;
    const oldXP = character.xp || 0;
    const newXP = oldXP + xpGained;
    
    // Determinar se subiu de nível
    let newLevel = oldLevel;
    let leveledUp = false;
    
    // Verificar níveis
    for (let lvl = oldLevel + 1; lvl <= 20; lvl++) {
      if (newXP >= XP_LEVELS[lvl]) {
        newLevel = lvl;
        leveledUp = true;
      } else {
        break;
      }
    }
    
    const levelInfo = {
      leveledUp: leveledUp,
      oldLevel: oldLevel,
      newLevel: newLevel,
      oldXP: oldXP,
      newXP: newXP
    };
    
    console.log('Informações de nível:', levelInfo);
    
    // Aplicar recompensas
    character.xp = newXP;
    
    if (leveledUp) {
      character.level = newLevel;
    }
    
    // Atualizar moedas
    character.gold = (character.gold || 0) + coinRewards.gold;
    character.silver = (character.silver || 0) + coinRewards.silver;
    character.copper = (character.copper || 0) + coinRewards.copper;
    
    // Adicionar itens ao inventário
    if (!character.equipment) {
      character.equipment = [];
    }
    
    itemRewards.forEach(item => {
      character.equipment.push(item.name);
    });
    
    console.log('Personagem atualizado:', character);
    
    // Salvar o personagem atualizado no localStorage
    localStorage.setItem('currentCharacter', JSON.stringify(character));
    
    // Retornar as recompensas
    return {
      xpGained,
      coinRewards,
      itemRewards,
      levelInfo
    };
  } catch (error) {
    console.error('Erro ao processar recompensas:', error);
    throw error;
  }
}

// Função para exibir recompensas na interface
function displayRewards(rewards) {
  // Criar o conteúdo HTML para o modal de recompensas
  let rewardsHTML = `
    <div class="rewards-header">
      <h3>Recompensas de Combate</h3>
    </div>
    <div class="rewards-content">
      <div class="reward-section">
        <h4>Experiência</h4>
        <p>Você ganhou <strong>${rewards.xpGained} XP</strong>!</p>
  `;
  
  // Adicionar informações de subida de nível, se aplicável
  if (rewards.levelInfo.leveledUp) {
    rewardsHTML += `
      <div class="level-up-info">
        <h4>Subida de Nível!</h4>
        <p>Você subiu do nível ${rewards.levelInfo.oldLevel} para o nível ${rewards.levelInfo.newLevel}!</p>
        <div class="xp-bar">
          <div class="xp-progress" style="width: ${rewards.levelInfo.xpProgress}%"></div>
        </div>
        <p>XP atual: ${rewards.levelInfo.newXP} / ${rewards.levelInfo.xpForNextLevel || 'Máximo'}</p>
    `;
    
    // Adicionar novas habilidades
    if (rewards.newAbilities && rewards.newAbilities.length > 0) {
      rewardsHTML += `
        <div class="new-abilities">
          <h4>Novas Habilidades</h4>
          <ul>
      `;
      
      rewards.newAbilities.forEach(ability => {
        rewardsHTML += `<li><strong>${ability.name}</strong> (Nível ${ability.level})</li>`;
      });
      
      rewardsHTML += `
          </ul>
        </div>
      `;
    }
    
    // Adicionar novas magias
    if (rewards.newSpells) {
      const hasNewSpells = Object.values(rewards.newSpells).some(spellArray => spellArray.length > 0);
      
      if (hasNewSpells) {
        rewardsHTML += `
          <div class="new-spells">
            <h4>Novas Magias</h4>
        `;
        
        // Cantrips
        if (rewards.newSpells.cantrips && rewards.newSpells.cantrips.length > 0) {
          rewardsHTML += `
            <h5>Truques</h5>
            <ul>
          `;
          
          rewards.newSpells.cantrips.forEach(spell => {
            rewardsHTML += `<li><strong>${spell.name}</strong></li>`;
          });
          
          rewardsHTML += `</ul>`;
        }
        
        // Level 1
        if (rewards.newSpells.level1 && rewards.newSpells.level1.length > 0) {
          rewardsHTML += `
            <h5>Nível 1</h5>
            <ul>
          `;
          
          rewards.newSpells.level1.forEach(spell => {
            rewardsHTML += `<li><strong>${spell.name}</strong></li>`;
          });
          
          rewardsHTML += `</ul>`;
        }
        
        // Level 2
        if (rewards.newSpells.level2 && rewards.newSpells.level2.length > 0) {
          rewardsHTML += `
            <h5>Nível 2</h5>
            <ul>
          `;
          
          rewards.newSpells.level2.forEach(spell => {
            rewardsHTML += `<li><strong>${spell.name}</strong></li>`;
          });
          
          rewardsHTML += `</ul>`;
        }
        
        // Level 3
        if (rewards.newSpells.level3 && rewards.newSpells.level3.length > 0) {
          rewardsHTML += `
            <h5>Nível 3</h5>
            <ul>
          `;
          
          rewards.newSpells.level3.forEach(spell => {
            rewardsHTML += `<li><strong>${spell.name}</strong></li>`;
          });
          
          rewardsHTML += `</ul>`;
        }
        
        // Níveis superiores (4-9)
        for (let i = 4; i <= 9; i++) {
          const spellKey = `level${i}`;
          if (rewards.newSpells[spellKey] && rewards[spellKey].length > 0) {
            rewardsHTML += `
              <h5>Nível ${i}</h5>
              <ul>
            `;
            
            rewards.newSpells[spellKey].forEach(spell => {
              rewardsHTML += `<li><strong>${spell.name}</strong></li>`;
            });
            
            rewardsHTML += `</ul>`;
          }
        }
        
        rewardsHTML += `
          </div>
        `;
      }
    }
    
    rewardsHTML += `
      </div>
    `;
  } else {
    // Se não subiu de nível, mostrar progresso
    rewardsHTML += `
      <div class="xp-bar">
        <div class="xp-progress" style="width: ${rewards.levelInfo.xpProgress}%"></div>
      </div>
      <p>XP atual: ${rewards.levelInfo.newXP} / ${rewards.levelInfo.xpForNextLevel || 'Máximo'}</p>
    `;
  }
  
  // Adicionar moedas
  rewardsHTML += `
      </div>
      <div class="reward-section">
        <h4>Moedas</h4>
        <p>
          <span class="coin copper">${rewards.coinRewards.copper} PC</span>
          <span class="coin silver">${rewards.coinRewards.silver} PP</span>
          <span class="coin gold">${rewards.coinRewards.gold} PO</span>
        </p>
      </div>
  `;
  
  // Adicionar itens
  if (rewards.itemRewards && rewards.itemRewards.length > 0) {
    rewardsHTML += `
      <div class="reward-section">
        <h4>Itens</h4>
        <ul class="items-list">
    `;
    
    rewards.itemRewards.forEach(item => {
      rewardsHTML += `
        <li class="item-card ${item.rarity}">
          <div class="item-name">${item.name}</div>
          <div class="item-type">${getItemTypeTranslation(item.type)} (${getRarityTranslation(item.rarity)})</div>
          <div class="item-description">${item.description}</div>
        </li>
      `;
    });
    
    rewardsHTML += `
        </ul>
      </div>
    `;
  }
  
  rewardsHTML += `
    </div>
    <div class="rewards-footer">
      <button id="close-rewards-btn" class="btn">Continuar</button>
    </div>
  `;
  
  // Criar o modal
  const rewardsModal = document.createElement('div');
  rewardsModal.id = 'rewards-modal';
  rewardsModal.className = 'modal';
  rewardsModal.innerHTML = rewardsHTML;
  
  // Adicionar o modal ao corpo do documento
  document.body.appendChild(rewardsModal);
  
  // Exibir o modal
  rewardsModal.style.display = 'flex';
  
  // Configurar o botão de fechar
  document.getElementById('close-rewards-btn').addEventListener('click', () => {
    rewardsModal.style.display = 'none';
    
    // Remover o modal após fechar
    setTimeout(() => {
      document.body.removeChild(rewardsModal);
    }, 300);
  });
}

// Função auxiliar para traduzir tipos de itens
function getItemTypeTranslation(type) {
  const translations = {
    'consumable': 'Consumível',
    'ammunition': 'Munição',
    'gear': 'Equipamento',
    'wearable': 'Vestimenta',
    'wondrous': 'Item Maravilhoso',
    'scroll': 'Pergaminho',
    'weapon': 'Arma',
    'armor': 'Armadura'
  };
  
  return translations[type] || type;
}

// Função auxiliar para traduzir raridades
function getRarityTranslation(rarity) {
  const translations = {
    'common': 'Comum',
    'uncommon': 'Incomum',
    'rare': 'Raro',
    'very_rare': 'Muito Raro',
    'legendary': 'Lendário'
  };
  
  return translations[rarity] || rarity;
}

// Exportar funções para uso em outros arquivos
window.rewardsSystem = {
  calculateXP,
  calculateCoinRewards,
  selectItemRewards,
  checkLevelUp,
  applyRewards,
  getNewAbilities,
  getNewSpells,
  processCombatRewards,
  displayRewards
};
