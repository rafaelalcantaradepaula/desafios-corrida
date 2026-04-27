# Arquitetura e produto

## Direcao do produto

Respostas confirmadas para a interface:
- estilo visual: `app esportivo`;
- home: `cards com ranking resumido`;
- detalhe do desafio: foco principal no `ranking das equipes`;
- tela de equipe: `lista simples`.

Decisoes funcionais fechadas na fase 1:
- nomes publicos dos tipos: `Pace medio` e `Tempo acumulado`;
- nomes tecnicos recomendados: `pace` e `time`;
- encerramento manual do desafio pelo admin;
- equipes tratadas como exclusivas por desafio no MVP.

## Stack recomendada

- `React + Vite + TypeScript` para o frontend;
- `React Router` para navegacao;
- `Vercel Functions` para a API;
- `Neon Postgres` para persistencia;
- `Better Auth` para autenticacao e sessao;
- `global.css` como ponto central de classes visuais reutilizaveis.

## Por que essa arquitetura

- Mantem o frontend leve e rapido para mobile.
- Evita expor o banco diretamente no cliente.
- Funciona bem com deploy em Vercel.
- Permite evoluir sem trocar stack no curto prazo.

## Autenticacao recomendada

Usar `Better Auth` com:
- login por email e senha para administradores;
- sessao armazenada em cookie HTTP-only;
- usuarios e sessoes no mesmo Postgres do sistema.

Motivos:
- integracao boa com React/Vite e backend em Vercel;
- menor dependencia externa que um provedor de identidade mais pesado;
- controle simples para um MVP com poucos administradores.

## Modelo de dados inicial

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `created_at`

### `challenges`

- `id`
- `title`
- `description`
- `type` (`pace` ou `time`)
- `status` (`draft`, `active`, `finished`)
- `created_at`

### `teams`

- `id`
- `name`
- `created_at`

### `challenge_teams`

- `id`
- `challenge_id`
- `team_id`
- `created_at`

### `participants`

- `id`
- `challenge_team_id`
- `name`
- `result_seconds`
- `created_at`

## Regras de negocio

### Desafio do tipo `pace`

- cada participante pode ter resultado individual opcional;
- se nao houver valor, gravar `0`;
- a media deve considerar apenas participantes com resultado maior que `0`;
- vence a equipe com menor media de pace.

### Desafio do tipo `tempo_acumulado`

- cada participante pode ter resultado individual opcional;
- se nao houver valor, gravar `0`;
- a apuracao soma todos os resultados da equipe;
- vence a equipe com menor tempo acumulado.

## Diretrizes de interface

- visual mobile-first;
- cards com informacao objetiva e leitura rapida;
- poucos elementos visuais por tela;
- tipografia, espacos e cores definidos por classes globais;
- formularios em blocos curtos, com foco em toque e leitura.

## Estrutura sugerida de telas

### Home

- cabecalho curto;
- lista de desafios ativos;
- cada card mostra nome, tipo, quantidade de equipes e lider parcial;
- botao de criar novo desafio apenas para usuario autenticado.

### Detalhe do desafio

- resumo do desafio no topo;
- ranking das equipes em destaque;
- bloco de acoes para incluir equipe;
- acesso para abrir uma equipe e lancar resultados.

### Tela de equipe

- lista simples de participantes;
- cada item mostra nome e resultado atual;
- formulario de resultado com campos `horas`, `minutos` e `segundos`;
- indicacao da unidade de pace em `min/km`.

## API inicial

- `GET /api/challenges`
- `GET /api/challenges/:id`
- `POST /api/challenges`
- `POST /api/challenges/:id/teams`
- `GET /api/challenge-teams/:id`
- `POST /api/challenge-teams/:id/participants`
- `PATCH /api/participants/:id/result`
- `POST /api/auth/login`
- `POST /api/auth/logout`

## Observacoes tecnicas

- O calculo do ranking deve ser centralizado na API.
- O frontend deve receber resultados ja apurados sempre que possivel.
- Seeds com exemplos de `pace` e `tempo_acumulado` aceleram QA e demos.
