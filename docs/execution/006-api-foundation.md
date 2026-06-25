# Prompt 006 - API foundation

## 1. Status

Concluido.

## 2. Estado inicial

Worktree limpo no inicio. A API estava no scaffold basico com `GET /api/health`, leitura direta de
`process.env` em `main.ts` e sem configuracao validada, logger estruturado, OpenAPI, filtro global
de erros ou correlation ID.

## 3. Commit base

`587c116 chore: repair typecheck quality gate`.

## 4. Verificacao dos Prompts 04 e 05

Arquivos confirmados:

- `docs/execution/004-quality-gates-and-ci.md`
- `docs/execution/005-documentation-governance.md`

O nome `docs/execution/004-quality-ci.md` citado no prompt nao existe; a fonte canonica atual e
`004-quality-gates-and-ci.md`.

## 5. Verificacao da numeracao dos ADRs

Antes dos novos ADRs, havia ADRs de `001` a `013`, sem duplicidade. O indice referenciava os ADRs
existentes.

Depois do corte, foram criados os ADRs `014` a `017`. O validador documental agora tambem falha se
um ADR existente nao estiver referenciado em `docs/adr/README.md`.

## 6. Correcoes documentais realizadas

- Criado `docs/architecture/api-foundation.md`.
- Atualizado `docs/adr/README.md`.
- Atualizado `docs/architecture/module-map.md`.
- Atualizado `docs/README.md`.
- Atualizado `README.md`.
- Atualizado `docs/execution/README.md`.

## 7. Dependencias adicionadas e versoes

- `@nestjs/config`: `^4.0.4`
- `@nestjs/swagger`: `^11.4.4`
- `class-transformer`: `^0.5.1`
- `class-validator`: `^0.15.1`
- `helmet`: `^8.2.0`
- `joi`: `^18.2.3`
- `nestjs-pino`: `^4.6.1`
- `pino`: `^10.3.1`
- `pino-pretty`: `^13.1.3`

## 8. Arquivos criados

- `apps/api/src/api-foundation.spec.ts`
- `apps/api/src/bootstrap/configure-api-application.ts`
- `apps/api/src/common/errors/api-error-code.ts`
- `apps/api/src/common/filters/api-exception.filter.ts`
- `apps/api/src/common/logging/logging.config.ts`
- `apps/api/src/common/middleware/correlation-id.constants.ts`
- `apps/api/src/common/middleware/correlation-id.middleware.ts`
- `apps/api/src/common/middleware/correlation-id.service.spec.ts`
- `apps/api/src/common/middleware/correlation-id.service.ts`
- `apps/api/src/common/pipes/global-validation.pipe.spec.ts`
- `apps/api/src/common/pipes/global-validation.pipe.ts`
- `apps/api/src/config/app-config.service.ts`
- `apps/api/src/config/app-config.ts`
- `apps/api/src/config/environment.schema.spec.ts`
- `apps/api/src/config/environment.schema.ts`
- `apps/api/src/config/environment.types.ts`
- `apps/api/src/health/dto/health-response.dto.ts`
- `apps/api/src/health/dto/liveness-response.dto.ts`
- `apps/api/src/health/dto/readiness-response.dto.ts`
- `apps/api/src/health/health.controller.ts`
- `apps/api/src/health/health.module.ts`
- `apps/api/src/health/health.service.spec.ts`
- `apps/api/src/health/health.service.ts`
- `apps/api/src/openapi/api-error-response.dto.ts`
- `apps/api/src/openapi/openapi.config.ts`
- `apps/api/src/test-env.ts`
- `docs/adr/ADR-014-api-error-contract.md`
- `docs/adr/ADR-015-structured-logging.md`
- `docs/adr/ADR-016-runtime-configuration.md`
- `docs/adr/ADR-017-openapi.md`
- `docs/architecture/api-foundation.md`
- `tools/openapi/validate-openapi.mjs`

## 9. Arquivos alterados

