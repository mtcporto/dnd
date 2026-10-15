# D&D Aventuras

Reconstrução em Next.js, TypeScript, Turso/libSQL e Better Auth com Google. Regras revisadas de 2024; primeiro aventuras solo, depois campanhas com mestre e jogadores.

A versão antiga está preservada em `legacy/` e no histórico da `main`. A reconstrução começou na branch `rebuild/next-rpg-2024`.

## Primeira etapa entregue

- Página inicial, personagens, criação guiada e compêndio.
- Snapshot da API 5e-bits de 2024: 12 classes, 9 espécies, 4 antecedentes e 339 referências de magias. Campos `description` normalizados para a leitura da interface.
- Rascunhos de nível 1 com matriz padrão, bônus de antecedente, modificadores, PV, iniciativa e defesa sem armadura. Defesas específicas de Bárbaro/Monge e Dwarven Toughness incluídas na prévia.
- Rascunho temporário na aba e download em JSON; salvamento no Turso vinculado à conta Google.
- Escolhas de perícias e ferramentas por classe, antecedente e espécie, com validação de origem e duplicações no servidor. Ficha com as 18 perícias, testes de resistência e Percepção passiva; bônus de iniciativa do talento Alert aplicado.
- Seleção visual das 12 classes: ilustrações originais em WebP, interface escura, transições em Motion for React, navegação por teclado e movimento reduzido. A seleção continua nas origens e na ficha existentes. As artes representam arquétipos, não um retrato personalizado da espécie/identidade escolhida.
- Lista de personagens como seleção de aventureiros, com arte, atributos e acesso à ficha. Fichas salvas seguem o mesmo tema visual e organizam perícias, resistências, características e história. As páginas exibem os valores salvos, sem recalcular ou alterar personagens existentes.
- Página inicial no mesmo tema escuro e ilustrado, com acessos à criação, personagens salvos e compêndio; composição responsiva usando as artes existentes.
- O carrossel da página inicial percorre as 12 classes, mantendo três cartas visíveis. A cada cinco segundos, uma lateral vem ao centro e a carta que passa por trás apresenta a próxima classe, com rotação e profundidade via Motion/CSS. É possível avançar ou voltar clicando nas laterais e pausar a rotação. A animação pausa com mouse/foco nas cartas, fora da área visível e em abas ocultas; movimento reduzido desativa a rotação automática.
- Compêndio ilustrado com galerias e páginas de detalhes para 12 classes, 9 espécies e 4 antecedentes. As características, os traços e os talentos de origem vêm do catálogo; as imagens representam exemplos visuais. Classes e espécies podem ser pré-selecionadas ao iniciar um personagem, preservando os demais dados do rascunho.
- Sessões, validação no servidor e leitura de personagens limitada ao proprietário. Um único banco Turso `dnd-development`, exclusivo do DND, compartilhado entre desenvolvimento e produção.

As fichas são **rascunhos**: idiomas, equipamento, escolhas adicionais de talentos/classes/espécies (incluindo especialização em perícias) e magias ainda precisam ser finalizados. O novo sistema de combate ainda não foi implementado. O registro do escopo e da arquitetura está em [docs/rebuild-plan.md](docs/rebuild-plan.md).

## Executar localmente

Requer Node.js 24 e npm. O projeto está vinculado a `marco-portos-projects/dnd` na Vercel.

```bash
npm ci
vercel link --yes --project dnd --scope marco-portos-projects
vercel env pull .env.local --yes
npm run db:migrate
npm run dev
```

Abra http://localhost:3001. Essa porta mantém o WoW livre na 3000.

