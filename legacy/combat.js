// Sistema de combate para D&D 5e
let currentCombat = null;
let currentCharacter = null;
let currentMonster = null;
let combatLog = [];
let combatTurn = 1;
let currentTurnActor = 'character'; // 'character' ou 'monster'
let combatStatus = 'not_started'; // 'not_started', 'in_progress', 'victory', 'defeat', 'flee'

// Inicializar o combate com um personagem
function initializeCombat(character) {
  // Salvar o personagem atual
  currentCharacter = prepareCharacterForCombat(character);
  
  // Selecionar um monstro apropriado para o nível do personagem
  currentMonster = prepareMonsterForCombat(selectMonsterForLevel(currentCharacter.level));
  
  // Determinar iniciativa
  rollInitiative();
  
  // Criar o objeto de combate
  currentCombat = {
    character: currentCharacter,
    monster: currentMonster,
    turn: 1,
    currentTurnActor: currentTurnActor,
    status: 'in_progress',
    log: []
  };
  
  // Atualizar a interface
  updateCharacterUI();
  updateMonsterUI();
  
  // Adicionar entrada inicial no log
  addLogEntry('system', `Combate iniciado! ${currentCharacter.name} encontrou um ${currentMonster.name}!`);
  addLogEntry('system', `Rolagem de iniciativa: ${currentCharacter.name} (${currentCharacter.initiative_roll}) vs ${currentMonster.name} (${currentMonster.initiative_roll})`);
  addLogEntry('system', `${currentTurnActor === 'character' ? currentCharacter.name : currentMonster.name} age primeiro!`);
  
  // Configurar os botões de ação
  setupActionButtons();
  
  // Se o monstro agir primeiro, executar seu turno automaticamente
  if (currentTurnActor === 'monster') {
    setTimeout(executeMonsterTurn, 1000);
  }
  
  // Definir o status do combate
  combatStatus = 'in_progress';
}

// Preparar o personagem para o combate
function prepareCharacterForCombat(character) {
  // Calcular valores de combate
  const strMod = calculateModifier(character.attributes.FOR);
  const dexMod = calculateModifier(character.attributes.DES);
  const conMod = calculateModifier(character.attributes.CON);
  const intMod = calculateModifier(character.attributes.INT);
  const wisMod = calculateModifier(character.attributes.SAB);
  const chaMod = calculateModifier(character.attributes.CAR);
  
  // Criar ataques básicos baseados na classe
  let attacks = [];
  
  // Adicionar ataques baseados na classe
  switch (character.class.toLowerCase()) {
    case 'barbarian':
    case 'fighter':
    case 'paladin':
      attacks.push({
        name: "Espada Longa",
        attack_bonus: strMod + 2, // +2 de proficiência
        damage_dice: "1d8",
        damage_bonus: strMod,
        damage_type: "cortante"
      });
      attacks.push({
        name: "Machado de Batalha",
        attack_bonus: strMod + 2,
        damage_dice: "1d8",
        damage_bonus: strMod,
        damage_type: "cortante"
      });
      break;
    case 'rogue':
    case 'monk':
    case 'ranger':
      attacks.push({
        name: "Adaga",
        attack_bonus: dexMod + 2,
        damage_dice: "1d4",
        damage_bonus: dexMod,
        damage_type: "perfurante"
      });
      attacks.push({
        name: "Arco Curto",
        attack_bonus: dexMod + 2,
        damage_dice: "1d6",
        damage_bonus: dexMod,
        damage_type: "perfurante"
      });
      break;
    case 'wizard':
    case 'sorcerer':
    case 'warlock':
      attacks.push({
        name: "Cajado",
        attack_bonus: strMod + 2,
        damage_dice: "1d6",
        damage_bonus: strMod,
        damage_type: "contundente"
      });
      attacks.push({
        name: "Adaga",
        attack_bonus: dexMod + 2,
        damage_dice: "1d4",
        damage_bonus: dexMod,
        damage_type: "perfurante"
      });
      break;
    case 'cleric':
    case 'druid':
    case 'bard':
      attacks.push({
        name: "Maça",
        attack_bonus: strMod + 2,
        damage_dice: "1d6",
        damage_bonus: strMod,
        damage_type: "contundente"
      });
      attacks.push({
        name: "Besta Leve",
        attack_bonus: dexMod + 2,
        damage_dice: "1d8",
        damage_bonus: dexMod,
        damage_type: "perfurante"
      });
      break;
    default:
      attacks.push({
        name: "Punho",
        attack_bonus: strMod + 2,
        damage_dice: "1d4",
        damage_bonus: strMod,
        damage_type: "contundente"
      });
  }
  
  // Criar magias básicas baseadas na classe
  let spells = [];
  
  // Adicionar magias baseadas na classe
  if (['wizard', 'sorcerer', 'warlock', 'cleric', 'druid', 'bard', 'paladin', 'ranger'].includes(character.class.toLowerCase())) {
    // Adicionar magias de ataque básicas
    if (['wizard', 'sorcerer', 'warlock'].includes(character.class.toLowerCase())) {
      spells.push({
        name: "Raio de Fogo",
        level: 0,
        attack_bonus: intMod + 2,
        damage_dice: "1d10",
        damage_bonus: 0,
        damage_type: "fogo"
      });
      spells.push({
        name: "Mísseis Mágicos",
        level: 1,
        attack_bonus: null, // Acerto automático
        damage_dice: "3d4",
        damage_bonus: 3,
        damage_type: "força"
      });
    } else if (['cleric', 'druid'].includes(character.class.toLowerCase())) {
      spells.push({
        name: "Chama Sagrada",
        level: 0,
        attack_bonus: wisMod + 2,
        damage_dice: "1d8",
        damage_bonus: 0,
        damage_type: "radiante"
      });
      spells.push({
        name: "Curar Ferimentos",
        level: 1,
        healing_dice: "1d8",
        healing_bonus: wisMod,
        is_healing: true
      });
    } else if (character.class.toLowerCase() === 'bard') {
      spells.push({
        name: "Zombaria Viciosa",
        level: 0,
        attack_bonus: chaMod + 2,
        damage_dice: "1d4",
        damage_bonus: 0,
        damage_type: "psíquico"
      });
      spells.push({
        name: "Palavra Curativa",
        level: 1,
        healing_dice: "1d4",
        healing_bonus: chaMod,
        is_healing: true
      });
    } else if (character.class.toLowerCase() === 'paladin') {
      spells.push({
        name: "Golpe Divino",
        level: 1,
        damage_dice: "2d8",
        damage_bonus: 0,
        damage_type: "radiante",
        special: "Adiciona ao dano de um ataque bem-sucedido"
      });
      spells.push({
        name: "Curar Ferimentos",
        level: 1,
        healing_dice: "1d8",
        healing_bonus: chaMod,
        is_healing: true
      });
    } else if (character.class.toLowerCase() === 'ranger') {
      spells.push({
        name: "Marca do Caçador",
        level: 1,
        damage_dice: "1d6",
        damage_bonus: 0,
        damage_type: "radiante",
        special: "Adiciona ao dano de um ataque bem-sucedido"
      });
    }
  }
  
  // Calcular pontos de vida
  let baseHP = 0;
  switch (character.class.toLowerCase()) {
    case 'barbarian':
      baseHP = 12;
      break;
    case 'fighter':
    case 'paladin':
    case 'ranger':
      baseHP = 10;
      break;
    case 'cleric':
    case 'druid':
    case 'monk':
    case 'rogue':
    case 'warlock':
      baseHP = 8;
      break;
    case 'bard':
    case 'sorcerer':
    case 'wizard':
      baseHP = 6;
      break;
    default:
      baseHP = 8;
  }
  
  const maxHP = baseHP + conMod + ((baseHP / 2 + conMod) * (character.level - 1));
  
  // Calcular CA (Classe de Armadura)
  let ac = calculateAC(character);
  
  // Retornar o personagem preparado para combate
  return {
    ...character,
    hp_max: Math.floor(maxHP),
    hp_current: Math.floor(maxHP),
    ac: ac,
    initiative_bonus: dexMod,
    initiative_roll: 0,
    attacks: attacks,
    spells: spells,
    modifiers: {
      str: strMod,
      dex: dexMod,
      con: conMod,
      int: intMod,
      wis: wisMod,
      cha: chaMod
    }
  };
}

