# Fase 2 - Fundacao tecnica

## Status

Fase 2 concluida com scaffold inicial da aplicacao.

## Entregas realizadas

- estrutura base de projeto com `React`, `Vite` e `TypeScript`;
- roteamento principal com home, detalhe do desafio, equipe, login e fallback;
- arquivo global de estilos em `src/styles/global.css`;
- configuracao inicial de ambiente com `.env.example`;
- configuracao de build com `package.json`, `tsconfig` e `vite.config.ts`;
- base de API em `api/` para Vercel Functions;
- cliente inicial de banco Neon em `api/_lib/db.ts`;
- stubs de autenticacao e desafios para preparar as fases 3 e 4.

## Decisoes de implementacao

- os dados do frontend foram mockados para permitir navegacao antes da fase de banco e autenticacao;
- o roteamento foi definido como SPA com fallback em `vercel.json`;
- a identidade visual segue a direcao de app esportivo com cards e foco em mobile;
- as classes visuais ficam concentradas em `src/styles/global.css`.

## Estrutura criada

### Frontend

- `src/app`: bootstrap e roteador;
- `src/layouts`: shell principal;
- `src/pages`: telas base do MVP;
- `src/components`: componentes reutilizaveis;
- `src/lib`: env, tipos, formatadores e helper de API;
- `src/mocks`: dados temporarios para validacao visual;
- `src/styles`: arquivo global de classes.

### Backend base

- `api/health.ts`: endpoint de status;
- `api/challenges/`: inicio do modulo de desafios;
- `api/auth/`: stubs de login e logout;
- `api/_lib`: env, respostas HTTP e conexao com banco.

## Pendencias assumidas para a fase 3

- instalar dependencias e validar build local;
- integrar Better Auth;
- criar schema e migrations;
- substituir dados mockados por leitura real do banco;
- proteger rotas e endpoints administrativos.

## Observacao

Como a fase 2 prioriza fundacao, o app ainda nao grava dados e a autenticacao permanece em modo stub.
