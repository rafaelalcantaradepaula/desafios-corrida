# Fase 3 - Banco e autenticacao

## Status

Fase 3 concluida com base de banco, seed administrativo e autenticacao por sessao.

## Entregas realizadas

- schema inicial em [db/migrations/001_initial_schema.sql](D:/git/codex/desafios-corrida/db/migrations/001_initial_schema.sql:1);
- seed do administrador inicial em [db/migrations/002_seed_admin.sql](D:/git/codex/desafios-corrida/db/migrations/002_seed_admin.sql:1);
- utilitarios de autenticacao e sessao em [api/_lib/auth.ts](D:/git/codex/desafios-corrida/api/_lib/auth.ts:1);
- login, logout e leitura de sessao em `api/auth/*`;
- tela de login conectada ao backend;
- guia operacional de bootstrap em [docs/bootstrap-db-vercel.md](D:/git/codex/desafios-corrida/docs/bootstrap-db-vercel.md:1).

## O que ficou pronto

- tabela `users` para administradores;
- tabela `admin_sessions` para sessoes em cookie HTTP-only;
- tabelas de dominio para desafios, equipes, relacao desafio-equipe e participantes;
- validacao de senha por `pbkdf2_sha256`;
- cookie de sessao seguro em producao e compativel com desenvolvimento local;
- `BETTER_AUTH_SECRET` reaproveitado como `pepper` do token de sessao.

## Credencial inicial criada

- email: `admin@desafioscorrida.local`
- senha: `Corrida2026!`

Observacao:
- esta senha existe apenas para bootstrap;
- a troca deve ocorrer logo apos a primeira publicacao funcional do fluxo administrativo.

## Pendencias assumidas para a fase 4

- substituir mocks da home, desafio e equipe por leitura real do banco;
- proteger endpoints de escrita com a sessao administrativa;
- implementar cadastro real de desafios, equipes e participantes;
- refletir lider parcial e ranking com base nas regras do banco.

## Observacao tecnica

A arquitetura recomendada segue compativel com Better Auth, mas nesta fase foi implementado um fluxo proprio e enxuto de sessao administrativa para nao travar a evolucao do MVP enquanto o ambiente ainda nao permite instalar dependencias do registry.
