# Documentacao do TES Engine

Status: ACCEPTED

Este diretorio e a fonte canonica de documentacao do TES Engine. Ele orienta decisoes tecnicas,
produto, dominio, governanca, execucao dos prompts e contribuicoes.

## Mapa das pastas

| Pasta           | Conteudo                                                 | Fonte canonica |
| --------------- | -------------------------------------------------------- | -------------- |
| `product/`      | Visao, escopo MVP e jornada de usuario                   | Produto        |
| `architecture/` | Arquitetura, modulos, infraestrutura, qualidade e testes | Arquitetura    |
| `domain/`       | Linguagem ubiqua, regras e decisoes pendentes            | Dominio        |
| `governance/`   | Fonte de verdade, padroes e mudancas                     | Governanca     |
| `adr/`          | Architectural Decision Records aceitos                   | Decisoes       |
| `templates/`    | Modelos para novos documentos                            | Processo       |
| `roadmap/`      | Fases e sequencia de prompts                             | Planejamento   |
| `execution/`    | Relatorios historicos de execucao                        | Evidencia      |

## Ordem recomendada de leitura

1. [Fonte de verdade](governance/source-of-truth.md)
2. [Visao do produto](product/product-vision.md)
3. [Escopo do MVP](product/mvp-scope.md)
4. [Visao geral do sistema](architecture/system-overview.md)
5. [Mapa de modulos](architecture/module-map.md)
6. [Catalogo de modulos](architecture/module-catalog.md)
7. [Linguagem ubiqua](domain/ubiquitous-language.md)
8. [Registro de regras de negocio](domain/business-rules-register.md)
9. [Indice de ADRs](adr/README.md)
10. [Relatorios de execucao](execution/README.md)

## Status atual

Ultima etapa concluida: Prompt 04, quality gates, hooks Git e CI.

Etapa atual: Prompt 05, governanca documental.

Proxima etapa prevista: Prompt 06, a ser definido pela sequencia de prompts sem antecipar ORM,
autenticacao, banco da aplicacao ou funcionalidades fiscais.

## Arquitetura resumida

O TES Engine usa um monorepo Nx com SPA Angular/PO UI, API NestJS, worker NestJS, bibliotecas
compartilhadas, engines independentes de frameworks e infraestrutura local com PostgreSQL, Redis,
MinIO e Mailpit. O produto nao e oficial da TOTVS e deve integrar conceitualmente com Protheus e
MILE sem gravar diretamente na SF4 no MVP.

## Legenda de status

| Status     | Significado                                         |
| ---------- | --------------------------------------------------- |
| DRAFT      | Documento em elaboracao.                            |
| PROPOSED   | Proposta aguardando decisao.                        |
| ACCEPTED   | Documento aceito como fonte vigente.                |
| SUPERSEDED | Substituido por outro documento.                    |
| DEPRECATED | Nao recomendado para novas decisoes.                |
| HISTORICAL | Registro historico, preservado por rastreabilidade. |

## Regras para contribuir

- Use portugues brasileiro.
- Diferencie decisao confirmada de hipotese.
- Nao inclua secrets, dados reais de clientes ou XMLs fiscais reais.
- Use links relativos.
- Registre novas decisoes relevantes como ADR.
- Registre execucoes em `execution/`.
- Rode `pnpm docs:validate` e `pnpm quality` antes do commit.

Documentos relacionados:

- [Padrao de documentacao](governance/documentation-standard.md)
- [Processo de decisao](governance/decision-process.md)
- [CONTRIBUTING](../CONTRIBUTING.md)
