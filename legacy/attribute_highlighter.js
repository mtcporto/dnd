// Mapeamento de atributos principais por classe
const primaryAttributes = {
  'barbarian': ['FOR', 'CON'],
  'bard': ['CAR', 'DES'],
  'cleric': ['SAB', 'CAR'],
  'druid': ['SAB', 'CON'],
  'fighter': ['FOR', 'CON'],
  'monk': ['DES', 'SAB'],
  'paladin': ['FOR', 'CAR'],
  'ranger': ['DES', 'SAB'],
  'rogue': ['DES', 'INT'],
  'sorcerer': ['CAR', 'CON'],
  'warlock': ['CAR', 'CON'],
  'wizard': ['INT', 'SAB']
};

// Função para destacar atributos principais na ficha de personagem
function highlightPrimaryAttributes(characterClass) {
  // Converter para lowercase para garantir compatibilidade
  const lowerClass = characterClass.toLowerCase();
  
  // Obter os atributos principais para a classe
  const primaryAttrs = primaryAttributes[lowerClass] || [];
  
  // Resetar todos os destaques primeiro
  document.querySelectorAll('.attribute-box').forEach(box => {
    box.classList.remove('primary-attribute');
  });
  
  // Aplicar destaque aos atributos principais
  primaryAttrs.forEach(attr => {
    const attrBox = document.querySelector(`.attribute-box[data-attr="${attr}"]`);
    if (attrBox) {
      attrBox.classList.add('primary-attribute');
    }
  });
  
  // Adicionar dicas sobre os atributos principais
  updateAttributeTips(primaryAttrs);
}

// Função para atualizar as dicas sobre atributos principais
function updateAttributeTips(primaryAttrs) {
  // Criar texto de dica
  let tipText = '';
  
  if (primaryAttrs.length > 0) {
    tipText = 'Atributos principais: ';
    primaryAttrs.forEach((attr, index) => {
      tipText += attributeDisplayNames[attr];
      if (index < primaryAttrs.length - 1) {
        tipText += ' e ';
      }
    });
    
    // Adicionar explicação
    tipText += '. Estes atributos são os mais importantes para sua classe.';
  }
  
  // Atualizar o elemento de dica
  const tipElement = document.getElementById('attribute-tips');
  if (tipElement) {
    tipElement.textContent = tipText;
    tipElement.style.display = tipText ? 'block' : 'none';
  } else {
    // Criar o elemento se não existir
    const newTipElement = document.createElement('div');
    newTipElement.id = 'attribute-tips';
    newTipElement.className = 'attribute-tips';
    newTipElement.textContent = tipText;
    
    // Adicionar após a seção de atributos
    const attributesSection = document.querySelector('.attributes-section');
    if (attributesSection) {
      attributesSection.appendChild(newTipElement);
    }
  }
}

// Exportar funções para uso global
window.attributeHighlighter = {
  classAttributes: {
    'Barbarian': ['STR', 'CON'],
    'Bard': ['CHA', 'DEX'],
    'Cleric': ['WIS', 'CHA'],
    'Druid': ['WIS', 'CON'],
    'Fighter': ['STR', 'CON'],
    'Monk': ['DEX', 'WIS'],
    'Paladin': ['STR', 'CHA'],
    'Ranger': ['DEX', 'WIS'],
    'Rogue': ['DEX', 'INT'],
    'Sorcerer': ['CHA', 'CON'],
    'Warlock': ['CHA', 'CON'],
    'Wizard': ['INT', 'WIS']
  },
  
  highlightPrimaryAttributes: function(characterClass) {
    if (!characterClass) return;
    
    const primaryAttrs = this.classAttributes[characterClass] || [];
    
    // Clear existing highlights
    document.querySelectorAll('.attribute-box').forEach(box => {
      box.classList.remove('primary-attribute');
    });
    
    // Apply highlights to primary attributes
    primaryAttrs.forEach(attr => {
      const attrBox = document.querySelector(`.attribute-box[data-attribute="${attr}"]`);
      if (attrBox) {
        attrBox.classList.add('primary-attribute');
      }
    });
    
    // Update attribute tip message
    this.updateAttributeTips(characterClass, primaryAttrs);
  },
  
  updateAttributeTips: function(className, primaryAttrs) {
    const tipsElement = document.getElementById('attribute-tips');
    if (!tipsElement) return;
    
    if (primaryAttrs && primaryAttrs.length > 0) {
      const attrNames = primaryAttrs.map(attr => window.attributeDisplayNames[attr] || attr);
      tipsElement.textContent = `Main attributes: ${attrNames.join(' and ')}. These attributes are the most important for your class.`;
    } else {
      tipsElement.textContent = '';
    }
  }
};