// Preparar o monstro para o combate
function prepareMonsterForCombat(monster) {
  // Calcular modificadores de atributos
  const strMod = calculateModifier(monster.stats.str);
  const dexMod = calculateModifier(monster.stats.dex);
  
  // Rolar pontos de vida
  const hpRoll = Math.max(1, Math.floor(Math.random() * monster.hp * 0.4) + Math.floor(monster.hp * 0.8));
  
  // Retornar o monstro preparado para combate
  return {
    ...monster,
    hp_max: hpRoll,
    hp_current: hpRoll,
    initiative_roll: 0,
    modifiers: {
      str: strMod,
      dex: dexMod,
      con: calculateModifier(monster.stats.con),
      int: calculateModifier(monster.stats.int),
      wis: calculateModifier(monster.stats.wis),
      cha: calculateModifier(monster.stats.cha)
    }
  };
}

// Rolar iniciativa para determinar quem age primeiro
function rollInitiative() {
  // Rolar para o personagem
  const characterRoll = Math.floor(Math.random() * 20) + 1;
  currentCharacter.initiative_roll = characterRoll + currentCharacter.initiative_bonus;
  
  // Rolar para o monstro
  const monsterRoll = Math.floor(Math.random() * 20) + 1;
  currentMonster.initiative_roll = monsterRoll + currentMonster.initiative_bonus;
  
  // Determinar quem age primeiro
  if (currentCharacter.initiative_roll >= currentMonster.initiative_roll) {
    currentTurnActor = 'character';
  } else {
    currentTurnActor = 'monster';
  }
}

// Atualizar a interface do personagem
function updateCharacterUI() {
  // Atualizar informações básicas
  document.getElementById('character-name').textContent = currentCharacter.name;
  document.getElementById('character-level').textContent = `Nível ${currentCharacter.level}`;
  document.getElementById('character-class-race').textContent = `${currentCharacter.race} ${currentCharacter.class}`;
  
  // Atualizar pontos de vida
  document.getElementById('character-hp-current').textContent = currentCharacter.hp_current;
  document.getElementById('character-hp-max').textContent = currentCharacter.hp_max;
  
  // Atualizar barra de vida
  const hpPercentage = (currentCharacter.hp_current / currentCharacter.hp_max) * 100;
  document.getElementById('character-hp-bar').style.width = `${Math.max(0, hpPercentage)}%`;
  
  // Mudar cor da barra de vida baseado na porcentagem
  if (hpPercentage > 50) {
    document.getElementById('character-hp-bar').style.backgroundColor = 'var(--success-color)';
  } else if (hpPercentage > 25) {
    document.getElementById('character-hp-bar').style.backgroundColor = 'var(--warning-color)';
  } else {
    document.getElementById('character-hp-bar').style.backgroundColor = 'var(--danger-color)';
  }
  
  // Atualizar estatísticas
  document.getElementById('character-ac').textContent = currentCharacter.ac;
  document.getElementById('character-initiative').textContent = `+${currentCharacter.initiative_bonus}`;
  document.getElementById('character-str').textContent = currentCharacter.attributes.FOR;
  document.getElementById('character-dex').textContent = currentCharacter.attributes.DES;
  document.getElementById('character-con').textContent = currentCharacter.attributes.CON;
  document.getElementById('character-int').textContent = currentCharacter.attributes.INT;
  document.getElementById('character-wis').textContent = currentCharacter.attributes.SAB;
  document.getElementById('character-cha').textContent = currentCharacter.attributes.CAR;
  
  // Atualizar lista de ataques
  const attacksList = document.getElementById('attacks-list');
  let attacksHtml = '<h4>Ataques</h4>';
  
  if (currentCharacter.attacks && currentCharacter.attacks.length > 0) {
    currentCharacter.attacks.forEach(attack => {
      attacksHtml += `
        <div class="attack-item" data-attack='${JSON.stringify(attack)}'>
          <strong>${attack.name}</strong> - Ataque: +${attack.attack_bonus}, Dano: ${attack.damage_dice}+${attack.damage_bonus} ${attack.damage_type}
        </div>
      `;
    });
  } else {
    attacksHtml += '<p>Nenhum ataque disponível.</p>';
  }
  
  attacksList.innerHTML = attacksHtml;
  
  // Atualizar lista de magias
  const spellsList = document.getElementById('spells-list');
  let spellsHtml = '<h4>Magias</h4>';
  
  if (currentCharacter.spells && currentCharacter.spells.length > 0) {
    currentCharacter.spells.forEach(spell => {
      if (spell.is_healing) {
        spellsHtml += `
          <div class="spell-item" data-spell='${JSON.stringify(spell)}'>
            <strong>${spell.name}</strong> (Nível ${spell.level}) - Cura: ${spell.healing_dice}+${spell.healing_bonus}
          </div>
        `;
      } else {
        spellsHtml += `
          <div class="spell-item" data-spell='${JSON.stringify(spell)}'>
            <strong>${spell.name}</strong> (Nível ${spell.level}) - ${spell.attack_bonus ? `Ataque: +${spell.attack_bonus}, ` : ''}Dano: ${spell.damage_dice}${spell.damage_bonus ? `+${spell.damage_bonus}` : ''} ${spell.damage_type}
          </div>
        `;
      }
    });
  } else {
    spellsHtml += '<p>Nenhuma magia disponível.</p>';
  }
  
  spellsList.innerHTML = spellsHtml;
}

