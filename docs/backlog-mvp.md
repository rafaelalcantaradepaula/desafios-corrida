# Backlog do MVP

## Epic 1 - Base do projeto

- criar projeto com React, Vite e TypeScript;
- configurar alias, lint e estrutura inicial;
- criar `global.css` com tokens e classes base;
- configurar roteamento publico e administrativo.

Criterio de aceite:
- aplicacao sobe localmente;
- rotas basicas respondem;
- estilos globais estao centralizados em um unico arquivo.

## Epic 2 - Banco e autenticacao

- configurar conexao com Neon;
- criar migrations do schema inicial;
- integrar Better Auth;
- criar fluxo de login e logout;
- proteger rotas e endpoints administrativos.

Criterio de aceite:
- admin consegue autenticar;
- usuario nao autenticado nao consegue cadastrar dados;
- sessao persiste entre navegacoes.

## Epic 3 - Desafios

- criar cadastro de desafio;
- listar desafios ativos na home;
- mostrar lider parcial em cada card;
- permitir navegacao para detalhes.

Criterio de aceite:
- desafios podem ser criados e listados;
- home exibe o lider parcial corretamente.

## Epic 4 - Equipes por desafio

- permitir incluir equipe em um desafio;
- listar equipes participantes no detalhe;
- exibir ranking parcial ordenado.

Criterio de aceite:
- equipe passa a aparecer no desafio apos cadastro;
- ranking muda conforme os resultados.

## Epic 5 - Participantes e resultados

- cadastrar participantes por equipe;
- lancar resultado individual opcional;
- converter formulario `hh:mm:ss` para segundos;
- exibir valor atual formatado na tela.

Criterio de aceite:
- participante pode existir sem resultado;
- sistema grava `0` quando nao houver valor;
- tela mostra e atualiza os resultados sem ambiguidade.

## Epic 6 - Regras de apuracao

- implementar regra de media para `pace`;
- ignorar `0` na media do pace;
- implementar soma para `tempo_acumulado`;
- definir desempate padrao, se necessario.

Criterio de aceite:
- equipe vencedora muda corretamente conforme o tipo do desafio;
- dados de teste confirmam as duas regras.

## Epic 7 - Experiencia mobile

- ajustar espacamentos, areas de toque e densidade visual;
- criar cards com ranking resumido;
- priorizar leitura do ranking na tela de detalhe;
- manter tela de equipe em lista simples.

Criterio de aceite:
- navegacao confortavel em celular;
- telas principais podem ser usadas com uma mao sem excesso de scroll horizontal.

## Epic 8 - QA e deploy

- adicionar seed de exemplo;
- validar calculos e fluxos de auth;
- configurar preview e producao na Vercel;
- executar checklist final.

Criterio de aceite:
- preview disponivel;
- producao publicada com banco conectado;
- login e consultas funcionando em ambiente real.