As quatro variáveis obrigatórias são `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. Estão configuradas nos ambientes **Development** e **Production** da Vercel. Ambos usam o mesmo banco; a URL de autenticação e a chave de sessão são específicas de cada ambiente. `.env.local` e `.env.production.local` são privados e ignorados pelo Git. Não sobrescreva arquivos locais com credenciais ainda não salvas na Vercel.

Não execute migrações usando credenciais de outro aplicativo. O arquivo `.env.example` contém apenas os nomes necessários.

## Arte da seleção de classes

As 12 ilustrações foram geradas com a ferramenta integrada `image_gen.imagegen` e otimizadas em WebP, preservando a imagem completa. Estão em `assets/images/classes/`. O conjunto de prompts, assuntos e arquivos está em [docs/class-art-prompts.json](docs/class-art-prompts.json). A interface usa imagens 2D e Motion for React; não há renderização 3D. Somente a classe visível e a imagem de saída durante a transição ficam montadas.

O compêndio também usa nove ilustrações de espécies em `assets/images/species/` e quatro de antecedentes em `assets/images/backgrounds/`, geradas com a mesma ferramenta e direção visual. Os prompts estão em [docs/species-art-prompts.json](docs/species-art-prompts.json) e [docs/background-art-prompts.json](docs/background-art-prompts.json).

## Configuração do Google

O cliente OAuth Web **DND** foi criado no projeto `umbrella-mtcporto` e configurado em Development e Production. O login real local foi validado no navegador integrado do VS Code. Em produção, foram verificados o redirecionamento ao Google e o salvamento/leitura com sessões assinadas.

1. No projeto existente `umbrella-mtcporto` (nome `umbrella`), crie um cliente do tipo **Aplicativo Web**, chamado **DND**, em https://console.cloud.google.com/auth/clients?project=umbrella-mtcporto. Configure a identidade e o público do aplicativo no Google Auth Platform.
2. Registre os redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `https://dnd-coral.vercel.app/api/auth/callback/google` para produção.
3. Adicione `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET` ao `.env.local`, sem publicar seus valores. Em modo de teste no Google, inclua os usuários que testarão o login.
4. Reinicie o servidor local. Depois de validar o login real, configure esses valores também nos ambientes correspondentes da Vercel.

O Google Cloud CLI instalado em `/home/mtcporto/.local/google-cloud-sdk/bin/gcloud` tem acesso confirmado ao projeto. Seus comandos `iam oauth-clients` e `iap oauth-clients` criam clientes de Workforce Identity Federation/IAP, não o cliente de login Google desta aplicação. O cliente DND foi criado pelo Console no navegador integrado do VS Code.

Somente os dados necessários ao login são solicitados; não há integração com Drive/Gmail. A interface não oferece login por senha. O teste de persistência cria uma instância de autenticação isolada em memória com cadastro por senha apenas para gerar sessões de teste, sem expor esse método na aplicação, e remove todos os registros temporários ao terminar.

## Verificação

```bash
npm run typecheck
npm run lint
npm test
npm run build
node --env-file=.env.local scripts/verify-flow.cjs
```

O último comando requer o servidor na porta 3001 e usa o banco compartilhado do DND. Verifica sessão assinada, salvamento/consulta, separação entre contas e rejeição de escrita de outra origem. Ele **não** substitui o teste do fluxo OAuth real do Google.

## Assistência de IA

O endpoint compatível com Chat Completions está configurado por `AI_BASE_URL=https://copilot-mtcporto.vercel.app/v1/` e `AI_MODEL=gpt-4o`, sem chave de API. As variáveis são de servidor e estão cadastradas em Development, Preview e Production na Vercel, além dos arquivos locais privados. Foram verificados `/models` e uma chamada real a `/chat/completions`, ambos com HTTP 200.

Essa configuração prepara as próximas funcionalidades, como ajudar a preencher fichas. A interface ainda não oferece assistência generativa. A tradução do catálogo usa Ollama Cloud com `OLLAMA_BASE_URL=https://ollama.com/v1/`, `OLLAMA_MODEL=gpt-oss:120b` e `OLLAMA_API_KEY` privados, com autenticação Bearer. A chave foi reutilizada da configuração local do NexusOne, conforme solicitado, e cadastrada nos três ambientes da Vercel. O teste real retornou HTTP 200 com português e espanhol.

O importador prefere Ollama quando sua chave existe; sem ela, usa o endpoint Copilot configurado em `AI_BASE_URL` e `AI_MODEL`. As variáveis Copilot foram preservadas. A chave Ollama nunca é enviada ao navegador.

## Conteúdo e banco

