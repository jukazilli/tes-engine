# Prompt 08: Authentication

Status: PARCIAL

Substituido pelo corte corretivo 08.1 em `docs/execution/008-authentication.md`.

## Observacao de preservacao

Este relatorio registra a tentativa parcial do Prompt 08. Ele permanece no historico porque a
implementacao usava scrypt, HMAC Bearer e criava organizacao no registro, pontos substituidos no
corte corretivo 08.1.

Status anterior: concluido.

## Estado inicial

O preflight foi reexecutado com worktree limpo antes de qualquer alteracao de implementacao de
autenticacao.

HEAD atual:

```text
e6ca541 docs: update MVP scope and add authentication prompt documentation
```

Commit da fundacao de banco confirmado na historia:

```text
aaec942 feat(database): establish multitenant persistence
```

Relatorio do Prompt 07 confirmado:

```text
docs/execution/007-database-foundation.md
```

## Triagem do preflight

A baseline falhou inicialmente em gates documentais:

```text
pnpm format:check
```

Arquivo fora do padrao Prettier:

```text
docs/product/mvp-scope.md
```

```text
pnpm docs:validate
```

Erro Markdown:

```text
docs/product/mvp-scope.md:27 MD012/no-multiple-blanks
```

O desvio foi triado como saneamento documental local, causado por uma linha em branco extra em
`docs/product/mvp-scope.md` apos a inclusao de `Gravacao direta na SF4` como evolucao futura. A
decisao de manter motor fiscal, wizard funcional e exportacao real fora deste corte foi preservada:
esses itens continuam importantes para o produto, mas ficam fora do escopo imediato pela
complexidade.

Fonte de precedencia aplicada:

- `docs/product/mvp-scope.md`
- `docs/domain/business-rules-register.md`
- `docs/domain/open-domain-decisions.md`
- `docs/product/product-vision.md`

## Validacoes executadas

- `git status --short`
- `git log --oneline -10`
- `pnpm infra:status`
- `pnpm db:check`
- `pnpm db:validate`
- `pnpm test:db`
- `pnpm test:db:rls`
- `pnpm format:check`
- `pnpm docs:validate`
- `pnpm architecture:validate`
- `pnpm quality`

O saneamento foi aplicado e o preflight foi reexecutado antes da implementacao. Ao final da
implementacao, `pnpm quality` passou cobrindo formatacao, documentacao, arquitetura, typecheck,
lint, banco, testes, build e OpenAPI.

## Implementacao

Arquitetura entregue neste corte:

- Migration `0001_authentication.sql` com `app.user_credentials`, `app.email_verification_tokens` e
  funcao privada `app_private.active_organization_for_user(uuid)`.
- Schema Drizzle atualizado para credenciais e tokens de verificacao.
- Configuracao de auth/e-mail em ambiente: `AUTH_TOKEN_SECRET`, `AUTH_ACCESS_TOKEN_TTL_SECONDS`,
  `AUTH_EMAIL_VERIFICATION_TTL_HOURS`, `SMTP_HOST`, `SMTP_PORT` e `SMTP_FROM`.
- Contratos compartilhados de registro, verificacao de e-mail e login.
- `AuthModule` na API com:
  - `POST /api/auth/register`
  - `POST /api/auth/verify-email`
  - `POST /api/auth/login`
- Hash de senha com `crypto.scrypt`.
- Token de acesso assinado com HMAC SHA-256.
- Envio real de e-mail via SMTP usando `nodemailer` e Mailpit local.
- Validacao de banco atualizada para exigir as novas tabelas e a funcao privada de auth.

## Resultado

Autenticacao, e-mail, migration, endpoints, contratos, configuracao e testes foram implementados
neste corte.

## Verificacao funcional real

Fluxo validado contra API local, banco local e Mailpit:

1. `POST /api/auth/register` criou usuario, organizacao, membership, credencial e token de
   verificacao.
2. E-mail de verificacao foi entregue no Mailpit.
3. `POST /api/auth/verify-email` consumiu o token e ativou o usuario.
4. `POST /api/auth/login` retornou `Bearer` token com expiracao de 3600 segundos.

Evidencia da execucao:

```text
email: auth-test-1782404491@tes-engine.local
userId: 46b7e746-624a-46f6-aef8-c334eb53d912
organizationId: 735d751c-14b8-4a01-96e1-386f0a4534ae
verified: true
tokenType: Bearer
expiresInSeconds: 3600
accessTokenPresent: true
```

## Pendencias objetivas

- Adicionar guard/interceptor de autorizacao em rotas protegidas quando existirem rotas de produto.
- Definir refresh token, reset de senha e politica de lockout em corte futuro.
- Remover registros de teste locais quando o banco local precisar de massa limpa.
