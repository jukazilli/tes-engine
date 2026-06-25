# API foundation

Status: ACCEPTED

Este documento define a fundacao tecnica atual da API NestJS do TES Engine. O corte nao cria ORM,
migrations, tabelas, autenticacao, usuarios, organizacoes, filas, upload, parser XML, regras
fiscais, cenarios ou exportacoes.

## Bootstrap

O bootstrap fica em `apps/api/src/main.ts` e delega a configuracao comum para
`apps/api/src/bootstrap/configure-api-application.ts`.

Fluxo:

1. Criar a aplicacao NestJS com logs bufferizados.
2. Ler a configuracao validada por `@nestjs/config`.
3. Registrar `nestjs-pino` como logger operacional.
4. Aplicar prefixo global, Helmet, CORS, validation pipe, filtro global de erros e OpenAPI.
5. Habilitar shutdown hooks para `SIGTERM` e `SIGINT`.
6. Inicializar a aplicacao, marcar readiness e ouvir a porta configurada.

Logs operacionais devem usar Pino. `console.log` nao deve ser usado para operacao da API.

## Configuracao

A configuracao central fica em `apps/api/src/config/`.

Variaveis obrigatorias:

| Variavel          | Exemplo                                       | Uso                                      |
| ----------------- | --------------------------------------------- | ---------------------------------------- |
| `NODE_ENV`        | `development`                                 | Ambiente de execucao.                    |
| `API_PORT`        | `3000`                                        | Porta HTTP da API.                       |
| `API_PREFIX`      | `api`                                         | Prefixo global das rotas.                |
| `LOG_LEVEL`       | `debug`                                       | Nivel do logger Pino.                    |
| `CORS_ORIGINS`    | `http://localhost:4200,http://localhost:4300` | Origens HTTP permitidas.                 |
| `APP_VERSION`     | `0.1.0`                                       | Versao exposta no health e OpenAPI.      |
| `OPENAPI_ENABLED` | `true`                                        | Habilita `/api/docs` e `/api/docs-json`. |

`NODE_ENV` aceita `development`, `test`, `staging` e `production`.

`LOG_LEVEL` aceita `fatal`, `error`, `warn`, `info`, `debug`, `trace` e `silent`.

A validacao falha no bootstrap quando porta, ambiente, log level, CORS ou variaveis obrigatorias
estao invalidas. Chamadas diretas a `process.env` devem permanecer restritas ao modulo de
configuracao.

## Logs e redaction

Os logs estruturados usam `nestjs-pino` e `pino`. Por padrao o formato e JSON; em `development`,
`pino-pretty` melhora a leitura local.

Cada log de requisicao inclui:

- correlation ID;
- metodo;
- rota;
- status;
- duracao;
- servico;
- ambiente.

Nunca registrar por padrao o body completo de requisicoes.

Campos redigidos:

- `authorization`;
- `cookie`;
- `set-cookie`;
- `password`;
- `currentPassword`;
- `newPassword`;
- `token`;
- `sessionToken`;
- `csrfToken`;
- `accessToken`;
- `refreshToken`;
- `secret`;
- `resendApiKey`;
- `smtpPassword`;
- `clientSecret`;
- `xml`;
- `xmlContent`;
- `fileContent`.

XMLs fiscais, conteudo fiscal, arquivos enviados e credenciais nunca devem aparecer nos logs.

## Correlation ID

Todas as requisicoes passam por `CorrelationIdMiddleware`.

Regra:

1. Ler `X-Correlation-ID`.
2. Reutilizar somente valores com caracteres seguros e ate 128 caracteres.
3. Gerar `crypto.randomUUID()` quando o header esta ausente ou invalido.
4. Retornar o valor em `X-Correlation-ID`.
5. Usar o mesmo valor em logs e respostas de erro.

## Contrato de erros

O filtro global `ApiExceptionFilter` normaliza respostas:

```json
{
  "statusCode": 404,
  "code": "RESOURCE_NOT_FOUND",
  "message": "Resource not found.",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/rota-inexistente",
  "method": "GET",
  "correlationId": "test-correlation-123"
}
```

Erros de DTO usam `fieldErrors`:

```json
{
  "statusCode": 400,
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed.",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "path": "/api/recurso",
  "method": "POST",
  "correlationId": "test-correlation-123",
  "fieldErrors": {
    "name": ["name must be a string"]
  }
}
```

Erros internos nao expoem stack trace, caminho local, variaveis de ambiente ou credenciais ao
cliente.

## Validacao de DTOs

O pipe global usa:

- `transform: true`;
- `whitelist: true`;
- `forbidNonWhitelisted: true`;
- conversao implicita desabilitada.

DTOs HTTP da API podem usar `class-validator` e `class-transformer`. Contratos em
`libs/shared/contracts` devem permanecer sem decorators NestJS.

## Health checks

Rotas atuais:

- `GET /api/health`;
- `GET /api/health/live`;
- `GET /api/health/ready`.

Todos retornam `Cache-Control: no-store`.

`/api/health`:

```json
{
  "status": "ok",
  "service": "tes-engine-api",
  "version": "0.1.0",
  "environment": "development",
  "timestamp": "2026-01-01T00:00:00.000Z",
  "uptimeSeconds": 120
}
```

`/api/health/live` valida apenas que o processo HTTP esta vivo.

`/api/health/ready` valida somente configuracao carregada e aplicacao inicializada. Neste corte nao
testa PostgreSQL, Redis, MinIO nem Mailpit.

## CORS

CORS deriva de `CORS_ORIGINS`, como lista separada por virgula. Requisicoes sem `Origin` sao
permitidas para ferramentas locais e health checks. Origens fora da lista sao rejeitadas.

Nao usar `*` com credenciais. Portas do frontend nao devem ser hardcoded no codigo-fonte.

Em desenvolvimento, `CORS_ORIGINS` pode conter hosts locais. Em producao, deve conter apenas origens
controladas do produto.

## Helmet

Helmet fica ativo com defaults seguros e remove `X-Powered-By`. A CSP esta desabilitada somente para
evitar conflito com Swagger UI neste corte. A API nao define CSP do frontend Angular.

## OpenAPI

Rotas:

- `GET /api/docs`;
- `GET /api/docs-json`.

O documento usa:

- titulo `TES Engine API`;
- versao de `APP_VERSION`;
- tag `Health`;
- header global `x-correlation-id`;
- schemas de health;
- schema `ApiErrorResponseDto`.

`OPENAPI_ENABLED` permite desabilitar a documentacao no futuro, inclusive em producao.

O script `pnpm openapi:validate` compila a API, sobe uma instancia temporaria em porta local,
consulta `/api/docs-json`, valida versao, paths e schemas essenciais, e encerra o processo.

## Shutdown

`enableShutdownHooks(['SIGTERM', 'SIGINT'])` permite encerramento gracioso. Validacoes manuais devem
encerrar o processo iniciado por `pnpm dev:api` ao final.

## Novos endpoints

Ao criar endpoints futuros:

1. Criar DTOs HTTP dentro da API quando dependerem de decorators.
2. Compartilhar somente contratos framework-agnostic em `libs/shared/contracts`.
3. Documentar respostas OpenAPI.
4. Nao registrar body completo nem XML fiscal.
5. Preservar `X-Correlation-ID`.
6. Deixar erros passarem pelo filtro global.
7. Cobrir DTO, erro e comportamento HTTP em testes.

Documentos relacionados:

- [Mapa de modulos](module-map.md)
- [Indice de ADRs](../adr/README.md)
