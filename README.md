# Lume Life Planner

Versão interativa do planner de `planejamento.pdf` — as três folhas viraram três
páginas web, com contas de usuário e tudo salvo automaticamente.

## Como rodar

Precisa de um Postgres. Copie `.env.example` para `.env.local`, preencha
`DATABASE_URL` e `SESSION_SECRET`, e crie as tabelas:

```bash
npx prisma migrate deploy
```

Depois:

```bash
npm run dev
```

Abra http://localhost:3000: a landing conta o que o planner faz e o botão
**Entrar** leva para a conta. Quem ainda não tem uma cria em **Criar conta** — o
primeiro acesso já cai no Mapa do Mês.

Para produção:

```bash
npm run build && npm start
```

## As três páginas

| Página | Rota | O que faz |
| --- | --- | --- |
| **Landing** | `/` | Porta de entrada pública: apresenta as três páginas e leva para o login. Quem já está logado vê os botões apontando direto para o planner. |
| **Mapa do Mês** | `/mes` | Você define quantos hábitos o mês tem. Marque os de hoje tocando nas pastilhas, ou preencha qualquer dia na grade hábitos × dias. A roda radial e o gráfico "Progresso do mês" refletem tudo automaticamente — são só visualização. |
| **Planner Diário** | `/dia` | Tarefas, Inegociáveis, Notas e a Avaliação do dia com as 5 carinhas. |
| **Planejamento Semanal** | `/semana` | Os sete dias, cada um com a sua lista. O alfinete decide o que é rotina: tarefa **fixa** volta toda semana, **solta** fica só na semana em que foi criada. Dois gráficos acompanham o aproveitamento das últimas 12 semanas e o desempenho por dia da semana. |

Navegue entre meses, dias e semanas pelas setas do cabeçalho (o período vive na
URL: `/mes?m=2026-07`, `/dia?d=2026-07-26`, `/semana?w=2026-07-27` — sempre a
segunda-feira).

Extras que a folha de papel não tem:

- **quantos hábitos você quiser** — cada mês tem a lista que você criar (de 1 a 30);
  o botão "Adicionar hábito" cria mais um e o × apaga o hábito e as marcações dele.
- **copiar do mês anterior** — repete os hábitos do mês anterior (nomes e quantidade)
  no mês novo.
- **mover para amanhã** — leva as tarefas não concluídas para o dia seguinte.
- **rotina que persiste** — a tarefa fixa da semana é criada uma vez e reaparece
  em todas as semanas; só a marcação é por semana. Tirar uma da rotina apaga
  também o histórico dela.
- **fixar e soltar** — o alfinete em cada tarefa (e no campo de adicionar) alterna
  entre "toda semana" e "só nesta". Fixar recomeça a rotina na semana aberta, para
  o gráfico não contar como falha um passado em que a tarefa não existia; soltar
  preserva as marcações antigas, então refixar traz o histórico de volta.
- Contadores por hábito, aproveitamento do mês, melhor dia, média e sequência atual.
- Notas e metas se salvam sozinhas, com um aviso discreto de "salvo".
- As páginas imprimem limpas (`Cmd+P`): os controles de navegação somem.

## Design

Paleta verde/oceano, superfícies claras e sombras baixas — a ideia é uma tela
calma, sem contraste agressivo.

- **Tokens** — toda cor, sombra e traço vive em variáveis CSS no topo de
  [app/globals.css](app/globals.css) e é exposta ao Tailwind via `@theme inline`.
  Mudar a marca inteira é mexer nesse bloco.
- **Rampa dos hábitos** — 7 tons do verde profundo ao oceano em
  [lib/theme.ts](lib/theme.ts), lidos pelo SVG da roda, pela lista e pelo gráfico.
- **Movimento** — só transições de cor, 200ms, e tudo respeita
  `prefers-reduced-motion`.
- **Mobile** — o layout foi verificado de 320px para cima, sem rolagem
  horizontal em nenhuma página. No celular: cabeçalho compacto (só "Lume"),
  navegação dividindo a largura em três, alvos de toque maiores, tarefas longas
  quebrando em várias linhas e o botão de remover sempre visível (sem hover no
  toque). A grade de hábitos rola na horizontal com a coluna de nomes fixa; a
  roda vira um resumo de cores com o total no centro.

## Usuários

Login simples com usuário e senha:

- Senhas guardadas com hash **bcrypt** — nunca em texto puro.
- Sessão em cookie **httpOnly** assinado (JWT via `jose`), válida por 30 dias.
- `proxy.ts` bloqueia `/mes`, `/dia` e `/semana` para quem não está logado, e manda
  quem já está logado direto para o planner se tentar abrir `/login`. A landing
  (`/`) passa sempre, logada ou não.
- `requireUser()` confere no banco se o usuário ainda existe; se o cookie estiver
  órfão, `/logout` limpa tudo em vez de entrar em loop de redirecionamento.
- Toda Server Action revalida a sessão, e as tarefas conferem o dono antes de
  qualquer alteração — um usuário não alcança os dados de outro.

O segredo de assinatura vem de `SESSION_SECRET`. Em produção ele é
**obrigatório** (mínimo 32 caracteres): [lib/session.ts](lib/session.ts) derruba
o app na largada se faltar, em vez de cair num segredo padrão que qualquer um
conheceria. Em desenvolvimento há um valor de conveniência. Nunca versione
`.env.local`.