- `.env.example`
- `README.md`
- `apps/api/src/app/app.controller.ts`
- `apps/api/src/app/app.module.ts`
- `apps/api/src/main.ts`
- `docs/README.md`
- `docs/adr/README.md`
- `docs/architecture/module-map.md`
- `docs/execution/README.md`
- `libs/shared/contracts/src/lib/shared-contracts.spec.ts`
- `libs/shared/contracts/src/lib/shared-contracts.ts`
- `package.json`
- `pnpm-lock.yaml`
- `tools/architecture/validate-boundary-fixtures.mjs`
- `tools/docs/validate-docs.mjs`

Arquivos removidos por obsolescencia do scaffold:

- `apps/api/src/app/app.controller.spec.ts`
- `apps/api/src/app/app.service.spec.ts`
- `apps/api/src/app/app.service.ts`
- `apps/api/src/app/health.e2e-spec.ts`

## 10. Estrutura final da API

Responsabilidades separadas em:

- `app/`
- `bootstrap/`
- `config/`
- `health/`
- `common/errors/`
- `common/filters/`
- `common/logging/`
- `common/middleware/`
- `common/pipes/`
- `openapi/`

## 11. Variaveis de ambiente

Atualizadas em `.env.example`:

- `NODE_ENV`
- `API_PORT`
- `API_PREFIX`
- `LOG_LEVEL`
- `CORS_ORIGINS`
- `APP_VERSION`
- `OPENAPI_ENABLED`

`.env.local` nao foi alterado.

## 12. Configuracao de validacao

`@nestjs/config` carrega `.env.local`, `.env` e `.env.example`, com validacao central por Joi. O
bootstrap falha para porta invalida, ambiente invalido, log level invalido, CORS malformado,
booleano invalido e valores obrigatorios ausentes.

## 13. Configuracao de logs

`nestjs-pino` e `pino` configurados. JSON por padrao; `pino-pretty` em `development`.

## 14. Redaction aplicada

Redaction cobre headers e campos sensiveis:

- `authorization`
- `cookie`
- `set-cookie`
- `password`
- `currentPassword`
- `newPassword`
- `token`
- `accessToken`
- `refreshToken`
- `secret`
- `clientSecret`
- `xml`
- `xmlContent`
- `fileContent`

## 15. Correlation ID

`X-Correlation-ID` e lido, validado com limite de 128 caracteres e reaproveitado quando seguro. Na
ausencia ou invalidade, a API gera `crypto.randomUUID()`. O mesmo valor retorna no header e no erro.

## 16. Contrato de erros

Contrato padronizado:

- `statusCode`
- `code`
- `message`
- `timestamp`
- `path`
- `method`
- `correlationId`
- `fieldErrors`

Codigos implementados incluem `VALIDATION_ERROR`, `RESOURCE_NOT_FOUND`, `METHOD_NOT_ALLOWED`,
`INTERNAL_SERVER_ERROR` e `CONFIGURATION_ERROR`.

## 17. Validation pipe

Global `ValidationPipe` com:

- `transform: true`
- `whitelist: true`
- `forbidNonWhitelisted: true`
- conversao implicita desabilitada

## 18. Health checks

Endpoints:

- `GET /api/health`
- `GET /api/health/live`
- `GET /api/health/ready`

Todos retornam `Cache-Control: no-store`. Nenhum verifica PostgreSQL, Redis, MinIO ou Mailpit neste
corte.

## 19. CORS

CORS deriva de `CORS_ORIGINS`. Requisicoes sem `Origin` sao aceitas; origens fora da lista sao
rejeitadas. Nao ha wildcard com credenciais.

## 20. Helmet

Helmet ativo. `X-Powered-By` removido. CSP foi desabilitada somente para nao quebrar Swagger UI
neste corte.

## 21. OpenAPI

Endpoints:

- `GET /api/docs`
- `GET /api/docs-json`

Documento com titulo `TES Engine API`, versao de `APP_VERSION`, tag `Health`, header
`x-correlation-id`, schemas de health e schema `ApiErrorResponseDto`.

## 22. Shutdown gracioso

`enableShutdownHooks(['SIGTERM', 'SIGINT'])` configurado. O script `openapi:validate` sobe a API
compilada e encerra o processo com `SIGTERM` ao final.

