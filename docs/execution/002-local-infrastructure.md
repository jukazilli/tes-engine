# 002 - Local infrastructure

Data: 2026-06-25

## 1. Status

Concluido.

Foi configurada e validada a infraestrutura local de desenvolvimento com containers para PostgreSQL, Redis, MinIO, MinIO init e Mailpit.

## 2. Estado inicial encontrado

Repositorio: `C:\projetos\tes-engine`

`git status --short` inicial:

```text
 D docs/execution/tes-engine-prompt-001-web.png
```

Essa alteracao ja existia antes do Prompt 02 e foi tratada como alteracao alheia ao escopo. Ela nao foi revertida nem incluida no commit deste corte.

## 3. Resultado do checkpoint Git

Ultimos commits no inicio:

```text
60674b8 chore: bootstrap tes engine workspace
f8a54a1 Initial commit
```

O Prompt 01 estava commitado no commit `60674b8 chore: bootstrap tes engine workspace`.

## 4. Versoes de Docker e Compose

Resultado final:

- Docker Client: `29.4.3`
- Docker Server/Engine: `29.4.3`
- Docker Compose: `v5.1.3`
- Contexto Docker: `desktop-linux`

Observacao: no primeiro preflight, `docker info` falhou porque o Docker Engine nao estava ativo. O Docker Desktop foi iniciado localmente e `docker info` passou a responder.

## 5. Imagens e versoes escolhidas

| Servico | Imagem |
| --- | --- |
| PostgreSQL | `postgres:17.10-alpine` |
| Redis | `redis:7.4-alpine` |
| MinIO | `minio/minio:RELEASE.2025-09-07T16-13-09Z` |
| MinIO Client | `minio/mc:RELEASE.2025-08-13T08-35-41Z` |
| Mailpit | `axllent/mailpit:v1.29.1` |

Todas as imagens foram fixadas com tags explicitas; nenhuma imagem usa `latest`.

## 6. Fontes oficiais consultadas

- Docker Hub PostgreSQL: `https://hub.docker.com/_/postgres`
- Docker Hub Redis: `https://hub.docker.com/_/redis`
- MinIO container images: `https://quay.io/repository/minio/minio`
- MinIO Client container images: `https://quay.io/repository/minio/mc`
- Mailpit container image: `https://hub.docker.com/r/axllent/mailpit`

As tags tambem foram verificadas via `docker manifest inspect`.

## 7. Arquivos criados e alterados

Criados:

- `infrastructure/docker-compose.dev.yml`
- `infrastructure/README.md`
- `infrastructure/scripts/infra-up.ps1`
- `infrastructure/scripts/infra-down.ps1`
- `infrastructure/scripts/infra-status.ps1`
- `infrastructure/scripts/infra-logs.ps1`
- `infrastructure/scripts/infra-validate.ps1`
- `infrastructure/minio/init/.gitkeep`
- `docs/architecture/local-infrastructure.md`
- `docs/adr/ADR-004-postgresql-primary-database.md`
- `docs/adr/ADR-005-redis-local-infrastructure.md`
- `docs/adr/ADR-006-object-storage-minio.md`
- `docs/adr/ADR-007-mailpit-development-email.md`
- `docs/execution/002-local-infrastructure.md`

Alterados:

- `.gitignore`
- `.env.example`
- `package.json`
- `apps/worker/src/app/app.service.spec.ts`

Tambem foi criado `.env.local` com credenciais locais geradas. O arquivo esta ignorado pelo Git.

## 8. Portas utilizadas

| Servico | Porta container | Porta localhost |
| --- | --- | --- |
| PostgreSQL | `5432` | `15432` |
| Redis | `6379` | `16379` |
| MinIO API | `9000` | `9000` |
| MinIO Console | `9001` | `9001` |
| Mailpit SMTP | `1025` | `1025` |
| Mailpit Web | `8025` | `8025` |

As portas foram publicadas somente em `127.0.0.1`.

## 9. Conflitos de porta encontrados

Portas ocupadas no host:

- `5432`: processo `postgres.exe`, PID `8280`.
- `6379`: processos relacionados a Docker/WSL, PIDs `41016` e `41388`.

Nenhum processo externo foi encerrado. Foram usadas portas alternativas locais em `.env.local`:

- PostgreSQL: `15432`.
- Redis: `16379`.

`.env.example` preserva os valores padrao documentados (`5432` e `6379`).

## 10. Variaveis adicionadas ao `.env.example`

Foram adicionadas variaveis para:

- PostgreSQL: host, porta, banco, usuario, senha e `DATABASE_URL`.
- Redis: host, porta e `REDIS_URL`.
- S3/MinIO: endpoint, region, access key, secret key, bucket e path style.
- MinIO Console.
- SMTP/Mailpit.

Os valores sao placeholders, sem segredos reais.

## 11. Servicos e health checks

- `postgres`: `pg_isready`.
- `redis`: `redis-cli ping`.
- `minio`: `http://127.0.0.1:9000/minio/health/live`.
- `minio-init`: aguarda MinIO saudavel, cria bucket e encerra com codigo zero.
- `mailpit`: `http://127.0.0.1:8025/api/v1/info`.

Resultado de `docker compose ps -a`:

```text
tes-engine-mailpit      Up (healthy)
tes-engine-minio        Up (healthy)
tes-engine-minio-init   Exited (0)
tes-engine-postgres     Up (healthy)
tes-engine-redis        Up (healthy)
```

## 12. Resultado do PostgreSQL

`pnpm infra:validate`: passou.