```bash
npm run catalogue:update
npm run db:generate
npm run db:migrate
```

O importador escreve o snapshot somente após completar a coleta. O formulário recebe somente o recorte de dados necessário; o catálogo completo fica no servidor. Migrações SQL estão em `server/db/migrations/`.

## Publicação na Vercel

A `main` já contém a reconstrução em Next.js e a correção que adia a inicialização do banco e da autenticação. Configure `main` como Production Branch na integração Git da Vercel. Novos commits nessa branch devem iniciar um deploy da versão atual; o redeploy de uma execução antiga reutiliza o commit daquela execução.

Confira a branch e o commit na linha de clonagem dos logs antes de avaliar o build. Contas e salvamento estão configurados em Production. Por escolha do projeto, desenvolvimento e produção compartilham o banco original `dnd-development`, preservando os personagens existentes. Não crie outro banco por ambiente. O retorno Google de produção já está registrado no cliente DND.

## Fontes

Dados de https://www.dnd5eapi.co/api/2024, mantidos por 5e-bits, com regras do SRD 5.2.1 de Wizards of the Coast sob CC BY 4.0. O catálogo SRD não representa todos os conteúdos dos livros comerciais. Informações de atribuição em https://www.dndbeyond.com/srd.

## Deploy sem configuração de contas

O banco e a autenticação são inicializados somente quando utilizados. Sem
`TURSO_DATABASE_URL` ou `BETTER_AUTH_SECRET`, o site oferece as páginas públicas,
o compêndio e a criação de rascunhos com download em JSON. O login fica em
preparação e as APIs de contas/personagens respondem 503.

Para habilitar contas no ambiente correspondente da Vercel (Preview ou Production),
configure `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET`,
`BETTER_AUTH_URL`, `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`. Use um banco
exclusivo do DND, compartilhado entre os ambientes, e execute as migrações antes de habilitar o salvamento.
Variáveis configuradas apenas em Development não são usadas pelos deploys.

## Idiomas

A interface e o catálogo estão disponíveis em inglês, português brasileiro e espanhol. Sem preferência salva, o idioma inicial segue o cabeçalho `Accept-Language` do navegador, incluindo variantes como `pt-BR` e `es-MX`; inglês é o padrão para idiomas não suportados. Uma escolha explícita no seletor tem prioridade sobre o navegador. O seletor no cabeçalho grava a preferência em um cookie de um ano, válido para todas as páginas. A troca mantém os dados do formulário e não chama o modelo. Nomes e histórias escritos pelo jogador permanecem como foram escritos.

O Turso compartilhado contém `catalogue_snapshots`, com uma linha por edição e idioma. `en` preserva o catálogo original da API. `pt` e `es` contêm traduções geradas pelos provedores de IA e revisadas editorialmente; IDs, URLs, números e estruturas das regras permanecem iguais. Cada versão registra o hash da origem, a URL da fonte, o modelo de tradução e a data. As fichas salvas continuam com seus valores originais; traduzir a apresentação não recalcula personagens.

```bash
npm run db:migrate
npm run catalogue:translate # traduz o catálogo atual e grava os três idiomas
npm run catalogue:update   # coleta a API, traduz e publica no banco
```

Os comandos de tradução precisam das variáveis de IA e do Turso em `.env.local`. O manifesto versionado registra a origem de cada tradução e permite reutilizá-la em um checkout novo. O cache incremental fica em `data/local/`, ignorado pelo Git: rodar novamente reutiliza trechos já traduzidos. Antes da publicação, o importador exige cobertura nos três idiomas e verifica que os valores numéricos foram preservados. A tradução é editorial e deve ser revisada ao atualizar as regras.

Os snapshots em `data/catalogue.pt.json` e `data/catalogue.es.json` permitem servir o idioma escolhido se o banco estiver indisponível ou não configurado. `data/ui-source.json` é extraído da interface e `data/ui-translations.json` contém suas traduções, além dos textos necessários para apresentar fichas anteriores. Não há tradução em tempo real nem envio de personagens ao modelo durante a navegação.