## 23. Testes unitarios

Cobertos:

- parser e validacao de ambiente;
- correlation ID;
- transformation de erros de validacao;
- health service;
- contrato compartilhado `HealthResponse`.

## 24. Testes E2E

`apps/api/src/api-foundation.spec.ts` cobre:

- `GET /api/health`;
- `GET /api/health/live`;
- `GET /api/health/ready`;
- `GET /api/docs-json`;
- rota inexistente;
- correlation ID fornecido;
- correlation ID gerado;
- erro de validacao com `fieldErrors`.

## 25. Validacao manual dos endpoints

Executada contra a build compilada em porta temporaria `3405`.

Resultado:

```json
{
  "Health": 200,
  "HealthCacheControl": "no-store",
  "Live": 200,
  "Ready": 200,
  "DocsJson": 200,
  "DocsOpenApi": "3.0.0",
  "Missing": 404,
  "MissingCorrelation": "test-correlation-123",
  "CustomCorrelation": "test-correlation-123",
  "PoweredBy": null
}
```

`pnpm dev:api` tambem foi iniciado em porta temporaria durante a validacao manual; no Windows,
`Start-Process` exigiu `pnpm.cmd`.

## 26. Resultado de `openapi:validate`

Passou: `OpenAPI validated: version, paths and schemas are present.`

## 27. Resultado da formatacao

`pnpm format:check`: passou.

## 28. Resultado da documentacao

`pnpm docs:validate`: passou, com 70 arquivos Markdown verificados.

## 29. Resultado da arquitetura

- `pnpm architecture:validate`: passou.
- `pnpm architecture:boundaries`: passou.

Observacao: `architecture:boundaries` gera fixtures temporarias. Durante a execucao, rodar esse
comando em paralelo com lint/typecheck pode expor fixtures invalidas ao lint. O fluxo integrado
`pnpm quality` executa em ordem segura.

## 30. Resultado do lint

`pnpm lint`: passou.

## 31. Resultado do typecheck

`pnpm typecheck`: passou para os 10 projetos.

## 32. Resultado dos testes

`pnpm test`: passou para os 10 projetos. API: 5 suites e 18 testes.

## 33. Resultado dos builds

`pnpm build`: passou para os 10 projetos.

## 34. Resultado de `pnpm quality`

Passou. O gate executou formatacao, documentacao, arquitetura, cobertura de typecheck, typecheck,
lint, testes, build e `openapi:validate`.

## 35. Estado da infraestrutura

`pnpm infra:status`: passou. PostgreSQL, Redis, MinIO e Mailpit estavam `healthy`.

## 36. Decisoes e desvios

- OpenAPI validado por script local sem ferramenta paga.
- `.env.example` usado como fallback de variaveis nao secretas para evitar quebra por `.env.local`
  antigo.
- DTOs de OpenAPI duplicam intencionalmente os contratos compartilhados para manter decorators fora
  de `libs/shared/contracts`.
- O antigo relatorio bloqueado foi preservado em
  `docs/execution/006-attempt-1-api-foundation-blocked.md`.

## 37. Pendencias

Nenhuma pendencia funcional do Prompt 06.

## 38. Riscos

- `architecture:boundaries` deve continuar sequencial em relacao a lint/typecheck, pois cria
  fixtures temporarias.
- Campos sensiveis futuros devem ser adicionados explicitamente na lista de redaction.

## 39. Saida de `git status --short`

Antes do commit, continha apenas as alteracoes esperadas do Prompt 06. Apos o commit, o worktree
ficou limpo.

## 40. Commit criado

`feat(api): establish api foundation`.

## 41. Confirmacao de ausencia de segredos

Nenhum segredo foi versionado. `.env.local` permaneceu fora do versionamento e nao foi alterado.

## 42. Confirmacao de escopo

Nenhum arquivo fora de `C:\projetos\tes-engine` foi alterado.

## 43. Recomendacao objetiva para o Prompt 07

Prosseguir para o proximo corte apenas com base na fundacao atual da API, sem antecipar ORM,
migrations, autenticacao ou modulos fiscais fora do escopo do prompt seguinte.