// Modificar a função updateMonsterUI
function updateMonsterUI() {
  // Atualizar informações básicas
  document.getElementById('monster-name').textContent = currentMonster.name;
  document.getElementById('monster-challenge').textContent = `Nível de Desafio (ND): ${currentMonster.challenge_rating}`;
  
  // Atualizar imagem
  const monsterImage = document.getElementById('monster-image');
  
  // Usar a função de correção de URL
  if (typeof getCorrectImageUrl === 'function') {
    monsterImage.src = getCorrectImageUrl(currentMonster.name, currentMonster.image_url);
  } else {
    monsterImage.src = currentMonster.image_url;
  }
  
  monsterImage.alt = currentMonster.name;
  
  // Adicionar eventos para monitorar o carregamento da imagem
  monsterImage.onerror = function() {
    console.warn(`Falha ao carregar imagem para o monstro: ${currentMonster.name}`);
    console.warn(`URL tentado: ${this.src}`);
    addLogEntry('system', `Nota: Imagem para ${currentMonster.name} não está disponível.`);
    
    // Não substituir por uma imagem genérica, para facilitar diagnóstico
    this.alt = `${currentMonster.name} (imagem indisponível)`;
  };
  
  monsterImage.onload = function() {
    console.log(`Imagem para o monstro ${currentMonster.name} carregada com sucesso:`, this.src);
  };
  
  // Atualizar pontos de vida
  document.getElementById('monster-hp-current').textContent = currentMonster.hp_current;
  document.getElementById('monster-hp-max').textContent = currentMonster.hp_max;
  
  // Atualizar barra de vida
  const hpPercentage = (currentMonster.hp_current / currentMonster.hp_max) * 100;
  document.getElementById('monster-hp-bar').style.width = `${Math.max(0, hpPercentage)}%`;
  
  // Atualizar estatísticas
  document.getElementById('monster-ac').textContent = currentMonster.ac;
  document.getElementById('monster-initiative').textContent = `+${currentMonster.initiative_bonus}`;
  document.getElementById('monster-str').textContent = currentMonster.stats.str;
  document.getElementById('monster-dex').textContent = currentMonster.stats.dex;
  document.getElementById('monster-con').textContent = currentMonster.stats.con;
  document.getElementById('monster-int').textContent = currentMonster.stats.int;
  document.getElementById('monster-wis').textContent = currentMonster.stats.wis;
  document.getElementById('monster-cha').textContent = currentMonster.stats.cha;
  
  // Atualizar descrição
  document.getElementById('monster-description').innerHTML = `<p>${currentMonster.description}</p>`;
}

// Adicionar entrada ao log de combate
function addLogEntry(type, message) {
  // Criar elemento de log
  const logEntries = document.getElementById('log-entries');
  const entry = document.createElement('div');
  entry.className = `log-entry ${type}`;
  
  // Adicionar timestamp
  const now = new Date();
  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  
  // Adicionar conteúdo
  entry.innerHTML = `
    <span class="log-timestamp">[${timestamp}]</span>
    <span>${message}</span>
  `;
  
  // Adicionar ao log
  logEntries.appendChild(entry);
  
  // Rolar para o final do log
  const logContainer = document.getElementById('combat-log');
  logContainer.scrollTop = logContainer.scrollHeight;
  
  // Adicionar ao array de log
  combatLog.push({
    type,
    message,
    timestamp: now.toISOString()
  });
}

