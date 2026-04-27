# Plano de implantacao

## Objetivo

Entregar um MVP web para gestao de desafios de corrida com:
- consulta publica de desafios ativos;
- autenticacao para operacoes de cadastro;
- apuracao parcial e final por equipe;
- persistencia em Neon Postgres;
- publicacao em Vercel.

## Premissas

- Apenas usuarios administradores cadastrarao desafios, equipes, participantes e resultados.
- O site sera otimizado para celular e usara linguagem visual de app esportivo.
- Os resultados serao armazenados em segundos no banco.
- O frontend nao acessara o banco diretamente. Toda escrita e leitura sensivel passara por API hospedada na Vercel.

## Escopo do MVP

- Home publica com lista de desafios ativos em cards com ranking resumido.
- Tela de detalhes do desafio com foco no ranking das equipes e resultados parciais.
- Tela de equipe com lista simples de participantes e lancamento de resultados individuais.
- Login administrativo.
- Cadastro de desafio, equipe e participantes.
- Regras de apuracao para desafios do tipo `pace` e `tempo_acumulado`.

## Fases

### Fase 1 - Descoberta e definicao

Duracao estimada: 0,5 a 1 dia util

Entregas:
- validar nomes finais dos tipos de desafio;
- definir se desafio pode ser encerrado manualmente;
- confirmar se equipes sao exclusivas por desafio;
- fechar textos principais da interface.

### Fase 2 - Fundacao tecnica

Duracao estimada: 1 dia util

Entregas:
- projeto React + Vite + TypeScript;
- roteamento inicial;
- arquivo global de estilos centralizado;
- configuracao de ambiente local e Vercel;
- cliente de banco e base das funcoes de API.

### Fase 3 - Banco e autenticacao

Duracao estimada: 1 a 1,5 dia util

Entregas:
- schema inicial do Postgres;
- migrations;
- usuario admin;
- login com sessao em cookie HTTP-only;
- protecao de rotas administrativas e endpoints de escrita.

### Fase 4 - Regras de negocio e API

Duracao estimada: 1,5 a 2 dias uteis

Entregas:
- endpoints para desafios, equipes e participantes;
- calculo do lider parcial na home;
- ranking por equipe no detalhe do desafio;
- persistencia de resultado individual em segundos;
- formatacao de entrada em horas, minutos e segundos.

### Fase 5 - Telas do MVP

Duracao estimada: 2 a 2,5 dias uteis

Entregas:
- home publica em cards;
- detalhe do desafio com ranking como elemento principal;
- tela de equipe com lista simples;
- formularios administrativos;
- feedbacks de loading, erro e sucesso.

### Fase 6 - QA e publicacao

Duracao estimada: 1 dia util

Entregas:
- validacao de regras de calculo;
- revisao mobile;
- seed de dados de exemplo;
- deploy em preview;
- deploy em producao.

## Cronograma resumido

- Dia 1: descoberta, setup e estrutura base.
- Dia 2: banco, migrations e autenticacao.
- Dia 3: API e regras de apuracao.
- Dia 4: home e detalhe do desafio.
- Dia 5: tela de equipe e fluxo administrativo.
- Dia 6: refinamento visual, testes e preview.
- Dia 7: ajustes finais e producao.

## Estrategia de publicacao

### Ambientes

- `local`: desenvolvimento e validacao funcional;
- `preview`: deploy automatico por branch ou PR na Vercel;
- `production`: deploy da branch principal apos checklist.

### Fluxo

1. Desenvolver em branch de feature.
2. Validar localmente com banco Neon de desenvolvimento.
3. Publicar preview na Vercel.
4. Revisar regras de ranking e responsividade.
5. Promover para producao.

## Checklist de go-live

- Variaveis de ambiente configuradas na Vercel.
- Banco Neon criado e acessivel.
- Migration aplicada.
- Usuario admin inicial criado.
- Login funcionando em producao.
- Home publica sem rotas protegidas vazando erros.
- Regras de `pace` e `tempo_acumulado` validadas com dados de teste.

## Principais riscos

- Erro de apuracao por interpretar `0` de forma diferente entre pace e tempo.
- Exposicao indevida de operacoes administrativas se a API nao validar sessao no servidor.
- Inconsistencia de ranking se o calculo ficar duplicado entre frontend e backend.

## Mitigacoes

- Centralizar regras de ranking no backend.
- Cobrir calculos com testes unitarios.
- Usar sessao em cookie HTTP-only e middleware de protecao.
