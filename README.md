# Desafios Corrida

MVP web para criar, acompanhar e administrar desafios de corrida por equipes.
A aplicacao publica desafios ativos, mostra rankings parciais e permite que
administradores cadastrem equipes, participantes e resultados.

## Funcionalidades

- Home publica com cards de desafios ativos, quantidade de equipes e lider parcial.
- Tela de desafio com ranking das equipes e resumo do tipo de apuracao.
- Tela de equipe com participantes e resultados individuais.
- Login administrativo com sessao em cookie HTTP-only.
- Painel admin para criar desafios.
- Fluxos protegidos para adicionar equipes, adicionar participantes e atualizar resultados.
- Fallback de dados mockados para desenvolvimento sem backend.

## Regras do MVP

O sistema trabalha com dois tipos de desafio:

- `pace`: vence a equipe com menor pace medio. O calculo considera apenas
  participantes com resultado maior que `0`; equipes sem pace valido ficam no fim
  do ranking.
- `time`: vence a equipe com menor tempo acumulado. O calculo soma os resultados
  dos participantes da equipe; resultados ainda nao lancados ficam como `0`.

Os resultados sao armazenados em segundos no banco e formatados pela aplicacao
como pace (`m:ss /km`) ou duracao (`hh:mm:ss`).

## Stack

- React 19 + Vite 6 + TypeScript
- React Router
- Vercel Functions para a API
- Neon Postgres via `@neondatabase/serverless`
- Sessao administrativa propria em `api/_lib/auth.ts`, assinada com
  `BETTER_AUTH_SECRET`
- Estilos globais em `src/styles/global.css`

## Estrutura

```txt
api/                  Funcoes serverless e bibliotecas da API
api/_lib/             Banco, HTTP, autenticacao e regras de desafio
db/migrations/        Schema inicial e seed do admin
docs/                 Planejamento, arquitetura e guias operacionais
public/               Assets publicos
src/app/              App e rotas React
src/components/       Componentes reutilizaveis
src/layouts/          Layout da aplicacao
src/lib/              Cliente de API, auth, formatadores e tipos
src/mocks/            Dados de fallback para desenvolvimento
src/pages/            Telas publicas e administrativas
src/styles/           CSS global
```

## Rotas da interface

- `/`: desafios ativos.
- `/challenges`: lista de desafios.
- `/challenges/:challengeId`: ranking de um desafio.
- `/teams/:challengeTeamId`: participantes e resultados de uma equipe.
- `/login`: login administrativo.
- `/admin`: painel protegido.

## API

As respostas seguem, em geral, o formato `{ "data": ... }`.

- `GET /api/health`
- `GET /api/challenges`
- `GET /api/challenges?scope=all`
- `POST /api/challenges` - requer admin
- `GET /api/challenges/:id`
- `POST /api/challenges/:id/teams` - requer admin
- `GET /api/challenge-teams/:id`
- `POST /api/challenge-teams/:id/participants` - requer admin
- `PATCH /api/participants/:id/result` - requer admin
- `POST /api/auth/login`
- `GET /api/auth/session`
- `POST /api/auth/logout`

## Requisitos

- Node.js 20 ou superior
- npm
- Banco Neon Postgres para usar persistencia real
- Vercel CLI opcional para rodar frontend e API localmente no mesmo ambiente

## Configuracao local

Instale as dependencias:

```bash
npm install
```

Crie um arquivo `.env.local` a partir de `.env.example`:

```bash
cp .env.example .env.local
```

No PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Variaveis usadas pelo projeto:

```txt
VITE_API_BASE_URL=/api
VITE_USE_MOCK_DATA=true
DATABASE_URL=postgres://user:password@host.neon.tech/database?sslmode=require
BETTER_AUTH_SECRET=replace-with-a-secure-secret
BETTER_AUTH_URL=http://localhost:5173
```

Para trabalhar apenas no frontend, mantenha `VITE_USE_MOCK_DATA=true`.
Nesse modo, se a API nao responder, as telas usam `src/mocks/dashboard.ts`.

Para testar com banco real, configure `DATABASE_URL`, defina
`VITE_USE_MOCK_DATA=false` e rode a aplicacao em um ambiente que sirva as
funcoes de `api/`, como `vercel dev`.

## Scripts

```bash
npm run dev
npm run build
npm run preview
npm run check
```

- `npm run dev`: inicia o Vite para desenvolvimento do frontend.
- `npm run build`: executa TypeScript e gera o build de producao.
- `npm run preview`: serve o build gerado localmente.
- `npm run check`: roda a checagem TypeScript sem emitir arquivos.

## Banco de dados

As migrations estao em `db/migrations`:

1. `001_initial_schema.sql`: cria usuarios, sessoes administrativas, desafios,
   equipes, vinculos entre desafio/equipe e participantes.
2. `002_seed_admin.sql`: cria o administrador inicial.

Para preparar um banco Neon, execute as migrations na ordem acima pelo SQL
Editor do Neon ou por um cliente conectado com `DATABASE_URL`.

A camada `api/_lib/challenges.ts` tambem garante as tabelas principais de
desafios quando `DATABASE_URL` esta configurada e cria dados iniciais caso a
base esteja vazia:

- `orla-5k`
- `serra-21k`

## Admin inicial

Credenciais de bootstrap:

```txt
email: admin@desafioscorrida.local
senha: Corrida2026!
```

Essas credenciais existem para validar o MVP. Em producao, troque o fluxo de
bootstrap por um cadastro administrativo definitivo antes de abrir o sistema
para uso real.

## Deploy

O projeto esta preparado para Vercel:

- `vercel.json` redireciona rotas que nao sejam `/api/*` para `index.html`,
  mantendo o React Router funcionando em refresh direto.
- As funcoes serverless ficam na pasta `api/`.
- O banco recomendado e Neon Postgres.

Configure na Vercel:

```txt
DATABASE_URL
BETTER_AUTH_URL
BETTER_AUTH_SECRET
VITE_API_BASE_URL=/api
VITE_USE_MOCK_DATA=false
```

Depois aplique as migrations do banco, publique o projeto e valide:

- `/api/health`
- `/login`
- `/`
- `/admin`

## Documentacao de apoio

- `docs/arquitetura-produto.md`: decisoes de produto, arquitetura e modelo de dados.
- `docs/bootstrap-db-vercel.md`: passo a passo para Neon, variaveis e bootstrap.
- `docs/fase-4-regras-e-api.md`: endpoints e regras de apuracao.
- `docs/fase-5-telas-mvp.md`: telas e refinamentos do MVP.
- `docs/plano-implantacao.md`: fases, riscos e checklist de publicacao.

## Observacoes tecnicas

- O frontend nao acessa o banco diretamente; leituras e escritas sensiveis
  passam pela API.
- Operacoes administrativas sao validadas no servidor por cookie de sessao.
- A sessao administrativa atual expira apos 5 minutos de inatividade.
- A dependencia `better-auth` esta no `package.json`, mas a implementacao atual
  de autenticacao usa o modulo proprio em `api/_lib/auth.ts`.
