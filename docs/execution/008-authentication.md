# Prompt 08.1: Authentication

Status: concluido.

## Estado inicial

O corte iniciou com a implementacao parcial do Prompt 08 ainda no worktree. A migration
`infrastructure/database/migrations/0001_authentication.sql` ja havia sido aplicada localmente e foi
preservada sem edicao, renomeacao ou alteracao de hash.

## Diferencas encontradas

Classificacao da tentativa parcial:

| Item                               | Classificacao | Decisao                                              |
| ---------------------------------- | ------------- | ---------------------------------------------------- |
| `app.user_credentials`             | Implementado  | Reaproveitado.                                       |
| `app.email_verification_tokens`    | Implementado  | Reaproveitado.                                       |
| SMTP/Mailpit com Nodemailer        | Parcial       | Movido para adapter SMTP.                            |
| Registro/verificacao/login         | Parcial       | Corrigidos para escopo sem organizacao e sem Bearer. |
| `crypto.scrypt`                    | Incompativel  | Substituido por Argon2id.                            |
| HMAC Bearer/JWT-like               | Incompativel  | Removido do fluxo.                                   |
| Organizacao/membership no registro | Incompativel  | Removido deste corte.                                |
| Sessao opaca/cookie/CSRF           | Ausente       | Implementado.                                        |
| Reset de senha e gestao de sessoes | Ausente       | Implementado.                                        |
| Resend/fake provider               | Ausente       | Implementado atras de adapter.                       |

## Codigo reaproveitado

- Tabelas `app.user_credentials` e `app.email_verification_tokens` da `0001`.
- Normalizacao de e-mail.
- Envio local SMTP com Nodemailer, agora atras de `EmailProvider`.
- Contratos OpenAPI e estrutura `AuthModule`.

## Codigo removido

- Uso de access token/Bearer assinado com HMAC SHA-256.
- Configuracoes `AUTH_TOKEN_SECRET` e `AUTH_ACCESS_TOKEN_TTL_SECONDS`.
- Retorno de token e organizacao no login.
- Criacao de organizacao e membership durante registro.
- Hash de senha com scrypt.

## Migration preservada

`0001_authentication.sql` foi mantida intacta. A funcao
`app_private.active_organization_for_user(uuid)` permanece sem uso neste corte; ela nao autentica,
nao seleciona tenant e nao participa de autorizacao.

## Migration nova

Criada e aplicada:

```text
infrastructure/database/migrations/0002_secure_sessions_and_password_recovery.sql
```

Ela adiciona:

- `app.password_reset_tokens`
- `app.user_sessions`
- `app.login_attempts`
- `app.email_delivery_events`

## Argon2id

`PasswordService` usa Argon2id via pacote `argon2`, com parametros explicitos:

- `memoryCost: 65536`
- `timeCost: 3`
- `parallelism: 1`

Politica de senha: minimo 12 e maximo 128 caracteres, sem composicao artificial.

## Sessoes opacas

Login gera token opaco com `crypto.randomBytes(32)` em `base64url`, persiste somente
`SHA-256(sessionToken)` em `app.user_sessions` e define cookie HttpOnly.

Cookie:

- nome: `tes_session`
- `HttpOnly`
- `Secure` conforme ambiente
- `SameSite=Lax`
- `Path=/`

## CSRF

`GET /api/auth/csrf` gera token CSRF vinculado a sessao. Operacoes mutaveis autenticadas exigem o
header configurado por `CSRF_HEADER_NAME`, com default `X-CSRF-Token`, e validam origem permitida
quando `Origin` esta presente.

## Endpoints

- `POST /api/auth/register`
- `POST /api/auth/resend-verification`
- `POST /api/auth/verify-email`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/auth/csrf`
- `POST /api/auth/logout`
- `POST /api/auth/logout-all`
- `GET /api/auth/sessions`
- `DELETE /api/auth/sessions/:sessionId`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

## Recuperacao

`forgot-password` responde de forma generica, armazena somente hash do token e envia e-mail pelo
adapter. `reset-password` consome token uma unica vez, troca hash Argon2id, revoga sessoes ativas,
invalida demais tokens e envia aviso de senha alterada.

## Rate limiting

Implementado rate limiting especifico em memoria para:

- register
- login
- resend-verification
- forgot-password
- verify-email
- reset-password

As tentativas de login tambem sao persistidas em `app.login_attempts`.

## Adapter de e-mail

Interface criada:

```text
EmailProvider
```

Providers:

- `SmtpEmailProvider`
- `ResendEmailProvider`
- `FakeEmailProvider`

Selecao por `EMAIL_PROVIDER=smtp|resend|fake`.

## SMTP, Resend e fake

SMTP local usa Nodemailer e Mailpit. Resend usa SDK oficial e so e inicializado quando
`EMAIL_PROVIDER=resend`. Fake provider captura mensagens em memoria para testes e e permitido apenas
em `test` e `development`.

## Logs

Redaction inclui senha, token, session token, CSRF, cookie, authorization, senha SMTP e chave
Resend. O relatorio nao registra tokens, senhas nem chaves.

## Validacao manual

Fluxo validado contra API local, PostgreSQL e Mailpit:

- registro criou usuario pendente e enviou e-mail;
- confirmacao ativou usuario;
- login definiu cookie HttpOnly;
- resposta de login nao retornou Bearer/access token;
- `/me`, `/csrf` e listagem de sessoes funcionaram;
- logout revogou sessao;
- sessao revogada foi recusada;
- forgot/reset enviou e-mail, alterou senha e revogou sessoes;
- senha antiga foi recusada e senha nova funcionou.

## Validacoes

Executadas durante o corte e na validacao final:

- `pnpm install --frozen-lockfile`
- `pnpm infra:status`
- `pnpm db:check`
- `pnpm db:migrate`
- `pnpm db:validate`
- `pnpm test:db`
- `pnpm test:db:rls`
- `pnpm auth:cleanup`
- `pnpm format:check`
- `pnpm docs:validate`
- `pnpm architecture:validate`
- `pnpm architecture:boundaries`
- `pnpm typecheck:coverage`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm test:auth`
- `pnpm test:email`
- `pnpm test:api`
- `pnpm test`
- `pnpm build`
- `pnpm openapi:validate`
- `pnpm quality`
- `pnpm run ci`

Observacao: `pnpm quality` foi reexecutado com timeout maior apos a primeira chamada exceder a
janela do executor. O comando concluiu com sucesso. A suite Jest da API emitiu aviso de worker
forcado ao encerrar, mas todos os testes passaram.

## Git status e commit

Antes do commit, o worktree contem somente os arquivos deste corte e a normalizacao de uma linha em
branco duplicada em `docs/product/mvp-scope.md`, sem alterar o conteudo de escopo. Commit local:

```text
feat(auth): complete secure session authentication
```

## Pendencias

- Rate limiting em memoria deve evoluir para armazenamento distribuido antes de multiplas
  instancias.
- Autorizacao/RBAC, organizacoes, convites e empresas continuam fora deste corte.
- `active_organization_for_user` permanece como preparacao futura e sem uso.

## Recomendacao para o Prompt 09

Iniciar o proximo corte usando cookie de sessao e `/api/auth/me` como base de identidade
autenticada, sem introduzir organizacoes, convites ou RBAC antes do corte especifico desses
dominios.
