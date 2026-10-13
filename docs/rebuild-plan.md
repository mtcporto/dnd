# D&D — diagnóstico e proposta de reconstrução

Data: 12/10/2026. Situação inicial: `main`, commit `10de239`, árvore limpa e local sincronizado com `origin/main` na inspeção. Os commits do repositório são de 30/04/2025.

## Direção confirmada

A aplicação deve oferecer aventuras solo e, depois, mesas com mestre e jogadores. Começaremos pelo modo solo. Preservar a ideia de criar um personagem, escolher suas ações, evoluir e continuar uma aventura; o código e a interface antigos servem de referência, sem obrigar a nova implementação.

A recomendação de usar as regras revisadas de 2024 foi aceita pelo usuário. Usar o SRD correspondente, com versão explícita por personagem/campanha. Não oferecer dois motores completos simultaneamente no MVP.

## O que o projeto realmente usa

- HTML, CSS e JavaScript, sem framework, banco ou backend próprio.
- D&D 5e SRD API (`https://www.dnd5eapi.co/api/`), comunitária, mantida por 5e-bits; não é uma API oficial da Wizards e não representa todos os livros comerciais.
- Os caminhos antigos sem ano redirecionaram para `/api/2014/` nos testes de hoje.
- Ficha, habilidades, magia e parte do catálogo vêm da API. Monstros de combate, ataques por classe, muitos equipamentos e recompensas são definidos localmente.
- Dados de jogador em `currentCharacter` e `characterHistory`, no localStorage. Não há sincronização entre dispositivos ou separação por conta.
- Imagens dependem de URLs externas do D&D Beyond; dados SRD e ilustrações são fontes distintas.
- O site publicado respondeu HTTP 200 e permitiu gerar um personagem no navegador.

## Problemas confirmados

| Problema | Evidência | Consequência |
| --- | --- | --- |
| Ficha e combate usam nomes diferentes de atributos | Ficha gera STR/DEX/WIS/CHA; `prepareCharacterForCombat` em combat.js lê FOR/DES/SAB/CAR | Bônus de ataque, dano e iniciativa tornam-se NaN. Reproduzido com humano Fighter nível 1 no site publicado; JSON serializa esses valores como null. |
| Histórico tem modelos incompatíveis | `saveCharacterToHistory` grava array de objetos; rotinas posteriores fazem `history[characterName]` e JSON.parse no registro | Carregar personagens depende de caminhos inconsistentes e pode falhar. |
| Carga de personagem chama elemento inexistente | Rotinas usam `character-name-input`; o campo do formulário é `name` | A tentativa de preencher a ficha pode lançar erro. |
| Evolução de magias usa a URL para inferir o nível | rewards.js procura `cantrip`, `level-1` etc. na URL; a API retorna índices como `/spells/magic-missile` | Novas magias podem não ser selecionadas. Usar campos de nível e progressão por classe. |
| Ataques não tratam 1 natural como falha automática | `isCritical || attackTotal >= ac` em combat.js | Ataques podem acertar com 1 natural se o bônus superar a CA. |
| Há versões divergentes de cálculo e renderização | Funções duplicadas, variáveis globais, tabelas próprias e regras entre HTML/JS | Mudanças em equipamento, ficha e combate podem produzir resultados diferentes. |
| Estado e dados inseridos diretamente em HTML | innerHTML recebe nomes, descrições e registros locais | A migração para contas/compartilhamento precisa renderização segura e validação no servidor. |
| Não há testes nem controle persistente de encontros | Combate em variáveis globais e recompensas aplicadas no cliente | Recarregamentos interrompem o combate; uma futura mesa precisa controlar turnos e aplicação de recompensas. |

Estes são exemplos confirmados, não uma auditoria exaustiva de todas as regras da 5e.

## API atual e escolha das regras

Consultas verificadas em 12/10/2026:

- `/api/2014/classes`: HTTP 200, 12 classes.
- `/api/2024/classes`: HTTP 200, 12 classes.
- `/api/2024/classes/wizard` e `/levels`: HTTP 200; 20 níveis na progressão.
- `/api/2024/species`: HTTP 200, 9 espécies.
- `/api/2024/backgrounds`: HTTP 200, 4 antecedentes.
- `/api/2024/spells`: HTTP 200, 339 magias.
- `/api/2024/monsters`: HTTP 200, 341 monstros.
- `/api/2024/equipment/longsword`: HTTP 200.

