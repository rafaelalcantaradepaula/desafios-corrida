# Fase 4 - Regras de negocio e API

## Objetivo

Conectar o MVP ao backend real para:
- listar desafios ativos com lider parcial;
- abrir o detalhe do desafio com ranking de equipes;
- abrir a equipe com participantes e resultados;
- permitir cadastros administrativos protegidos por sessao.

## Entregas concluidas

### API

- `GET /api/challenges`
  - retorna os desafios ativos com resumo de ranking.
- `POST /api/challenges`
  - cria um novo desafio ativo.
  - requer sessao administrativa.
- `GET /api/challenges/:id`
  - retorna o detalhe de um desafio com ranking completo.
- `POST /api/challenges/:id/teams`
  - adiciona uma equipe ao desafio.
  - requer sessao administrativa.
- `GET /api/challenge-teams/:id`
  - retorna a equipe, os participantes e os resultados atuais.
- `POST /api/challenge-teams/:id/participants`
  - adiciona participante a uma equipe.
  - requer sessao administrativa.
- `PATCH /api/participants/:id/result`
  - atualiza o resultado individual em segundos.
  - requer sessao administrativa.

### Regras de apuracao

- desafios do tipo `pace`
  - consideram apenas resultados maiores que zero para calcular a media.
  - equipes sem pace valido ficam atras no ranking.
- desafios do tipo `time`
  - somam todos os resultados da equipe.
  - participantes ainda sem resultado contam como `0`.

### Bootstrap de dados

- quando `DATABASE_URL` esta configurada, a camada de desafios garante as tabelas de:
  - `challenges`
  - `teams`
  - `challenge_teams`
  - `participants`
- se a base estiver vazia, a API cria dados iniciais para validacao:
  - `orla-5k`
  - `serra-21k`

### Frontend conectado

- home publica carregando desafios reais da API;
- pagina de desafio carregando ranking real;
- pagina de equipe carregando participantes reais;
- painel admin criando desafios via API;
- administradores autenticados podem:
  - adicionar equipe direto da tela do desafio;
  - adicionar participante direto da tela da equipe;
  - atualizar resultado individual na tela da equipe.

## Fluxo esperado

1. acessar a home e visualizar os desafios ativos.
2. abrir um desafio e acompanhar o ranking das equipes.
3. autenticar como admin.
4. criar desafio, adicionar equipe, adicionar participante e salvar resultados.
5. voltar para o desafio e validar o ranking recalculado.

## Observacoes

- os retornos `404` agora respondem corretamente na API, sem mascarar o status com `200`.
- a navegacao publica continua funcionando mesmo sem sessao.
- quando o ambiente frontend estiver com mock habilitado, as leituras ainda podem cair no fallback local em caso de indisponibilidade da API.