As descrições de regras da API são renderizadas como Markdown no compêndio, na seleção de classe e nas fichas, com negrito, itálico, listas e tabelas. A formatação se aplica aos três idiomas; o texto original permanece intacto no banco.

## Bestiário

`/bestiario` reúne as 341 criaturas da API de 2024. A lista tem busca por nome localizado ou inglês, filtros por tipo, tamanho e nível de desafio, ordenação e paginação. Cada ficha apresenta atributos, defesa, deslocamento, sentidos, resistências, habilidades e ações em Markdown. Usa o mesmo idioma e layout do compêndio, sem exigir login.

O importador preserva o JSON original em inglês e publica as versões traduzidas em `bestiary_entries` no Turso compartilhado (uma linha por criatura, edição e idioma). A lista consulta apenas os campos resumidos; as fichas carregam um registro completo. Os snapshots versionados servem como alternativa se o banco estiver indisponível. Nenhuma descrição é inventada quando a fonte não oferece uma.

```bash
npm run db:migrate
npm run bestiary:update # coleta todas as criaturas, verifica imagens e traduz/publica
npm run bestiary:translate # reutiliza o cache e atualiza os três idiomas
npm run catalogue:translate # atualiza textos da interface após mudanças
```

Execute as traduções do catálogo e do bestiário em sequência, pois compartilham o cache incremental. `data/bestiary-images.json` contém somente URLs de imagens verificadas na API; imagens ausentes recebem uma apresentação neutra. Na coleta inicial, 294 das 341 imagens estavam disponíveis. As imagens foram baixadas da API e convertidas para WebP por script; a navegação usa exclusivamente o bucket R2 do DND.


## Imagens no Cloudflare R2

Todas as 396 imagens atuais usam o bucket exclusivo `dnd-images`, servido pelo Worker `cloudflare/images/worker.mjs`: 294 criaturas, 29 imagens de classes, espécies, antecedentes e cenas, e 73 imagens de itens. O Turso guarda URLs, chaves, dimensões, tamanhos e hashes em `bestiary_image_assets`, `image_assets` e `item_image_assets`; os arquivos binários ficam no R2. Os manifestos versionados são gerados da mesma publicação e permitem resolver as URLs sem uma consulta extra ao banco para cada imagem.

A conversão do bestiário usa Sharp, WebP qualidade 85, sem redimensionamento e sem IA. A primeira execução reduziu 506.627.610 bytes para 42.208.412 bytes (91,67%). Os originais baixados e os arquivos de trabalho ficam em `data/local/`, ignorados pelo Git. As ilustrações existentes já estavam em WebP e conservaram seus bytes, evitando nova compressão com perda.

```bash
npm run images:prepare # baixa/reutiliza originais e prepara WebP
npm run images:publish # envia, verifica cada hash público e grava banco/manifestos
npm run images:update  # os dois passos em sequência
npm run images:check   # valida referências e detecta arquivos novos ou alterados
npm run images:deploy  # atualiza o Worker dedicado
```

Para imagens futuras, adicione os arquivos em `assets/images/` (PNG, JPEG, AVIF ou WebP), execute `npm run images:update` e use `imageUrl("/images/categoria/arquivo.png")` da biblioteca `lib/image-assets.ts`. PNG/JPEG/AVIF são convertidos para WebP; WebP é preservado. As imagens do bestiário entram pelo manifesto auditado da API. Nenhuma imagem é publicada na interface antes da verificação do upload. O build bloqueia imagens locais novas ou alteradas que ainda não foram publicadas.

As URLs incluem o hash do conteúdo e usam cache público imutável de um ano. Uma alteração cria outra URL, sem invalidar arquivos anteriores. O envio é incremental e reutiliza objetos cujo hash já está no R2. As páginas usam as URLs R2 diretamente, sem solicitar imagens à API nem recomprimi-las pela Vercel.

O token de upload próprio do DND está em `.env.local` e no segredo `UPLOAD_TOKEN` do Worker, nunca no navegador ou nos manifestos. As variáveis `R2_*` são necessárias apenas aos scripts locais; a Vercel não precisa do token de upload para servir o site. O Worker aceita escrita autenticada apenas de WebP válido, com limite de tamanho e hash correspondente à chave.