Esses números descrevem o retorno atual da API, não garantem cobertura completa, precisão de cada regra nem todos os conteúdos dos livros. `/races` não é o caminho de espécies de 2024. O importador deverá usar adaptadores de esquema por edição, validar conteúdo e fixar um snapshot. Não consultar a API externa a cada turno.

A revisão de 2024 agrega Weapon Mastery, alterações de classes/magias e antecedentes com ajustes de atributos e talentos de origem. Isso oferece mais escolhas para um jogo de combate e uma criação guiada. O custo é implementar essas mudanças corretamente; atualizar uma URL não converte a ficha antiga. Não encontramos um censo público confiável de adoção que permita afirmar qual edição possui mais jogadores. Roll20 mantém suporte às duas.

## Arquitetura proposta

| Parte | Escolha | Função |
| --- | --- | --- |
| Código e entrega | GitHub + Vercel | Branch de reconstrução, revisão, testes de regras e previews antes de substituir o site atual. |
| Aplicação | Next.js + TypeScript | Interface, rotas, API própria e validação de comandos do jogador. |
| Contas | Better Auth com Google OAuth | Login, sessões e identificação do proprietário dos personagens. |
| Banco | Turso/libSQL + Drizzle | Contas, personagens, inventário, aventuras, encontros e histórico. Migrações versionadas; um único banco exclusivo do DND, compartilhado por desenvolvimento e produção, conforme escolha do usuário. |
| Conteúdo | Importador da D&D 5e SRD API | Catálogo normalizado/versionado de classes, espécies, habilidades, magias, itens e monstros. Fonte e versão registradas por entrada. |
| Regras | Módulo TypeScript independente da interface | Atributos, dados, ações, recursos, condições, dano, cura, descanso e evolução. Testes com rolagens controladas. |
| Arquivos, quando houver uploads | Cloudflare R2 | Retratos, mapas e anexos. Metadados/permissões no Turso; binários no R2. |
| Tempo real, fase posterior | Decisão após o solo | Definir quando houver requisitos concretos de salas. Um Worker não é pré-requisito do MVP. |

O servidor verifica propriedade, ações permitidas, turno, recursos e resultado. O cliente apresenta escolhas e animações. Aplicar a ação, atualizar o estado e registrar o resultado em uma transação, com revisão de estado e chave de idempotência para evitar recompensas duplicadas ou ações repetidas.

## Modelo de dados inicial

- Tabelas de autenticação conforme o schema do Better Auth.
- `characters`: proprietário, regras/snapshot, identidade, escolhas de criação, nível e versão do estado.
- `character_inventory` e `character_resources`: itens por ID estável, quantidades, equipamento e usos atuais.
- `adventures` e `adventure_runs`: definição da aventura e progresso de cada jogador.
- `encounters` e `encounter_combatants`: estado do combate e lista de participantes; não limitar o schema a jogador versus um monstro.
- `encounter_events`: comando, rolagens, resultado, autor e ordem. Base para histórico e retomada.
- Campanhas, membros e permissões de mestre/jogador serão adicionados na fase multiplayer, sem duplicar o motor de combate.

## Ordem de implementação

1. Preservar a versão atual no Git e desenvolver a reconstrução em uma branch. Fixar regras e catalogar os campos necessários antes de importar.
2. Criar a base Next.js, banco com migrações, Google Auth e uma ficha persistida por conta. Preparar importação validada de personagens locais, sem presumir que registros antigos já são válidos para 2024.
3. Criação guiada: escolhas de atributos, espécie, antecedente, classe, proficiências e equipamentos. Identificar opções indisponíveis e explicar requisitos.
4. Primeiro motor jogável com escopo definido: sugestão de Fighter, Cleric e Wizard, níveis 1–5, ataques, magias suportadas, recursos, dano/cura, condições essenciais, descanso e evolução. Expandir a cobertura de regras depois de testar esse fluxo.
5. Uma aventura solo original e curta, com decisões, testes de perícia, encontros, recompensas e retomada após fechar o navegador. Oponentes automatizados usam as mesmas ações e regras suportadas. Uma aventura não deve se limitar a sortear monstros indefinidamente.
6. Completar classes e conteúdo suportados; incluir busca, inventário, ficha/impressão e retratos quando esses fluxos estiverem sólidos.
7. Campanhas: convite, mestre, vários jogadores, personagens associados, encontros compartilhados e sincronização. Reavaliar comunicação em tempo real nessa etapa.

