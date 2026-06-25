# 005 - Documentation governance

Data: 2026-06-25

## 1. Status

Concluido.

Foi criada a governanca documental do TES Engine, com indice principal, fonte de verdade, catalogos,
visoes arquiteturais, dominio conceitual, templates, roadmap e validacao automatica de Markdown e
links internos.

## 2. Estado inicial

Repositorio limpo no inicio do Prompt 05.

Preflight executado:

```powershell
git status --short
git log --oneline -10
Get-ChildItem docs -Recurse -File
pnpm format:check
pnpm architecture:validate
pnpm architecture:boundaries
pnpm lint
pnpm test
pnpm build
pnpm ci:validate
pnpm quality
pnpm infra:status
```

Resultado: todos os comandos passaram.

## 3. Commit inicial encontrado

```text
d49fba1 chore: add quality gates and ci
```

## 4. Inventario documental inicial

Documentos existentes:

- 11 ADRs em `docs/adr`.
- 7 documentos arquiteturais em `docs/architecture`.
- 4 relatorios de execucao em `docs/execution`.
- 1 HTML de Nx Graph e assets gerados.
- 1 screenshot do Prompt 01.

Sobreposicoes encontradas:

- `module-map.md` e `module-boundaries.md` se complementavam, mas faltava catalogo detalhado.
- Relatorios de execucao registravam decisoes, mas nao substituiam ADRs.
- README raiz orientava operacao, mas nao era portal documental.

Decisoes ainda nao documentadas:

- Hierarquia de fonte de verdade.
- Governanca documental.
- Registro formal de decisoes de dominio pendentes.
- Validacao de links e Markdown.

## 5. Estrutura documental final

Criadas ou consolidadas as pastas:

- `docs/product`
- `docs/domain`
- `docs/governance`
- `docs/templates`
- `docs/roadmap`

`docs/README.md` passou a ser o portal documental principal.

## 6. Arquivos criados

- `docs/README.md`
- `docs/product/product-vision.md`
- `docs/product/mvp-scope.md`
- `docs/product/user-journey-summary.md`
- `docs/architecture/system-overview.md`
- `docs/architecture/system-context.md`
- `docs/architecture/container-view.md`
- `docs/architecture/data-flow-overview.md`
- `docs/architecture/security-boundaries.md`
- `docs/architecture/module-catalog.md`
- `docs/domain/domain-overview.md`
- `docs/domain/ubiquitous-language.md`
- `docs/domain/business-rules-register.md`
- `docs/domain/open-domain-decisions.md`
- `docs/governance/source-of-truth.md`
- `docs/governance/documentation-standard.md`
- `docs/governance/decision-process.md`
- `docs/governance/change-management.md`
- `docs/adr/README.md`
- `docs/adr/ADR-012-documentation-governance.md`
- `docs/templates/adr-template.md`
- `docs/templates/rfc-template.md`
- `docs/templates/execution-report-template.md`
- `docs/templates/feature-specification-template.md`
- `docs/templates/test-plan-template.md`
- `docs/execution/README.md`
- `docs/roadmap/implementation-phases.md`
- `docs/roadmap/prompt-sequence.md`
- `.markdownlint-cli2.jsonc`
- `tools/docs/validate-docs.mjs`
- `docs/execution/005-documentation-governance.md`

## 7. Arquivos movidos

Nenhum arquivo foi movido.

## 8. Arquivos atualizados

- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `.github/workflows/ci.yml`
- `tools/ci/validate-workflows.mjs`
- `lint-staged.config.mjs`

## 9. ADRs encontrados

Foram encontrados ADRs de `ADR-001` a `ADR-011`.

## 10. Lacunas e duplicidades de ADR

Antes deste prompt:

- Lacunas: nenhuma entre 001 e 011.
- Duplicidades: nenhuma.

Apos este prompt:

- Novo ADR: `ADR-012`.
- Lacunas: nenhuma entre 001 e 012.
- Duplicidades: nenhuma.

## 11. Novo ADR criado

`docs/adr/ADR-012-documentation-governance.md`

Decisao: criar governanca documental, fonte de verdade e validacao automatica de documentos.

## 12. Hierarquia das fontes de verdade

Definida em `docs/governance/source-of-truth.md`:

1. ADR aceito.
2. Contrato tecnico versionado.
3. Documento arquitetural canonico.
4. Documento de produto canonico.
5. Modelo ou especificacao de dominio.
6. Relatorio de execucao.
7. README operacional.
8. Comentarios de codigo.

## 13. Documentos canonicos definidos

