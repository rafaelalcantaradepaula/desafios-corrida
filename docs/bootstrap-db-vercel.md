# Bootstrap do DB na Vercel

## Objetivo

Preparar banco, variaveis e usuario administrativo inicial para subir o MVP na Vercel usando Neon Postgres.

## Credenciais administrativas iniciais

- email: `admin@desafioscorrida.local`
- senha: `Corrida2026!`

Importante:
- use essas credenciais apenas para bootstrap;
- depois do primeiro acesso administrativo, troque a senha no banco ou por uma tela de administracao futura.

## 1. Criar o banco no Neon

1. Crie um projeto no Neon.
2. Crie um database para o ambiente de desenvolvimento ou producao.
3. Copie a connection string completa em formato Postgres.

Exemplo esperado:

```txt
postgres://USER:PASSWORD@ep-xxxxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## 2. Configurar variaveis na Vercel

No projeto da Vercel, abra `Settings > Environment Variables` e cadastre:

- `DATABASE_URL`
- `BETTER_AUTH_URL`
- `BETTER_AUTH_SECRET`
- `VITE_API_BASE_URL`
- `VITE_USE_MOCK_DATA`

Valores recomendados:

- `DATABASE_URL`: string do Neon
- `BETTER_AUTH_URL`: URL publica do projeto, por exemplo `https://seu-projeto.vercel.app`
- `BETTER_AUTH_SECRET`: segredo aleatorio longo, com pelo menos 32 caracteres, usado como `pepper` do token de sessao
- `VITE_API_BASE_URL`: `/api`
- `VITE_USE_MOCK_DATA`: `true` na fase 3 e `false` quando a fase 4 conectar as telas ao banco

## 3. Aplicar o schema inicial

Use o SQL Editor do Neon ou qualquer cliente SQL conectado com `DATABASE_URL`.

Execute primeiro:

- [db/migrations/001_initial_schema.sql](D:/git/codex/desafios-corrida/db/migrations/001_initial_schema.sql:1)

Depois execute:

- [db/migrations/002_seed_admin.sql](D:/git/codex/desafios-corrida/db/migrations/002_seed_admin.sql:1)

## 4. Verificar se o admin foi criado

No SQL Editor, rode:

```sql
SELECT id, name, email, role, created_at
FROM users
WHERE email = 'admin@desafioscorrida.local';
```

Resultado esperado:
- `1` linha retornada
- `role = 'admin'`

## 5. Publicar na Vercel

1. Faça deploy da branch com a fase 3.
2. Abra a rota `/login`.
3. Entre com:
   - email `admin@desafioscorrida.local`
   - senha `Corrida2026!`
4. Confirme se a tela mostra sessao iniciada.

## 6. Checklist rapido de bootstrap

- banco Neon criado;
- `DATABASE_URL` configurada na Vercel;
- migrations executadas;
- usuario admin seedado;
- rota `/api/health` respondendo;
- rota `/login` autenticando com o admin inicial.

## Observacoes

- o backend usa cookie HTTP-only para sessao administrativa;
- em ambiente HTTPS na Vercel, o cookie sai com flag `Secure`;
- localmente, o cookie funciona sem `Secure` para nao bloquear testes em `http://localhost`.
