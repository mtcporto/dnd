// Biblioteca para exportação de PDF
// Requer a biblioteca jsPDF e html2canvas

// Função para carregar as bibliotecas necessárias
async function loadPDFLibraries() {
  return new Promise((resolve, reject) => {
    try {
      // Verificar se as bibliotecas já estão carregadas
      if (typeof window.jspdf !== 'undefined' && typeof window.html2canvas !== 'undefined') {
        console.log('Bibliotecas PDF já carregadas');
        resolve();
        return;
      }
      
      // Contador para rastrear o carregamento das bibliotecas
      let loadedCount = 0;
      const totalLibraries = 2;
      
      // Função para verificar quando todas as bibliotecas estiverem carregadas
      const checkAllLoaded = () => {
        loadedCount++;
        console.log(`Biblioteca carregada: ${loadedCount}/${totalLibraries}`);
        if (loadedCount === totalLibraries) {
          console.log('Todas as bibliotecas PDF carregadas');
          resolve();
        }
      };
      
      // Carregar html2canvas
      const html2canvasScript = document.createElement('script');
      html2canvasScript.src = 'https://html2canvas.hertzen.com/dist/html2canvas.min.js';
      html2canvasScript.onload = checkAllLoaded;
      html2canvasScript.onerror = (e) => {
        console.error('Erro ao carregar html2canvas:', e);
        reject(new Error('Falha ao carregar html2canvas'));
      };
      document.head.appendChild(html2canvasScript);
      
      // Carregar jsPDF
      const jsPDFScript = document.createElement('script');
      jsPDFScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jsPDFScript.onload = checkAllLoaded;
      jsPDFScript.onerror = (e) => {
        console.error('Erro ao carregar jsPDF:', e);
        reject(new Error('Falha ao carregar jsPDF'));
      };
      document.head.appendChild(jsPDFScript);
    } catch (err) {
      console.error('Erro ao carregar bibliotecas PDF:', err);
      reject(err);
    }
  });
}

// Corrigir a função exportCharacterToPDF
async function exportCharacterToPDF(character) {
  try {
    console.log('Iniciando exportação para PDF...');
    
    // Carregar bibliotecas
    await loadPDFLibraries();
    console.log('Bibliotecas carregadas, verificando disponibilidade...');
    
    // Esperar um pouco para garantir que as bibliotecas estejam inicializadas
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Verificar se as bibliotecas estão disponíveis
    if (typeof window.jspdf === 'undefined') {
      throw new Error('Biblioteca jsPDF não carregada corretamente');
    }
    
    if (typeof window.html2canvas === 'undefined') {
      throw new Error('Biblioteca html2canvas não carregada corretamente');
    }
    
    console.log('Bibliotecas disponíveis, gerando conteúdo...');
    
    // Criar um HTML simplificado para a ficha
    const characterDiv = document.createElement('div');
    characterDiv.className = 'character-sheet-export';
    characterDiv.style.width = '800px';
    characterDiv.style.padding = '20px';
    characterDiv.style.backgroundColor = 'white';
    characterDiv.style.color = 'black';
    characterDiv.style.fontFamily = 'Arial, sans-serif';
    
    // Preencher com dados do personagem
    characterDiv.innerHTML = `
      <h1 style="text-align: center; color: #8b0000;">Ficha de Personagem D&D 5e</h1>
      <h2 style="text-align: center;">${character.name}</h2>
      <p style="text-align: center; margin-bottom: 20px;">${character.race} ${character.class} Nível ${character.level}</p>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
        <div style="flex: 1;">
          <h3>Atributos</h3>
          <p><strong>FOR:</strong> ${character.attributes.FOR} (${character.modifiers.FOR >= 0 ? '+' : ''}${character.modifiers.FOR})</p>
          <p><strong>DES:</strong> ${character.attributes.DES} (${character.modifiers.DES >= 0 ? '+' : ''}${character.modifiers.DES})</p>
          <p><strong>CON:</strong> ${character.attributes.CON} (${character.modifiers.CON >= 0 ? '+' : ''}${character.modifiers.CON})</p>
          <p><strong>INT:</strong> ${character.attributes.INT} (${character.modifiers.INT >= 0 ? '+' : ''}${character.modifiers.INT})</p>
          <p><strong>SAB:</strong> ${character.attributes.SAB} (${character.modifiers.SAB >= 0 ? '+' : ''}${character.modifiers.SAB})</p>
          <p><strong>CAR:</strong> ${character.attributes.CAR} (${character.modifiers.CAR >= 0 ? '+' : ''}${character.modifiers.CAR})</p>
        </div>
        
        <div style="flex: 1;">
          <h3>Estatísticas</h3>
          <p><strong>Pontos de Vida:</strong> ${character.hp_current}/${character.hp_max}</p>
          <p><strong>Classe de Armadura:</strong> ${character.ac}</p>
          <p><strong>Iniciativa:</strong> ${character.modifiers.DES >= 0 ? '+' : ''}${character.modifiers.DES}</p>
          <p><strong>Experiência:</strong> ${character.xp || 0}</p>
        </div>
      </div>
      
      <h3>Proficiências</h3>
      <ul>
        ${character.proficiencies.savingThrows.length > 0 ? `<li><strong>Testes de Resistência:</strong> ${character.proficiencies.savingThrows.join(', ')}</li>` : ''}
        ${character.proficiencies.skills.length > 0 ? `<li><strong>Perícias:</strong> ${character.proficiencies.skills.join(', ')}</li>` : ''}
        ${character.proficiencies.armor.length > 0 ? `<li><strong>Armaduras:</strong> ${character.proficiencies.armor.join(', ')}</li>` : ''}
        ${character.proficiencies.weapons.length > 0 ? `<li><strong>Armas:</strong> ${character.proficiencies.weapons.join(', ')}</li>` : ''}
        ${character.proficiencies.tools.length > 0 ? `<li><strong>Ferramentas:</strong> ${character.proficiencies.tools.join(', ')}</li>` : ''}
      </ul>
      
      <div style="text-align: center; margin-top: 30px; font-size: 0.8em; color: #666;">
        Gerado em ${new Date().toLocaleDateString()} | D&D 5e
      </div>
    `;
    
    // Adicionar temporariamente ao body para renderizar
    document.body.appendChild(characterDiv);
    
    console.log('Convertendo HTML para canvas...');
    
    // Usar html2canvas para converter o HTML em uma imagem
    const canvas = await window.html2canvas(characterDiv);
    
    console.log('Canvas gerado, criando PDF...');
    
    // Criar PDF com jsPDF
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Dimensões da página A4 (210 x 297 mm)
    const pageWidth = 210;
    const pageHeight = 297;
    
    // Calcular proporção para fazer a imagem caber na página
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min((pageWidth - 20) / imgWidth, (pageHeight - 20) / imgHeight);
    
    // Posicionar no centro da página
    const x = (pageWidth - imgWidth * ratio) / 2;
    const y = 10;
    
    // Adicionar a imagem ao PDF
    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth * ratio, imgHeight * ratio);
    
    console.log('Salvando PDF...');
    
    // Salvar o PDF
    pdf.save(`${character.name.replace(/\s/g, '_')}_ficha.pdf`);
    
    // Remover o elemento temporário
    document.body.removeChild(characterDiv);
    
    console.log('PDF exportado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao exportar PDF:', error);
    alert('Ocorreu um erro ao exportar o PDF. Por favor, tente novamente.');
    return false;
  }
}