// Configurar os botões de ação
function setupActionButtons() {
  // Botão de ataque
  document.getElementById('attack-btn').addEventListener('click', () => {
    if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
    
    // Mostrar modal de ataque
    const attackModal = document.getElementById('attack-modal');
    attackModal.style.display = 'flex';
    
    // Preencher opções de ataque
    const attackOptions = document.getElementById('attack-options');
    attackOptions.innerHTML = '';
    
    currentCharacter.attacks.forEach(attack => {
      const attackOption = document.createElement('div');
      attackOption.className = 'attack-item';
      attackOption.innerHTML = `
        <strong>${attack.name}</strong> - Ataque: +${attack.attack_bonus}, Dano: ${attack.damage_dice}+${attack.damage_bonus} ${attack.damage_type}
      `;
      
      // Adicionar evento de clique
      attackOption.addEventListener('click', () => {
        executeCharacterAttack(attack);
        attackModal.style.display = 'none';
      });
      
      attackOptions.appendChild(attackOption);
    });
    
    // Configurar botão de cancelar
    document.getElementById('cancel-attack-btn').addEventListener('click', () => {
      attackModal.style.display = 'none';
    });
    
    // Configurar botão de fechar
    document.getElementById('close-attack-modal').addEventListener('click', () => {
      attackModal.style.display = 'none';
    });
  });
  
  // Botão de magia
  document.getElementById('spell-btn').addEventListener('click', () => {
    if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
    
    // Verificar se o personagem tem magias
    if (!currentCharacter.spells || currentCharacter.spells.length === 0) {
      addLogEntry('system', `${currentCharacter.name} não possui magias disponíveis.`);
      return;
    }
    
    // Mostrar modal de magia
    const spellModal = document.getElementById('spell-modal');
    spellModal.style.display = 'flex';
    
    // Preencher opções de magia
    const spellOptions = document.getElementById('spell-options');
    spellOptions.innerHTML = '';
    
    currentCharacter.spells.forEach(spell => {
      const spellOption = document.createElement('div');
      spellOption.className = 'spell-item';
      
      if (spell.is_healing) {
        spellOption.innerHTML = `
          <strong>${spell.name}</strong> (Nível ${spell.level}) - Cura: ${spell.healing_dice}+${spell.healing_bonus}
        `;
      } else {
        spellOption.innerHTML = `
          <strong>${spell.name}</strong> (Nível ${spell.level}) - ${spell.attack_bonus ? `Ataque: +${spell.attack_bonus}, ` : ''}Dano: ${spell.damage_dice}${spell.damage_bonus ? `+${spell.damage_bonus}` : ''} ${spell.damage_type}
        `;
      }
      
      // Adicionar evento de clique
      spellOption.addEventListener('click', () => {
        executeCharacterSpell(spell);
        spellModal.style.display = 'none';
      });
      
      spellOptions.appendChild(spellOption);
    });
    
    // Configurar botão de cancelar
    document.getElementById('cancel-spell-btn').addEventListener('click', () => {
      spellModal.style.display = 'none';
    });
    
    // Configurar botão de fechar
    document.getElementById('close-spell-modal').addEventListener('click', () => {
      spellModal.style.display = 'none';
    });
  });
  
  // Botão de item
  document.getElementById('item-btn').addEventListener('click', () => {
    if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
    
    // Por enquanto, apenas uma poção de cura básica
    executeCharacterUseItem({
      name: "Poção de Cura",
      healing_dice: "2d4",
      healing_bonus: 2
    });
  });
  
  // Botão de fugir
  document.getElementById('flee-btn').addEventListener('click', () => {
    if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
    
    // Tentar fugir (50% de chance)
    const fleeRoll = Math.random();
    
    if (fleeRoll > 0.5) {
      // Fuga bem-sucedida
      addLogEntry('player', `${currentCharacter.name} conseguiu fugir do combate!`);
      endCombat('flee');
    } else {
      // Fuga mal-sucedida
      addLogEntry('player', `${currentCharacter.name} tentou fugir, mas falhou!`);
      
      // Passar o turno para o monstro
      currentTurnActor = 'monster';
      addLogEntry('system', `Turno de ${currentMonster.name}!`);
      
      // Executar o turno do monstro após um breve atraso
      setTimeout(executeMonsterTurn, 1000);
    }
  });
  
  // Botão de próximo encontro
  document.getElementById('next-encounter-btn').addEventListener('click', () => {
    if (combatStatus === 'in_progress') return;
    
    // Resetar o combate
    resetCombat();
    
    // Selecionar um novo monstro
    currentMonster = prepareMonsterForCombat(selectMonsterForLevel(currentCharacter.level));
    
    // Determinar iniciativa
    rollInitiative();
    
    // Atualizar a interface
    updateCharacterUI();
    updateMonsterUI();
    
    // Adicionar entrada inicial no log
    addLogEntry('system', `Novo combate iniciado! ${currentCharacter.name} encontrou um ${currentMonster.name}!`);
    addLogEntry('system', `Rolagem de iniciativa: ${currentCharacter.name} (${currentCharacter.initiative_roll}) vs ${currentMonster.name} (${currentMonster.initiative_roll})`);
    addLogEntry('system', `${currentTurnActor === 'character' ? currentCharacter.name : currentMonster.name} age primeiro!`);
    
    // Se o monstro agir primeiro, executar seu turno automaticamente
    if (currentTurnActor === 'monster') {
      setTimeout(executeMonsterTurn, 1000);
    }
    
    // Definir o status do combate
    combatStatus = 'in_progress';
    
    // Esconder mensagens de resultado
    document.getElementById('victory-message').classList.add('hidden');
    document.getElementById('defeat-message').classList.add('hidden');
    document.getElementById('flee-message').classList.add('hidden');
    
    // Mostrar barra de ações de combate
    document.getElementById('action-bar').style.display = 'flex';
    document.getElementById('post-combat-actions').style.display = 'none';
  });
  
  // Botão de retornar à ficha
  document.getElementById('return-btn').addEventListener('click', () => {
    window.location.href = 'personagem.html';
  });
}

// Executar ataque do personagem
function executeCharacterAttack(attack) {
  if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
  
  // Rolar d20 para ataque
  const attackRoll = Math.floor(Math.random() * 20) + 1;
  const attackTotal = attackRoll + attack.attack_bonus;
  
  // Verificar se é um acerto crítico (20 natural)
  const isCritical = attackRoll === 20;
  
  // Verificar se o ataque acerta
  const isHit = isCritical || attackTotal >= currentMonster.ac;
  
  if (isHit) {
    // Calcular dano
    let damageRoll;
    
    if (isCritical) {
      // Dano crítico (dobro de dados)
      const diceNotation = attack.damage_dice;
      const match = diceNotation.match(/(\d+)d(\d+)/);
      
      if (match) {
        const numDice = parseInt(match[1]) * 2; // Dobrar o número de dados
        const numFaces = parseInt(match[2]);
        
        // Rolar os dados
        let damage = 0;
        for (let i = 0; i < numDice; i++) {
          damage += Math.floor(Math.random() * numFaces) + 1;
        }
        
        // Adicionar modificador
        damageRoll = damage + attack.damage_bonus;
      } else {
        // Fallback se a notação de dados não for reconhecida
        damageRoll = rollDice(attack.damage_dice) * 2 + attack.damage_bonus;
      }
      
      // Adicionar entrada no log
      addLogEntry('player', `<strong>${currentCharacter.name}</strong> ataca com ${attack.name}. <span class="dice-result critical">Acerto Crítico! (${attackRoll})</span> Dano: ${damageRoll} de dano ${attack.damage_type}!`);
    } else {
      // Dano normal
      damageRoll = rollDice(attack.damage_dice) + attack.damage_bonus;
      
      // Adicionar entrada no log
      addLogEntry('player', `<strong>${currentCharacter.name}</strong> ataca com ${attack.name}. <span class="dice-result hit">Acerto! (${attackRoll} + ${attack.attack_bonus} = ${attackTotal} vs CA ${currentMonster.ac})</span> Dano: ${damageRoll} de dano ${attack.damage_type}!`);
    }
    
    // Aplicar dano ao monstro
    currentMonster.hp_current = Math.max(0, currentMonster.hp_current - damageRoll);
    
    // Atualizar a interface do monstro
    updateMonsterUI();
    
    // Verificar se o monstro foi derrotado
    if (currentMonster.hp_current <= 0) {
      addLogEntry('system', `${currentMonster.name} foi derrotado!`);
      endCombat('victory');
      return;
    }
  } else {
    // Ataque falhou
    addLogEntry('player', `<strong>${currentCharacter.name}</strong> ataca com ${attack.name}. <span class="dice-result miss">Erro! (${attackRoll} + ${attack.attack_bonus} = ${attackTotal} vs CA ${currentMonster.ac})</span>`);
  }
  
  // Passar o turno para o monstro
  currentTurnActor = 'monster';
  addLogEntry('system', `Turno de ${currentMonster.name}!`);
  
  // Executar o turno do monstro após um breve atraso
  setTimeout(executeMonsterTurn, 1000);
}

