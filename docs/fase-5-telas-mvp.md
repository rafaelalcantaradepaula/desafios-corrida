# Fase 5 - Telas do MVP

## Objetivo

Fechar a experiencia principal do MVP com foco em:
- navegacao publica mais clara;
- painel administrativo com contexto dos desafios ativos;
- feedbacks visuais para carregamento, sucesso e erro;
- fluxo mobile-first mais consistente entre home, login e admin.

## Entregas concluidas

### Home e telas publicas

- home publica mantida com cards e estados de carregamento, erro e vazio;
- detalhe do desafio com ranking como elemento principal;
- tela de equipe com lista simples e lancamento individual direto na pagina.

### Painel administrativo

- formulario de criacao de desafio refinado;
- bloco de "operacao assistida" para retomar o proximo passo conforme o `intent`;
- listagem de desafios ativos dentro do painel com atalhos para ranking e preparo de equipe;
- destaque visual para o desafio selecionado quando o admin chega por fluxo contextual.

### Login e navegacao

- topo da aplicacao ganhou CTA claro para entrar ou abrir o painel;
- tela de login agora informa o destino do redirecionamento apos autenticar;
- a tela de login tambem oferece retorno rapido para a home e encerramento de sessao.

### Feedbacks e acabamento visual

- mensagens de sucesso e erro separadas por contexto no admin;
- estado de carregamento do painel administrativo;
- novos estilos para cards auxiliares, destaque de contexto e mensagens positivas.

## Fluxo esperado

1. usuario acessa a home e abre um desafio ativo.
2. administrador entra pelo login ou por uma acao contextual.
3. painel admin mostra os desafios ativos e sugere o proximo passo.
4. admin cria desafio, abre ranking, adiciona equipe e continua para participantes e resultados.

## Observacoes

- a camada visual foi refinada sem mudar as regras de negocio da fase 4.
- a validacao por build local continua pendente enquanto o ambiente bloquear `npm install` com erro `403`.