## Critérios de aceite da primeira entrega jogável

Entrar com Google → criar personagem válido → iniciar aventura → executar encontro → aplicar recompensa uma vez → salvar → sair e retomar. Nenhum atributo NaN, alteração de ficha coerente com combate, recursos gastos corretamente e acesso restrito ao proprietário. Testar falha/indisponibilidade da API de conteúdo sem interromper partidas já iniciadas.

## Fontes

- API e introdução: https://www.dnd5eapi.co/ e https://docs.dnd5eapi.co/introduction
- Dados 2024: https://www.dnd5eapi.co/api/2024
- Diferenças de 2024: https://www.dndbeyond.com/posts/1745-whats-new-in-the-2024-players-handbook
- SRD e versão de referência: https://www.dndbeyond.com/srd
- Suporte às duas versões no Roll20: https://pages.roll20.net/dnd2024
- Google Auth: https://better-auth.com/docs/authentication/google
- Adaptador: https://better-auth.com/docs/adapters/drizzle
- Drizzle/Turso: https://docs.turso.tech/sdk/ts/orm/drizzle
- Arquivos: https://developers.cloudflare.com/r2/

O conteúdo importado deve registrar a atribuição da fonte/SRD. Livros completos, aventuras publicadas e ilustrações não se tornam parte do catálogo por estarem acessíveis em um site.

## Implementação iniciada — 12/10/2026

- Branch local `rebuild/next-rpg-2024`; legado movido para `legacy/`.
- Next.js 16.4, React 19, TypeScript, Better Auth 1.7 e Drizzle/libSQL.
- Vínculo Vercel existente confirmado; banco novo `dnd-development` criado e cinco tabelas migradas. As quatro variáveis de Development foram configuradas e verificadas sem expor valores.
- Cadastro/consulta de **rascunhos** de nível 1: matriz padrão, bônus de origem, cálculos de PV/CA/iniciativa, salvamento por proprietário e download JSON.
- Snapshot da API 2024 importado com normalização dos campos de descrição; formulário recebe dados reduzidos e o compêndio é renderizado no servidor.
- Cliente OAuth Web DND criado no Google Cloud (`umbrella-mtcporto`), credenciais locais e Development configuradas e login real validado no navegador integrado do VS Code. Não tratar as fichas temporárias da aba como dados já salvos na nuvem.
- Escolhas de proficiência da classe, antecedente e traços de espécie: perícias, instrumentos e ferramentas, incluindo alternativas aninhadas do monge. Validação no servidor impede escolhas repetidas, excedentes ou incompatíveis com a origem. Mudanças de origem limpam as escolhas do formulário.
- Catálogo com as 18 perícias e respectivos atributos. Ficha mostra bônus básicos de perícias, testes de resistência e Percepção passiva; Alert acrescenta proficiência à iniciativa. Especialização e escolhas adicionais de talentos/características permanecem pendentes e não são somadas automaticamente.
- Ainda pendentes: finalização de escolhas do personagem, importação do legado, inventário jogável, motor de combate, primeira aventura solo e modo mesa.
- Direção visual atualizada: seleção de classe em uma cena 2D, com lista à esquerda, ilustração central e informações à direita. Foram criadas 12 artes originais, otimizadas em WebP; transições usam Motion for React e respeitam movimento reduzido. O fluxo segue para as origens e a ficha existentes. Os retratos são arquétipos ilustrativos; personalização de aparência/espécie não foi implementada.
- Não houve deploy, commit ou push desta reconstrução nesta etapa.

## Melhorias visuais posteriores

- Pedido do usuário: uma ilustração masculina e uma feminina por classe (ex.: bárbaro e bárbara), com escolhas de classe e gênero em qualquer ordem. Definir as imagens a partir desses dois campos; registrar o gênero no personagem sem alterar suas regras ou atributos. Implementação adiada, conforme solicitado. As artes atuais são arquétipos da classe, não retratos personalizados da espécie/gênero do personagem.
- Lista de personagens e fichas salvas devem seguir o conceito visual da criação: ambiente escuro, arte central/em destaque e dados legíveis, usando os valores persistidos e mantendo o isolamento por conta.