// Executar magia do personagem
function executeCharacterSpell(spell) {
  if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
  
  if (spell.is_healing) {
    // Magia de cura
    const healingRoll = rollDice(spell.healing_dice) + spell.healing_bonus;
    
    // Aplicar cura ao personagem
    const oldHp = currentCharacter.hp_current;
    currentCharacter.hp_current = Math.min(currentCharacter.hp_max, currentCharacter.hp_current + healingRoll);
    const actualHealing = currentCharacter.hp_current - oldHp;
    
    // Adicionar entrada no log
    addLogEntry('player', `<strong>${currentCharacter.name}</strong> lança ${spell.name}. Cura ${actualHealing} pontos de vida!`);
    
    // Atualizar a interface do personagem
    updateCharacterUI();
  } else {
    // Magia de ataque
    if (spell.attack_bonus !== null) {
      // Magia com rolagem de ataque
      const attackRoll = Math.floor(Math.random() * 20) + 1;
      const attackTotal = attackRoll + spell.attack_bonus;
      
      // Verificar se é um acerto crítico (20 natural)
      const isCritical = attackRoll === 20;
      
      // Verificar se o ataque acerta
      const isHit = isCritical || attackTotal >= currentMonster.ac;
      
      if (isHit) {
        // Calcular dano
        let damageRoll;
        
        if (isCritical) {
          // Dano crítico (dobro de dados)
          damageRoll = rollDice(spell.damage_dice) * 2 + (spell.damage_bonus || 0);
          
          // Adicionar entrada no log
          addLogEntry('player', `<strong>${currentCharacter.name}</strong> lança ${spell.name}. <span class="dice-result critical">Acerto Crítico! (${attackRoll})</span> Dano: ${damageRoll} de dano ${spell.damage_type}!`);
        } else {
          // Dano normal
          damageRoll = rollDice(spell.damage_dice) + (spell.damage_bonus || 0);
          
          // Adicionar entrada no log
          addLogEntry('player', `<strong>${currentCharacter.name}</strong> lança ${spell.name}. <span class="dice-result hit">Acerto! (${attackRoll} + ${spell.attack_bonus} = ${attackTotal} vs CA ${currentMonster.ac})</span> Dano: ${damageRoll} de dano ${spell.damage_type}!`);
        }
        
        // Aplicar dano ao monstro
        currentMonster.hp_current = Math.max(0, currentMonster.hp_current - damageRoll);
        
        // Atualizar a interface do monstro
        updateMonsterUI();
        
        // Verificar se o monstro foi derrotado
        if (currentMonster.hp_current <= 0) {
          addLogEntry('system', `${currentMonster.name} foi derrotado!`);
          endCombat('victory');
          return;
        }
      } else {
        // Ataque falhou
        addLogEntry('player', `<strong>${currentCharacter.name}</strong> lança ${spell.name}. <span class="dice-result miss">Erro! (${attackRoll} + ${spell.attack_bonus} = ${attackTotal} vs CA ${currentMonster.ac})</span>`);
      }
    } else {
      // Magia sem rolagem de ataque (acerto automático)
      const damageRoll = rollDice(spell.damage_dice) + (spell.damage_bonus || 0);
      
      // Adicionar entrada no log
      addLogEntry('player', `<strong>${currentCharacter.name}</strong> lança ${spell.name}. Dano: ${damageRoll} de dano ${spell.damage_type}!`);
      
      // Aplicar dano ao monstro
      currentMonster.hp_current = Math.max(0, currentMonster.hp_current - damageRoll);
      
      // Atualizar a interface do monstro
      updateMonsterUI();
      
      // Verificar se o monstro foi derrotado
      if (currentMonster.hp_current <= 0) {
        addLogEntry('system', `${currentMonster.name} foi derrotado!`);
        endCombat('victory');
        return;
      }
    }
  }
  
  // Passar o turno para o monstro
  currentTurnActor = 'monster';
  addLogEntry('system', `Turno de ${currentMonster.name}!`);
  
  // Executar o turno do monstro após um breve atraso
  setTimeout(executeMonsterTurn, 1000);
}

// Executar uso de item pelo personagem
function executeCharacterUseItem(item) {
  if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
  
  // Por enquanto, apenas poções de cura
  if (item.healing_dice) {
    const healingRoll = rollDice(item.healing_dice) + (item.healing_bonus || 0);
    
    // Aplicar cura ao personagem
    const oldHp = currentCharacter.hp_current;
    currentCharacter.hp_current = Math.min(currentCharacter.hp_max, currentCharacter.hp_current + healingRoll);
    const actualHealing = currentCharacter.hp_current - oldHp;
    
    // Adicionar entrada no log
    addLogEntry('player', `<strong>${currentCharacter.name}</strong> usa ${item.name}. Cura ${actualHealing} pontos de vida!`);
    
    // Atualizar a interface do personagem
    updateCharacterUI();
  }
  
  // Passar o turno para o monstro
  currentTurnActor = 'monster';
  addLogEntry('system', `Turno de ${currentMonster.name}!`);
  
  // Executar o turno do monstro após um breve atraso
  setTimeout(executeMonsterTurn, 1000);
}

