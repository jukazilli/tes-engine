# Infraestrutura local

Infraestrutura local de desenvolvimento do TES Engine via Docker Compose.

## Pre-requisitos

- Docker Desktop com Engine ativo.
- Docker Compose disponivel via `docker compose`.
- PowerShell no Windows.
- Arquivo `.env.local` na raiz do projeto.

## Servicos

| Servico | Imagem | Porta local |
| --- | --- | --- |
| PostgreSQL | `postgres:17.10-alpine` | `POSTGRES_PORT`, padrao `5432` |
| Redis | `redis:7.4-alpine` | `REDIS_PORT`, padrao `6379` |
| MinIO API | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | `9000` |
| MinIO Console | `minio/minio:RELEASE.2025-09-07T16-13-09Z` | `9001` |
| MinIO Client | `minio/mc:RELEASE.2025-08-13T08-35-41Z` | sem porta |
| Mailpit SMTP | `axllent/mailpit:v1.29.1` | `1025` |
| Mailpit Web | `axllent/mailpit:v1.29.1` | `8025` |

As portas sao publicadas somente em `127.0.0.1`.

## `.env.local`

Crie `.env.local` na raiz do projeto a partir de `.env.example` e substitua as senhas por valores locais.

Exemplo de portas alternativas quando `5432` e `6379` ja estiverem ocupadas:

```text
POSTGRES_PORT=15432
REDIS_PORT=16379
DATABASE_URL=postgresql://tes_engine:<senha>@localhost:15432/tes_engine
REDIS_URL=redis://localhost:16379
```

O arquivo `.env.local` e ignorado pelo Git.

## Subir

```powershell
pnpm infra:up
```

Esse comando verifica Docker, sobe os servicos, mostra o status e executa a validacao final.

## Validar

```powershell
pnpm infra:validate
```

A validacao cobre:

- PostgreSQL `pg_isready` e `SELECT 1`.
- Redis `PING`.
- MinIO health endpoint.
- existencia do bucket `tes-engine-dev`.
- bucket sem politica anonima publica.
- Mailpit API.
- envio SMTP de teste e consulta da mensagem via API.

## Status

```powershell
pnpm infra:status
```

## Logs

Todos os servicos:

```powershell
pnpm infra:logs
```

Servico especifico:

```powershell
powershell -ExecutionPolicy Bypass -File infrastructure/scripts/infra-logs.ps1 postgres
```

## Parar

```powershell
pnpm infra:down
```

O comando para containers e preserva volumes.

## Acessos

- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`
- Mailpit Web: `http://localhost:8025`

## Volumes

- `postgres_data`
- `redis_data`
- `minio_data`

## Remocao manual de volumes

Operacao destrutiva. Execute somente quando quiser apagar todos os dados locais:

```powershell
docker compose --env-file .env.local -f infrastructure/docker-compose.dev.yml down --volumes
```

Nao ha script automatico para remover volumes neste corte.

## Solucao de problemas

- Se `docker info` falhar, inicie o Docker Desktop e aguarde o Engine ficar pronto.
- Se portas estiverem ocupadas, ajuste `.env.local` para portas alternativas.
- Se `minio-init` falhar, veja logs com `pnpm infra:logs minio-init`.