Resultado observado:

```text
/var/run/postgresql:5432 - accepting connections
PostgreSQL OK em localhost:15432
```

`SELECT 1` retornou `1`.

## 13. Resultado do Redis

`pnpm infra:validate`: passou.

Resultado observado:

```text
Redis OK em localhost:16379
```

`redis-cli ping` retornou `PONG`.

## 14. Resultado do MinIO

`pnpm infra:validate`: passou.

O endpoint de health respondeu com sucesso.

## 15. Bucket e politica privada

Bucket validado:

```text
tes-engine-dev
```

O bucket existe e `mc anonymous get` nao retornou politica publica `public`, `download` ou `upload`.

## 16. Resultado do Mailpit e teste SMTP

`pnpm infra:validate`: passou.

Resultado observado:

```text
Mailpit OK; SMTP aceitou mensagem e API listou a mensagem
```

O script enviou mensagem via SMTP local e confirmou a mensagem pela API do Mailpit.

## 17. Resultado de `infra:validate`

Passou.

Resultado final:

```text
Infraestrutura local validada com sucesso.
```

## 18. Resultado do lint

`pnpm lint`: passou para os 10 projetos.

## 19. Resultado dos testes

`pnpm test`: passou para os 10 projetos.

Observacao: o teste do worker foi ajustado para controlar `NODE_ENV` localmente, evitando dependencia do ambiente do shell.

## 20. Resultado dos builds

`pnpm build`: passou para os 10 projetos.

## 21. Persistencia apos down/up

Executado:

```powershell
pnpm infra:down
pnpm infra:up
```

Volumes preservados:

```text
tes-engine-local_minio_data
tes-engine-local_postgres_data
tes-engine-local_redis_data
```

Apos subir novamente, `pnpm infra:validate` passou e confirmou que o bucket `tes-engine-dev` continuava disponivel.

## 22. Verificacao de peer dependencies

Executado:

```powershell
pnpm list --depth 0
pnpm why @angular/core
pnpm why @angular/cdk
pnpm why @po-ui/ng-components
```

Resultado: Angular `21.2.17`, Angular CDK `21.2.4` e PO UI `21.21.0` permanecem alinhados. Nao foram observados warnings relevantes de peer dependencies entre Angular, CDK, PO UI e Nx.

## 23. Decisoes e desvios

- Docker Desktop foi iniciado localmente porque o Engine estava parado no inicio.
- PostgreSQL e Redis usam portas alternativas no `.env.local` por conflito local.
- `.env.example` manteve as portas padrao.
- Nenhum processo externo foi encerrado.
- Nenhum servico foi integrado a API, worker ou web.
- Nenhum ORM, migration, BullMQ, upload, parser XML ou envio de e-mail da aplicacao foi implementado.
- O bug do helper PowerShell `Invoke-Compose` foi corrigido renomeando o parametro para evitar conflito com `$Args`.
- A alteracao preexistente `D docs/execution/tes-engine-prompt-001-web.png` foi preservada.

## 24. Pendencias

- Avaliar separadamente a delecao alheia de `docs/execution/tes-engine-prompt-001-web.png`.
- Futuramente, migrar executores deprecated de Nx/Jest/ESLint quando for escopo apropriado.

## 25. Riscos

- As portas alternativas `15432` e `16379` sao locais deste ambiente. Outros desenvolvedores podem usar as portas padrao se estiverem livres.
- Os warnings de plugins Docker locais ausentes (`docker-dev.exe`, `docker-feedback.exe`) permanecem no ambiente, mas nao bloquearam Docker Engine, Compose ou validacoes.
- As credenciais de `.env.local` sao locais e nao devem ser reaproveitadas em ambiente compartilhado ou producao.

## 26. Saida de `git status --short`

Estado antes do commit do Prompt 02:

```text
 M .env.example
 M .gitignore
 M apps/worker/src/app/app.service.spec.ts
 D docs/execution/tes-engine-prompt-001-web.png
 M package.json
?? docs/adr/ADR-004-postgresql-primary-database.md
?? docs/adr/ADR-005-redis-local-infrastructure.md
?? docs/adr/ADR-006-object-storage-minio.md
?? docs/adr/ADR-007-mailpit-development-email.md
?? docs/architecture/local-infrastructure.md
?? docs/execution/002-local-infrastructure.md
?? infrastructure/README.md
?? infrastructure/docker-compose.dev.yml
?? infrastructure/minio/init/.gitkeep
?? infrastructure/scripts/infra-down.ps1
?? infrastructure/scripts/infra-logs.ps1
?? infrastructure/scripts/infra-status.ps1
?? infrastructure/scripts/infra-up.ps1
?? infrastructure/scripts/infra-validate.ps1
```

`.env.local` nao aparece no status e esta ignorado por `.gitignore`.

## 27. Commit do corte

Commit usado para este corte:

```text
chore: add local development infrastructure
```

A delecao alheia de `docs/execution/tes-engine-prompt-001-web.png` nao deve ser incluida.

## 28. Escopo de arquivos

Todos os arquivos criados ou alterados por este corte ficam dentro de `C:\projetos\tes-engine`.

Nenhum arquivo fora de `C:\projetos\tes-engine` foi alterado.

## 29. Recomendacao para o Prompt 03

Liberar o Prompt 03 apenas apos revisar este relatorio e manter a infraestrutura local validada. O proximo corte deve tratar arquitetura modular, tags Nx e limites de dependencia, sem antecipar ORM, entidades ou integracoes de aplicacao.