// Executar turno do monstro
function executeMonsterTurn() {
  if (currentTurnActor !== 'monster' || combatStatus !== 'in_progress') return;
  
  // Selecionar um ataque aleatório
  const attackIndex = Math.floor(Math.random() * currentMonster.attacks.length);
  const attack = currentMonster.attacks[attackIndex];
  
  // Rolar d20 para ataque
  const attackRoll = Math.floor(Math.random() * 20) + 1;
  const attackTotal = attackRoll + attack.attack_bonus;
  
  // Verificar se é um acerto crítico (20 natural)
  const isCritical = attackRoll === 20;
  
  // Verificar se o ataque acerta
  const isHit = isCritical || attackTotal >= currentCharacter.ac;
  
  if (isHit) {
    // Calcular dano
    let damageRoll;
    
    if (isCritical) {
      // Dano crítico (dobro de dados)
      damageRoll = rollDice(attack.damage_dice) * 2 + attack.damage_bonus;
      
      // Adicionar entrada no log
      addLogEntry('monster', `<strong>${currentMonster.name}</strong> ataca com ${attack.name}. <span class="dice-result critical">Acerto Crítico! (${attackRoll})</span> Dano: ${damageRoll} de dano ${attack.damage_type}!`);
    } else {
      // Dano normal
      damageRoll = rollDice(attack.damage_dice) + attack.damage_bonus;
      
      // Adicionar entrada no log
      addLogEntry('monster', `<strong>${currentMonster.name}</strong> ataca com ${attack.name}. <span class="dice-result hit">Acerto! (${attackRoll} + ${attack.attack_bonus} = ${attackTotal} vs CA ${currentCharacter.ac})</span> Dano: ${damageRoll} de dano ${attack.damage_type}!`);
    }
    
    // Aplicar dano ao personagem
    currentCharacter.hp_current = Math.max(0, currentCharacter.hp_current - damageRoll);
    
    // Atualizar a interface do personagem
    updateCharacterUI();
    
    // Verificar se o personagem foi derrotado
    if (currentCharacter.hp_current <= 0) {
      addLogEntry('system', `${currentCharacter.name} foi derrotado!`);
      endCombat('defeat');
      return;
    }
  } else {
    // Ataque falhou
    addLogEntry('monster', `<strong>${currentMonster.name}</strong> ataca com ${attack.name}. <span class="dice-result miss">Erro! (${attackRoll} + ${attack.attack_bonus} = ${attackTotal} vs CA ${currentCharacter.ac})</span>`);
  }
  
  // Passar o turno para o personagem
  currentTurnActor = 'character';
  addLogEntry('system', `Turno de ${currentCharacter.name}!`);
}

// Finalizar o combate
async function endCombat(result) {
  combatStatus = result; // 'victory', 'defeat', 'flee'
  
  // Ocultar os botões de ação
  document.getElementById('action-bar').style.display = 'none';
  
  // Mostrar a mensagem de resultado e botões pós-combate
  document.getElementById('post-combat-actions').style.display = 'flex';
  
  // Mostrar mensagem apropriada
  if (result === 'victory') {
    document.getElementById('victory-message').classList.remove('hidden');
    
    try {
      // Verificar se o sistema de recompensas está disponível
      if (window.rewardsSystem && typeof window.rewardsSystem.processCombatRewards === 'function') {
        // Processar recompensas
        const rewards = await window.rewardsSystem.processCombatRewards(currentCharacter, currentMonster);
        
        // Adicionar entradas no log sobre recompensas
        addLogEntry('system', `Vitória! Você derrotou o ${currentMonster.name}!`);
        addLogEntry('system', `Recompensas: +${rewards.xpGained} XP`);
        
        if (rewards.coinRewards.gold > 0 || rewards.coinRewards.silver > 0 || rewards.coinRewards.copper > 0) {
          let coinText = 'Moedas: ';
          
          if (rewards.coinRewards.gold > 0) {
            coinText += `${rewards.coinRewards.gold} peças de ouro`;
            
            if (rewards.coinRewards.silver > 0 || rewards.coinRewards.copper > 0) {
              coinText += ', ';
            }
          }
          
          if (rewards.coinRewards.silver > 0) {
            coinText += `${rewards.coinRewards.silver} peças de prata`;
            
            if (rewards.coinRewards.copper > 0) {
              coinText += ', ';
            }
          }
          
          if (rewards.coinRewards.copper > 0) {
            coinText += `${rewards.coinRewards.copper} peças de cobre`;
          }
          
          addLogEntry('system', coinText);
        }
        
        // Se recebeu itens, listar no log
        if (rewards.itemRewards && rewards.itemRewards.length > 0) {
          const itemNames = rewards.itemRewards.map(item => item.name).join(', ');
          addLogEntry('system', `Itens encontrados: ${itemNames}`);
        } else {
          addLogEntry('system', 'Nenhum item encontrado.');
        }
        
        // Se subiu de nível, adicionar ao log
        if (rewards.levelInfo.leveledUp) {
          addLogEntry('system', `Parabéns! Você subiu para o nível ${rewards.levelInfo.newLevel}!`);
        }
        
      } else {
        console.error('Sistema de recompensas não encontrado!');
        addLogEntry('system', 'Vitória! Mas não foi possível calcular as recompensas.');
      }
    } catch (error) {
      console.error('Erro ao processar recompensas:', error);
      addLogEntry('system', 'Erro ao calcular recompensas.');
    }
  } else if (result === 'defeat') {
    document.getElementById('defeat-message').classList.remove('hidden');
    addLogEntry('system', 'Você foi derrotado...');
  } else if (result === 'flee') {
    document.getElementById('flee-message').classList.remove('hidden');
    addLogEntry('system', 'Você fugiu do combate.');
  }
}