## Onde os dados ficam

PostgreSQL via **Prisma**. O schema é [prisma/schema.prisma](prisma/schema.prisma)
e a conexão vive em [lib/db.ts](lib/db.ts) — um único client, guardado no global
para o hot reload não vazar pools.

| Comando | O que faz |
| --- | --- |
| `npm run db:migrate` | mudou o schema? gera e aplica a migration (desenvolvimento) |
| `npm run db:deploy` | aplica as migrations existentes (produção) |
| `npm run db:studio` | abre o Prisma Studio para olhar os dados |

O `postinstall` roda `prisma generate` sozinho — é o que faz o client existir na
Vercel, onde o `node_modules` vem do cache e o `npm install` pode não rodar.

Detalhes que valem saber:

- **Tabelas e colunas seguem snake_case** (`month_key`, `password_hash`) via
  `@map`/`@@map`, enquanto o TypeScript usa camelCase.
- **`username` é `citext`** — é o banco, e não uma checagem na aplicação, que
  impede "Pedro" e "pedro" de virarem duas contas. A extensão é criada na
  primeira migration.
- **Algumas operações usam SQL cru** (`$queryRaw`/`$executeRaw`), com o motivo
  comentado no código: criar tarefa calculando a posição no próprio INSERT,
  mover as pendentes de um dia para outro e marcar uma tarefa da semana
  conferindo o dono dentro do próprio INSERT. Em chamadas Prisma virariam uma
  leitura mais uma escrita por linha, e abririam corridas entre ler e gravar.
- Use sempre a connection string **pooled** (Neon: host com `-pooler`; Supabase:
  porta 6543) — em serverless cada instância abre o seu próprio pool, e o pooler
  é quem impede o banco de estourar o limite de conexões.
- **TLS sai do `sslmode` da URL**, não de configuração no código. Banco na nuvem
  pede `sslmode=require`; Postgres local sem TLS não deve levar `sslmode`, senão
  a conexão morre com "server does not support SSL connections".

## Deploy na Vercel

1. **Banco** — crie um Postgres no [Neon](https://neon.tech) (ou Supabase). Na
   Vercel dá para adicionar pelo marketplace, em Storage, e a `DATABASE_URL`
   já entra sozinha nas variáveis do projeto.
2. **Variáveis** — em Settings → Environment Variables, confirme `DATABASE_URL`
   e adicione `SESSION_SECRET` (gere com `openssl rand -base64 32`). Sem ela o
   app se recusa a subir, de propósito: com um segredo padrão qualquer pessoa
   forjaria um cookie de sessão.
3. **Tabelas** — rode uma vez, da sua máquina, apontando para o banco de
   produção:

   ```bash
   DATABASE_URL='<url-de-producao>' npx prisma migrate deploy
   ```

   Repita isso a cada deploy que traga migrations novas.

4. **Importar o projeto** na Vercel e fazer deploy. Não há configuração de build
   a mexer: `next build` roda como está.

Escolha para o banco a região mais perto da região das funções da Vercel — cada
consulta é uma ida e volta pela rede, e é isso que domina o tempo de resposta.

## Estrutura

Rotas ficam finas: buscam os dados e entregam a um componente. Toda a interface
mora em `components/`.

```
app/
  page.tsx           landing pública
  (auth)/            login, registro e as actions de sessão
  (planner)/         layout protegido + as três rotas
    mes|dia|semana/  page.tsx (dados) + actions.ts (escrita)
  logout/route.ts    limpa o cookie de sessão

components/
  brand/             Logo e a marca do Lume
  ui/                Card, Button, ButtonLink, IconButton, Field,
                     Checkbox, Stat, SectionTitle, SavedFlag, Icons
  landing/           LandingHeader, Hero, PlannerPreview, PreviewWheel,
                     Features, Details, CallToAction, LandingFooter
  layout/            AppHeader, NavLinks, PageHeader, PeriodNav
  auth/              AuthCard (login e cadastro compartilham o mesmo)
  planner/
    TaskItem         uma tarefa (marcar, editar, remover) — dia e semana usam
    month/           MonthBoard (estado), TodayHabits + HabitGrid (entrada),
                     HabitWheel + ProgressChart (visualização)
    day/             DayBoard, TaskList, NotesCard, MoodPicker, Face, DateNav
    week/            WeekBoard (estado), DayColumn (entrada),
                     WeekProgressChart + WeekdayBars (visualização)

lib/
  db.ts              client do Prisma (singleton, adapter pg)
  auth.ts            sessão, hash de senha, requireUser()
  session.ts         assinatura/verificação do JWT (edge-safe)
  dates.ts           meses, dias por mês, ano bissexto, semana (segunda a domingo)
  theme.ts           rampa de cores dos hábitos e do gráfico
  cn.ts              junção de classes
  hooks/useAutosave  gravação automática com debounce

prisma/
  schema.prisma      modelos e mapeamento para as tabelas
  migrations/        histórico versionado do schema

prisma.config.ts     configuração da CLI do Prisma
proxy.ts             proteção de rotas
```

Next.js 16 (App Router), React 19, Tailwind v4, TypeScript, Prisma 7, PostgreSQL.