## Itens e inventários

O catálogo público `/itens` contém 182 equipamentos e 262 registros de itens mágicos da API 2024 (incluindo famílias e variantes), com busca por nome traduzido ou original, tipo, categoria e raridade. As fichas mostram preços de referência, peso, dano, CA, alcance, propriedades, maestrias, descrições em Markdown e requisitos informados pela fonte. O inglês original e as versões em português/espanhol ficam em `item_catalogues` no Turso, com snapshots locais para contingência. A tradução preserva IDs, campos das regras e valores numéricos; descrições que exigiram correção editorial são identificadas no manifesto.

Na ficha de um personagem, **Abrir inventário** permite adicionar itens manualmente, ajustar quantidades, remover itens, guardar moedas e registrar os pontos de vida atuais. Também é possível adicionar um item pela ficha do catálogo, escolhendo um personagem próprio. Esta etapa é edição de ficha: não simula uma compra e não entrega recompensas de aventuras. O inventário começa vazio e não concede automaticamente equipamento inicial ou dinheiro aos personagens existentes.

A armadura e o escudo equipados calculam a CA atual sem alterar a defesa base salva. Armas consideram atributo, proficiência e empunhadura; duas mãos e escudo não podem ocupar as mesmas mãos. A defesa do monge é ajustada ao usar escudo. Falta de treinamento, requisito de Força e desvantagem em Furtividade aparecem na ficha. Armaduras mágicas permitem escolher um modelo base compatível no espaço de equipamento ou na lista do inventário; o modelo é persistido e determina CA, peso e requisitos. Bônus incondicionais de CA são aplicados; bônus que exigem sintonia permanecem inativos. Armas mágicas com tipos definidos na fonte permitem selecionar a arma base, equipá-la e calcular peso, dano e proficiência; as restrições de empunhadura e escudos são verificadas. Poderes mágicos, sintonia e bônus mágicos de ataque/dano ainda não são automatizados. Outros efeitos especiais e regras de combate não são automatizados nesta etapa.

A poção de cura comum tem uso automático fora de combate: os dados `2d4 + 2` são rolados no servidor, a cura respeita o máximo de vida e uma unidade é consumida na mesma atualização. Não se consome a poção com vida completa; um personagem inconsciente não pode beber sua própria poção. Os demais itens continuam disponíveis para guardar e consultar as regras. A ficha principal reflete os PV atuais e a CA equipada, mantendo os atributos e valores base do personagem.

O inventário é persistido separadamente em `character_inventories`, ligado ao personagem. Todas as leituras e alterações exigem sessão e propriedade do personagem. Os comandos aceitam apenas IDs do catálogo e valores limitados; uma revisão otimista garante que duas requisições simultâneas não dupliquem uma operação nem consumam o mesmo recurso duas vezes. POST exige origem válida e as respostas privadas não são armazenadas em cache.

```bash
npm run items:update    # importa, traduz e publica itens e imagens no R2
npm run items:translate # traduz/publica o catálogo atual, reutilizando o cache
npm run verify:inventory # fluxo real de autenticação, inventário e persistência
```

Os importadores/tradutores de catálogo, bestiário e itens devem ser executados em sequência, pois compartilham o cache de tradução. As 73 imagens disponíveis de itens foram baixadas, convertidas sem redimensionamento e publicadas no mesmo bucket R2; os demais registros usam uma apresentação neutra. Imagens inválidas ou inacessíveis da API não são solicitadas pelo navegador. Novas imagens de itens entram em `npm run images:update`, com verificação pública do hash antes da publicação.

O cache HMR de chamadas do servidor é desativado no desenvolvimento para não reaproveitar respostas de consultas ao banco. As chamadas HTTP ao Turso usam `no-store` e limite de 8 segundos por requisição. Leituras de personagem e inventário repetem uma vez apenas erros transitórios de conexão; comandos de escrita não são repetidos automaticamente. Falhas persistentes continuam sendo exibidas, sem substituir os dados pessoais por um inventário vazio.