// Processar recompensas após vitória em combate
async function processCombatRewards() {
  try {
    // Verificar se o sistema de recompensas está disponível
    if (window.rewardsSystem && currentCharacter && currentMonster) {
      // Processar recompensas
      const rewards = await window.rewardsSystem.processCombatRewards(
        currentCharacter, 
        currentMonster
      );
      
      // Exibir recompensas na interface
      window.rewardsSystem.displayRewards(rewards);
      
      // Adicionar entradas no log
      addLogEntry('system', `Você ganhou ${rewards.xpGained} pontos de experiência!`);
      
      // Moedas
      const coinText = [];
      if (rewards.coinRewards.copper > 0) coinText.push(`${rewards.coinRewards.copper} PC`);
      if (rewards.coinRewards.silver > 0) coinText.push(`${rewards.coinRewards.silver} PP`);
      if (rewards.coinRewards.gold > 0) coinText.push(`${rewards.coinRewards.gold} PO`);
      
      if (coinText.length > 0) {
        addLogEntry('system', `Você encontrou ${coinText.join(', ')}!`);
      }
      
      // Itens
      if (rewards.itemRewards && rewards.itemRewards.length > 0) {
        rewards.itemRewards.forEach(item => {
          addLogEntry('system', `Você encontrou: ${item.name} (${getRarityTranslation(item.rarity)})!`);
        });
      }
      
      // Subida de nível
      if (rewards.levelInfo.leveledUp) {
        addLogEntry('system', `Você subiu para o nível ${rewards.levelInfo.newLevel}!`);
      }
      
      // Salvar o personagem atualizado no localStorage
      localStorage.setItem('currentCharacter', JSON.stringify(currentCharacter));
      
      return {
        xpGained: rewards.xpGained,
        coinRewards: rewards.coinRewards,
        itemRewards: rewards.itemRewards,
        levelInfo: rewards.levelInfo
      };
    }
  } catch (error) {
    console.error('Erro ao processar recompensas:', error);
  }
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

// Resetar o combate
function resetCombat() {
  // Limpar o log de combate
  document.getElementById('log-entries').innerHTML = '';
  combatLog = [];
  
  // Restaurar parte da vida do personagem
  const healAmount = Math.floor(currentCharacter.hp_max * 0.3);
  currentCharacter.hp_current = Math.min(currentCharacter.hp_max, currentCharacter.hp_current + healAmount);
  
  // Resetar o turno
  combatTurn = 1;
  
  // Esconder mensagens de resultado
  document.getElementById('victory-message').classList.add('hidden');
  document.getElementById('defeat-message').classList.add('hidden');
  document.getElementById('flee-message').classList.add('hidden');
}

// Adicionar botão "Iniciar Aventura" à ficha de personagem
function addAdventureButton() {
  // Verificar se estamos na página da ficha de personagem
  if (window.location.href.includes('personagem.html')) {
    // Verificar se o botão já existe
    if (!document.getElementById('adventure-btn')) {
      // Criar o botão
      const adventureBtn = document.createElement('button');
      adventureBtn.id = 'adventure-btn';
      adventureBtn.textContent = 'Iniciar Aventura';
      adventureBtn.style.backgroundColor = '#8b0000';
      adventureBtn.style.marginTop = '10px';
      
      // Adicionar evento de clique
      adventureBtn.addEventListener('click', () => {
        // Salvar o personagem atual no localStorage
        if (window.currentCharacter) {
          localStorage.setItem('currentCharacter', JSON.stringify(window.currentCharacter));
          
          // Redirecionar para a página de aventura
          window.location.href = 'adventure.html';
        } else {
          alert('Você precisa gerar um personagem primeiro!');
        }
      });
      
      // Adicionar o botão à página
      const actionsRow = document.querySelector('.actions-row');
      if (actionsRow) {
        actionsRow.appendChild(adventureBtn);
      }
    }
  }
}

// Executar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  // Adicionar botão "Iniciar Aventura" à ficha de personagem
  addAdventureButton();
  
  // Se estivermos na página de aventura, inicializar o combate
  if (window.location.href.includes('adventure.html')) {
    // Verificar se há um personagem salvo
    const savedCharacter = localStorage.getItem('currentCharacter');
    if (savedCharacter) {
      // Inicializar o combate com o personagem salvo
      initializeCombat(JSON.parse(savedCharacter));
    } else {
      // Redirecionar para a ficha de personagem
      alert('Nenhum personagem encontrado. Retornando à ficha de personagem.');
      window.location.href = 'personagem.html';  
    }
  }
  
  // ADICIONAR Event Delegation para o botão de retorno
  document.body.addEventListener('click', (event) => {
    // Verificar se o elemento clicado é o botão #return-btn ou está dentro dele
    if (event.target.matches('#return-btn')) {
      console.log("Clique detectado em #return-btn via delegation.");
      window.location.href = 'personagem.html';
    }
    // Adicionar aqui outras delegações se necessário (ex: #next-encounter-btn)
    else if (event.target.matches('#next-encounter-btn')) {
       console.log("Clique detectado em #next-encounter-btn via delegation.");
       // Chamar a função para o próximo encontro, ex: initializeCombat(currentCharacter);
       resetCombat(); // Resetar estado visual
       initializeCombat(currentCharacter); // Iniciar novo combate
    }
  });
});