// Corrigir a função generateCharacterSheetHTML
function generateCharacterSheetHTML(character) {
  // Verificar se o personagem existe
  if (!character) {
    throw new Error('Personagem não encontrado');
  }
  
  // Garantir que todas as propriedades existam para evitar erros
  const safeCharacter = {
    name: character.name || 'Sem Nome',
    race: character.race || 'Desconhecida',
    class: character.class || 'Desconhecida',
    level: character.level || 1,
    attributes: character.attributes || { FOR: 10, DES: 10, CON: 10, INT: 10, SAB: 10, CAR: 10 },
    modifiers: character.modifiers || { FOR: 0, DES: 0, CON: 0, INT: 0, SAB: 0, CAR: 0 },
    hp_current: character.hp_current || 0,
    hp_max: character.hp_max || 0,
    ac: character.ac || 10,
    xp: character.xp || 0,
    background: character.background || '',
    proficiencies: {
      savingThrows: (character.proficiencies && Array.isArray(character.proficiencies.savingThrows)) ? character.proficiencies.savingThrows : [],
      skills: (character.proficiencies && Array.isArray(character.proficiencies.skills)) ? character.proficiencies.skills : [],
      armor: (character.proficiencies && Array.isArray(character.proficiencies.armor)) ? character.proficiencies.armor : [],
      weapons: (character.proficiencies && Array.isArray(character.proficiencies.weapons)) ? character.proficiencies.weapons : [],
      tools: (character.proficiencies && Array.isArray(character.proficiencies.tools)) ? character.proficiencies.tools : []
    }
  };

  // Garantir que proficiencies e seus sub-arrays existam
  const proficiencies = character.proficiencies || {};
  const savingThrows = Array.isArray(proficiencies.savingThrows) ? proficiencies.savingThrows : [];
  const skills = Array.isArray(proficiencies.skills) ? proficiencies.skills : [];
  const armor = Array.isArray(proficiencies.armor) ? proficiencies.armor : [];
  const weapons = Array.isArray(proficiencies.weapons) ? proficiencies.weapons : [];
  const tools = Array.isArray(proficiencies.tools) ? proficiencies.tools : [];
  
  // Criar HTML para a ficha de personagem
  const html = `
    <div class="character-sheet-pdf">
      <h1>${safeCharacter.name}</h1>
      <p class="character-subtitle">${safeCharacter.race} ${safeCharacter.class} (Nível ${safeCharacter.level})</p>
      
      <div class="attributes-section">
        <h2>Atributos</h2>
        <div class="attribute-row">
          <div class="attribute">
            <span class="attribute-name">FOR</span>
            <span class="attribute-value">${safeCharacter.attributes.FOR}</span>
            <span class="attribute-mod">(${safeCharacter.modifiers.FOR >= 0 ? '+' : ''}${safeCharacter.modifiers.FOR})</span>
          </div>
          <div class="attribute">
            <span class="attribute-name">DES</span>
            <span class="attribute-value">${safeCharacter.attributes.DES}</span>
            <span class="attribute-mod">(${safeCharacter.modifiers.DES >= 0 ? '+' : ''}${safeCharacter.modifiers.DES})</span>
          </div>
          <div class="attribute">
            <span class="attribute-name">CON</span>
            <span class="attribute-value">${safeCharacter.attributes.CON}</span>
            <span class="attribute-mod">(${safeCharacter.modifiers.CON >= 0 ? '+' : ''}${safeCharacter.modifiers.CON})</span>
          </div>
        </div>
        <div class="attribute-row">
          <div class="attribute">
            <span class="attribute-name">INT</span>
            <span class="attribute-value">${safeCharacter.attributes.INT}</span>
            <span class="attribute-mod">(${safeCharacter.modifiers.INT >= 0 ? '+' : ''}${safeCharacter.modifiers.INT})</span>
          </div>
          <div class="attribute">
            <span class="attribute-name">SAB</span>
            <span class="attribute-value">${safeCharacter.attributes.SAB}</span>
            <span class="attribute-mod">(${safeCharacter.modifiers.SAB >= 0 ? '+' : ''}${safeCharacter.modifiers.SAB})</span>
          </div>
          <div class="attribute">
            <span class="attribute-name">CAR</span>
            <span class="attribute-value">${safeCharacter.attributes.CAR}</span>
            <span class="attribute-mod">(${safeCharacter.modifiers.CAR >= 0 ? '+' : ''}${safeCharacter.modifiers.CAR})</span>
          </div>
        </div>
      </div>
      
      <div class="stats-section">
        <div class="stat">
          <span class="stat-name">Classe de Armadura</span>
          <span class="stat-value">${safeCharacter.ac}</span>
        </div>
        <div class="stat">
          <span class="stat-name">Pontos de Vida</span>
          <span class="stat-value">${safeCharacter.hp_current}/${safeCharacter.hp_max}</span>
        </div>
        <div class="stat">
          <span class="stat-name">Experiência</span>
          <span class="stat-value">${safeCharacter.xp}</span>
        </div>
      </div>
      
      <div class="proficiencies-section">
        <h2>Proficiências</h2>
        <p><strong>Testes de Resistência:</strong> ${savingThrows.length > 0 ? savingThrows.join(', ') : 'Nenhuma'}</p>
        <p><strong>Perícias:</strong> ${skills.length > 0 ? skills.join(', ') : 'Nenhuma'}</p>
        <p><strong>Armaduras:</strong> ${armor.length > 0 ? armor.join(', ') : 'Nenhuma'}</p>
        <p><strong>Armas:</strong> ${weapons.length > 0 ? weapons.join(', ') : 'Nenhuma'}</p>
        <p><strong>Ferramentas:</strong> ${tools.length > 0 ? tools.join(', ') : 'Nenhuma'}</p>
      </div>
    </div>
  `;
  
  return html;
}