- Produto: `docs/product/*`
- Arquitetura: `docs/architecture/*`
- Dominio: `docs/domain/*`
- Governanca: `docs/governance/*`
- Decisoes: `docs/adr/*`

## 14. Templates criados

- ADR
- RFC
- Relatorio de execucao
- Especificacao de feature
- Plano de testes

## 15. Dependencias adicionadas

| Pacote              | Versao   |
| ------------------- | -------- |
| `markdownlint-cli2` | `0.22.1` |

## 16. Scripts adicionados

```text
docs:lint
docs:links
docs:validate
quality:docs
```

`quality` e `quality:ci` passaram a incluir validacao documental.

## 17. Configuracao do Markdown lint

Arquivo: `.markdownlint-cli2.jsonc`.

Regras ajustadas:

- comprimento de linha sem limite rigido;
- titulos duplicados permitidos apenas entre secoes irmas;
- HTML inline permitido quando necessario;
- H1 inicial validado pelo validador proprio.

## 18. Validador de links

Arquivo: `tools/docs/validate-docs.mjs`.

Valida:

- arquivos Markdown;
- links relativos;
- ancoras internas;
- links locais absolutos;
- ADRs duplicados;
- documentos sem H1;
- placeholders proibidos;
- blocos Mermaid basicos.

## 19. Resultado de docs:lint

`pnpm docs:lint`: passou.

## 20. Resultado de docs:links

`pnpm docs:links`: passou.

## 21. Resultado de docs:validate

`pnpm docs:validate`: passou.

## 22. Resultado do CI validator

`pnpm ci:validate`: passou e confirmou que o workflow exige `pnpm docs:validate`.

## 23. Resultado de format

`pnpm format:check`: passou.

## 24. Resultado de boundaries

`pnpm architecture:validate`: passou.

`pnpm architecture:boundaries`: passou e removeu fixtures temporarias.

## 25. Resultado do lint

`pnpm lint`: passou para os 10 projetos.

## 26. Resultado dos testes

`pnpm test`: passou para os 10 projetos.

## 27. Resultado dos builds

`pnpm build`: passou para os 10 projetos.

## 28. Resultado de quality

`pnpm quality`: passou.

## 29. Resultado de infraestrutura

`pnpm infra:status`: passou com PostgreSQL, Redis, MinIO e Mailpit saudaveis.

## 30. Decisoes nao tomadas e registradas

Registradas em `docs/domain/open-domain-decisions.md`, incluindo ORM, IDs, autenticacao, object
storage futuro, modelo fisico multi-tenant, DSL de regras, importacao SX3/SF4, layout MILE e versoes
de rulesets.

## 31. Desvios

- Nenhum arquivo foi movido para evitar quebra de historico e links.
- Documentos foram escritos sem definir schema fisico, entidades ou regras fiscais definitivas.

## 32. Riscos

- A documentacao de dominio e conceitual e nao deve ser usada como implementacao fisica.
- Algumas decisoes fiscais permanecem pendentes e exigem revisao humana especializada.
- O validador de Mermaid e estrutural basico, nao renderiza diagramas.

## 33. Pendencias

- Detalhar threat model em prompt futuro.
- Definir ORM, autenticacao, IDs e multi-tenant fisico em prompts especificos.
- Expandir regras fiscais apenas quando houver motor e validacao adequada.

## 34. Saida final de git status --short

Estado esperado antes do commit:

```text
M README.md
M package.json
M pnpm-lock.yaml
M .github/workflows/ci.yml
M tools/ci/validate-workflows.mjs
M lint-staged.config.mjs
?? .markdownlint-cli2.jsonc
?? docs/README.md
?? docs/product/
?? docs/domain/
?? docs/governance/
?? docs/templates/
?? docs/roadmap/
?? docs/adr/README.md
?? docs/adr/ADR-012-documentation-governance.md
?? docs/architecture/system-overview.md
?? docs/architecture/system-context.md
?? docs/architecture/container-view.md
?? docs/architecture/data-flow-overview.md
?? docs/architecture/security-boundaries.md
?? docs/architecture/module-catalog.md
?? docs/execution/README.md
?? docs/execution/005-documentation-governance.md
?? tools/docs/validate-docs.mjs
```

## 35. Commit criado

Commit planejado:

```text
docs: establish documentation governance
```

## 36. Escopo de arquivos

Nenhum arquivo fora de `C:\projetos\tes-engine` foi alterado.

## 37. Recomendacao para o Prompt 06

Usar `docs/README.md` como entrada canonica e decidir o proximo corte sem antecipar ORM,
autenticacao, persistencia fisica ou funcionalidades fiscais fora de escopo.