async function performAction(actionType, actionName = null) {
  if (currentTurnActor !== 'character' || combatStatus !== 'in_progress') return;
  
  // Definir variáveis necessárias
  let attackRoll, damageRoll, attackBonus, damageBonus;
  let abilityModifier = 0;
  const proficiencyBonus = Math.ceil(currentCharacter.level / 4) + 1;

  // Log para debug
  console.log(`Executando ação: ${actionType} - ${actionName}`);

  // Tratar diferentes tipos de ações
  if (actionType === 'attack') {
    // Encontrar os dados do ataque no personagem
    const attack = currentCharacter.attacks.find(att => att.name === actionName);
    if (!attack) {
      addLogEntry('system', `Erro: Ataque '${actionName}' não encontrado.`);
      return;
    }

    // Executar o ataque usando a função existente
    executeCharacterAttack(attack);
    return;
  } 
  else if (actionType === 'spell') {
    // Encontrar os dados da magia no personagem
    const spell = currentCharacter.spells.find(s => s.name === actionName);
    if (!spell) {
      addLogEntry('system', `Erro: Magia '${actionName}' não encontrada.`);
      return;
    }

    // Determinar o modificador correto com base na classe
    switch (currentCharacter.class.toLowerCase()) {
      case 'wizard':
      case 'artificer':
        abilityModifier = currentCharacter.modifiers.int || 0;
        break;
      case 'cleric':
      case 'druid':
      case 'ranger':
        abilityModifier = currentCharacter.modifiers.wis || 0;
        break;
      case 'bard':
      case 'paladin':
      case 'sorcerer':
      case 'warlock':
        abilityModifier = currentCharacter.modifiers.cha || 0;
        break;
      default:
        // Classe não reconhecida, usar o maior modificador mental
        abilityModifier = Math.max(
          currentCharacter.modifiers.int || 0,
          currentCharacter.modifiers.wis || 0,
          currentCharacter.modifiers.cha || 0
        );
    }

    // Habilidades especiais específicas podem ter lógicas diferentes
    if (actionName === 'Golpe Divino') {
      // Golpe Divino é uma habilidade de Paladino que adiciona dano a um ataque existente
      // mas não faz um ataque separado. Aqui tratamos como uma magia de ataque para simplificar.
      
      // Para Paladino, o modificador de ATAQUE deve ser baseado na arma (geralmente FOR) 
      // e o modificador de DANO adicional vem do CAR (para a parte divina)
      const strMod = currentCharacter.modifiers.str || 0;
      const chaMod = currentCharacter.modifiers.cha || 0;
      
      // Usar o modificador de Força para o ataque (como se fosse um ataque com arma)
      abilityModifier = strMod;
      
      // Calcular bônus de ataque
      attackBonus = abilityModifier + proficiencyBonus;
      
      // Executar o ataque
      attackRoll = Math.floor(Math.random() * 20) + 1;
      const totalAttack = attackRoll + attackBonus;
      
      // Log do resultado da rolagem
      console.log(`Golpe Divino: Rolagem ${attackRoll}, Bônus ${attackBonus}, Total ${totalAttack}`);
      
      // Verificar se acerta com base na CA do monstro
      if (attackRoll === 20) {
        // Acerto Crítico
        const weaponDamage = rollDice('1d8') * 2; // Exemplo: dano da arma dobrado
        const divineDamage = rollDice('2d8'); // Dano do Golpe Divino
        damageRoll = weaponDamage + strMod + divineDamage;
        
        addLogEntry('player', `${currentCharacter.name} lança Golpe Divino. <span class="critical">Acerto Crítico!</span> Dano: ${damageRoll} (${weaponDamage}+${strMod} físico + ${divineDamage} radiante)`);
        
        // Aplicar dano
        currentMonster.hp_current = Math.max(0, currentMonster.hp_current - damageRoll);
        updateMonsterUI();
        
        // Verificar derrota
        if (currentMonster.hp_current <= 0) {
          addLogEntry('system', `${currentMonster.name} foi derrotado!`);
          endCombat('victory');
          return;
        }
      } 
      else if (totalAttack >= currentMonster.ac) {
        // Acerto normal
        const weaponDamage = rollDice('1d8'); // Dano normal da arma
        const divineDamage = rollDice('2d8'); // Dano do Golpe Divino
        damageRoll = weaponDamage + strMod + divineDamage;
        
        addLogEntry('player', `${currentCharacter.name} lança Golpe Divino. Acerto! (${attackRoll} + ${attackBonus} = ${totalAttack} vs CA ${currentMonster.ac}) Dano: ${damageRoll} (${weaponDamage}+${strMod} físico + ${divineDamage} radiante)`);
        
        // Aplicar dano
        currentMonster.hp_current = Math.max(0, currentMonster.hp_current - damageRoll);
        updateMonsterUI();
        
        // Verificar derrota
        if (currentMonster.hp_current <= 0) {
          addLogEntry('system', `${currentMonster.name} foi derrotado!`);
          endCombat('victory');
          return;
        }
      } 
      else {
        // Erro
        addLogEntry('player', `${currentCharacter.name} lança Golpe Divino. Erro! (${attackRoll} + ${attackBonus} = ${totalAttack} vs CA ${currentMonster.ac})`);
      }
    } 
    else if (actionName === 'Curar Ferimentos') {
      // Magia de cura
      const healingRoll = rollDice(spell.healing_dice);
      const healingBonus = abilityModifier;
      const totalHealing = Math.max(1, healingRoll + healingBonus); // Mínimo 1 de cura
      
      // Aplicar a cura
      const oldHp = currentCharacter.hp_current;
      currentCharacter.hp_current = Math.min(currentCharacter.hp_max, currentCharacter.hp_current + totalHealing);
      const actualHealing = currentCharacter.hp_current - oldHp;
      
      addLogEntry('player', `${currentCharacter.name} lança Curar Ferimentos. Cura ${actualHealing} pontos de vida!`);
      updateCharacterUI();
    }
    else {
      // Para outras magias, usar a função existente
      executeCharacterSpell(spell);
      return;
    }
  }
  else {
    addLogEntry('system', `Tipo de ação desconhecido: ${actionType}`);
    return;
  }
  
  // Passar o turno para o monstro
  currentTurnActor = 'monster';
  addLogEntry('system', `Turno de ${currentMonster.name}!`);
  
  // Executar turno do monstro após um breve atraso
  setTimeout(executeMonsterTurn, 1000);
}

// Função auxiliar para rolar dados com a notação padrão (por exemplo, '2d6+3')
function rollDice(notation) {
  if (!notation) return 0;
  
  // Se for apenas um número (d20), rolar 1d20
  if (typeof notation === 'number') {
    return Math.floor(Math.random() * notation) + 1;
  }
  
  // Formato padrão: XdY+Z
  const diceRegex = /(\d+)?d(\d+)([+-]\d+)?/i;
  const match = notation.match(diceRegex);
  
  if (!match) return 0;
  
  const count = parseInt(match[1] || 1);
  const sides = parseInt(match[2]);
  const modifier = parseInt(match[3] || 0);
  
  let total = modifier;
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  
  return total;
}

// Função auxiliar para calcular bônus de proficiência
function calculateProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1;
}

// filepath: /var/www/html/dnd/combat.js (ou utils.js)

function calculateAC(character) {
  let baseAC = 10;
  let dexBonus = character.modifiers.dex;
  let armorAC = 0;
  let shieldBonus = 0;
  let hasArmor = false;

  // Verificar itens equipados
  if (character.equipped && Array.isArray(character.equipped)) {
    character.equipped.forEach(equippedItemName => {
      // Você precisará de uma forma de obter os detalhes do item pelo nome
      // Ex: findItemDetails(equippedItemName) que retorna o objeto do item
      const itemDetails = findItemDetails(equippedItemName); // <<< IMPLEMENTAR findItemDetails

      if (itemDetails) {
        if (itemDetails.type === 'armor' && itemDetails.category !== 'shield') {
          hasArmor = true;
          armorAC = itemDetails.ac; // AC base da armadura
          // Limitar bônus de Destreza para armaduras médias/pesadas (Regra D&D)
          if (itemDetails.category === 'medium') {
            dexBonus = Math.min(dexBonus, 2); // Máx +2 para armadura média
          } else if (itemDetails.category === 'heavy') {
            dexBonus = 0; // Sem bônus de DES para armadura pesada
          }
        } else if (itemDetails.type === 'armor' && itemDetails.category === 'shield') {
          shieldBonus = itemDetails.ac_bonus || 2; // Bônus do escudo
        }
        // Adicionar lógica para outros bônus (anéis, amuletos, etc.)
      }
    });
  }

  // Calcular AC final
  if (hasArmor) {
    // Se estiver usando armadura, AC = AC da armadura + Bônus de DES (limitado) + Bônus de Escudo
    return armorAC + dexBonus + shieldBonus;
  } else {
    // Sem armadura, AC = 10 + Bônus de DES + Bônus de Escudo
    return baseAC + dexBonus + shieldBonus;
  }
}

// --- Função Auxiliar Necessária ---
// Você PRECISA implementar esta função para buscar os detalhes de um item
// Pode ser buscando em uma lista global de itens, ou fazendo fetch se necessário
function findItemDetails(itemName) {
    // Exemplo MUITO SIMPLIFICADO - Substitua pela sua lógica real
    const allItems = [
        { name: "Chain Mail", type: "armor", category: "heavy", ac: 16, strength_requirement: 13 },
        { name: "Escudo", type: "armor", category: "shield", ac_bonus: 2 },
        // ... outros itens ...
    ];
    return allItems.find(item => item.name === itemName);
}