// Função auxiliar para obter o dado de vida baseado na classe
function getHitDice(characterClass) {
  if (!characterClass) return 8;
  
  const hitDice = {
    'barbarian': 12,
    'fighter': 10,
    'paladin': 10,
    'ranger': 10,
    'bard': 8,
    'cleric': 8,
    'druid': 8,
    'monk': 8,
    'rogue': 8,
    'warlock': 8,
    'sorcerer': 6,
    'wizard': 6
  };
  
  return hitDice[characterClass.toLowerCase()] || 8;
}

// Função auxiliar para obter testes de resistência por classe
function getSavingThrows(characterClass) {
  if (!characterClass) return [];
  
  const savingThrows = {
    'barbarian': ['FOR', 'CON'],
    'bard': ['DES', 'CAR'],
    'cleric': ['SAB', 'CAR'],
    'druid': ['INT', 'SAB'],
    'fighter': ['FOR', 'CON'],
    'monk': ['FOR', 'DES'],
    'paladin': ['SAB', 'CAR'],
    'ranger': ['FOR', 'DES'],
    'rogue': ['DES', 'INT'],
    'sorcerer': ['CON', 'CAR'],
    'warlock': ['SAB', 'CAR'],
    'wizard': ['INT', 'SAB']
  };
  
  return savingThrows[characterClass.toLowerCase()] || [];
}

// Exportar funções para uso em outros arquivos
window.pdfExport = {
  exportCharacterToPDF,
  loadPDFLibraries
};
