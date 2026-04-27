# Fase 1 - Descoberta e definicao

## Status

Fase 1 concluida em nivel de especificacao funcional do MVP.

## Objetivo da fase

Fechar as decisoes iniciais que destravam a implementacao:
- nomenclatura final dos tipos de desafio;
- comportamento de encerramento do desafio;
- escopo de equipes no MVP;
- textos principais da interface.

## Decisoes fechadas

### 1. Tipos de desafio

Nomes finais para o produto:
- `Pace medio`
- `Tempo acumulado`

Nomes tecnicos recomendados:
- `pace`
- `time`

Regras vinculadas:
- `pace`: vence a equipe com menor media de pace, ignorando resultados `0` no calculo da media;
- `time`: vence a equipe com menor soma total de segundos.

Justificativa:
- os nomes publicos ficam simples para o usuario final;
- os nomes tecnicos ficam curtos e objetivos para API, banco e validacoes.

### 2. Encerramento do desafio

Decisao do MVP:
- o desafio podera ser encerrado manualmente por um administrador;
- status recomendados: `draft`, `active` e `finished`;
- apenas desafios `active` aparecem na home publica;
- desafios `finished` continuam acessiveis por link direto e podem ser exibidos depois em uma listagem historica.

Justificativa:
- o encerramento manual evita que o sistema assuma criterio automatico sem regra de negocio definida;
- permite conferencia final antes de consolidar o resultado.

### 3. Escopo das equipes

Decisao do MVP:
- equipes serao consideradas exclusivas por desafio no fluxo funcional;
- tecnicamente pode existir uma tabela base de equipes, mas a composicao de participantes vale sempre no contexto do desafio;
- o usuario nao precisara reaproveitar automaticamente a mesma equipe entre desafios no MVP.

Justificativa:
- o briefing sugere que cada desafio tem suas equipes participantes;
- reduz complexidade de administracao, duplicacao de regras e impacto de alteracoes em historico.

### 4. Resultado individual

Decisao do MVP:
- resultado individual e opcional;
- quando nao informado, sera salvo como `0`;
- o formulario exibira `horas`, `minutos` e `segundos`;
- no caso de pace, a unidade exibida sera `min/km`, mas o valor sera salvo em segundos.

## Fluxo funcional fechado

1. Admin cria um desafio em status `draft`.
2. Admin ativa o desafio quando quiser publica-lo.
3. Admin inclui equipes no desafio.
4. Admin inclui participantes em cada equipe.
5. Admin lanca resultados individuais.
6. Sistema recalcula o ranking parcial.
7. Admin encerra manualmente o desafio quando a apuracao terminar.

## Textos-base da interface

### Home publica

Titulo principal:
- `Desafios de corrida`

Subtitulo:
- `Acompanhe os desafios ativos e veja quem lidera em tempo real.`

Botao principal para admin autenticado:
- `Novo desafio`

Informacoes do card:
- nome do desafio;
- tipo do desafio;
- quantidade de equipes;
- lider atual;
- indicador resumido do resultado parcial.

Estado vazio:
- `Nenhum desafio ativo no momento.`

### Tela de detalhe do desafio

Titulo de secao principal:
- `Ranking das equipes`

Bloco de resumo:
- `Tipo do desafio`
- `Descricao`
- `Status`

Acoes:
- `Adicionar equipe`
- `Abrir equipe`
- `Encerrar desafio`

Estado vazio do ranking:
- `Ainda nao ha resultados lancados para este desafio.`

### Tela de equipe

Titulo:
- nome da equipe

Subtitulo:
- `Participantes e resultados`

Acoes:
- `Adicionar participante`
- `Salvar resultado`

Campos do formulario:
- `Horas`
- `Minutos`
- `Segundos`

Texto auxiliar para pace:
- `Informe o pace em minutos por quilometro. O sistema salva o valor em segundos.`

Estado vazio:
- `Nenhum participante cadastrado nesta equipe.`

### Autenticacao

Titulo:
- `Acesso administrativo`

Subtitulo:
- `Entre para cadastrar desafios, equipes e resultados.`

Campos:
- `Email`
- `Senha`

Botao:
- `Entrar`

## Criterios de aceite da fase 1

- nomes publicos e tecnicos dos tipos de desafio definidos;
- politica de encerramento manual definida;
- estrategia de equipes por desafio definida;
- textos-base das principais telas documentados;
- fluxo funcional minimo validado para seguir para a implementacao.

## Pendencias para fases seguintes

- definir se a listagem de desafios encerrados entra no MVP ou fica para pos-MVP;
- definir regra de desempate, caso necessario;
- definir se o status `draft` ficara visivel apenas no admin ou tambem em preview autenticado.
