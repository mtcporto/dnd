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
- Sessões, validação no servidor e leitura de personagens limitada ao proprietário. Banco `dnd-development` exclusivo para esta aplicação.

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

As quatro variáveis obrigatórias são `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `BETTER_AUTH_SECRET` e `BETTER_AUTH_URL`. Foram configuradas no ambiente **Development** da Vercel e no `.env.local`, ignorado pelo Git. Não sobrescreva o arquivo local se tiver adicionado novas credenciais ainda não salvas na Vercel.

Não execute migrações usando credenciais de outro aplicativo. O arquivo `.env.example` contém apenas os nomes necessários.

## Arte da seleção de classes

As 12 ilustrações foram geradas com a ferramenta integrada `image_gen.imagegen` e otimizadas em WebP, preservando a imagem completa. Estão em `public/images/classes/`. O conjunto de prompts, assuntos e arquivos está em [docs/class-art-prompts.json](docs/class-art-prompts.json). A interface usa imagens 2D e Motion for React; não há renderização 3D. Somente a classe visível e a imagem de saída durante a transição ficam montadas.

O compêndio também usa nove ilustrações de espécies em `public/images/species/` e quatro de antecedentes em `public/images/backgrounds/`, geradas com a mesma ferramenta e direção visual. Os prompts estão em [docs/species-art-prompts.json](docs/species-art-prompts.json) e [docs/background-art-prompts.json](docs/background-art-prompts.json).

## Configuração do Google

O cliente OAuth Web **DND** foi criado no projeto `umbrella-mtcporto`. As credenciais estão no `.env.local` e no ambiente Development da Vercel. O login real foi validado no navegador integrado do VS Code, incluindo o retorno ao aplicativo e a sessão autenticada. A configuração de Production continua pendente.

1. No projeto existente `umbrella-mtcporto` (nome `umbrella`), crie um cliente do tipo **Aplicativo Web**, chamado **DND**, em https://console.cloud.google.com/auth/clients?project=umbrella-mtcporto. Configure a identidade e o público do aplicativo no Google Auth Platform.
2. Registre os redirect URIs:
   - `http://localhost:3001/api/auth/callback/google`
   - `https://dnd-coral.vercel.app/api/auth/callback/google` para o futuro deploy de produção.
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

O último comando requer o servidor na porta 3001 e usa o banco Development do DND. Verifica sessão assinada, salvamento/consulta, separação entre contas e rejeição de escrita de outra origem. Ele **não** substitui o teste do fluxo OAuth real do Google.

## Conteúdo e banco

```bash
npm run catalogue:update
npm run db:generate
npm run db:migrate
```

O importador escreve o snapshot somente após completar a coleta. O formulário recebe somente o recorte de dados necessário; o catálogo completo fica no servidor. Migrações SQL estão em `server/db/migrations/`.

## Publicação na Vercel

A `main` já contém a reconstrução em Next.js e a correção que adia a inicialização do banco e da autenticação. Configure `main` como Production Branch na integração Git da Vercel. Novos commits nessa branch devem iniciar um deploy da versão atual; o redeploy de uma execução antiga reutiliza o commit daquela execução.

Confira a branch e o commit na linha de clonagem dos logs antes de avaliar o build. Para habilitar contas e salvamento em produção, prepare um banco separado, execute as migrações e configure as variáveis de Production. O retorno Google de produção já está registrado no cliente DND.

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
dedicado ao ambiente e execute as migrações antes de habilitar o salvamento.
Variáveis configuradas apenas em Development não são usadas pelos deploys.
