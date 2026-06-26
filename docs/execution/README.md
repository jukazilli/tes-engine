# Relatorios de execucao

Status: ACCEPTED

## Regras

- Nomear como `NNN-descricao.md`.
- Manter um relatorio por prompt.
- Relatorios nao substituem ADRs.
- Nao apagar relatorios historicos.
- Registrar status concluido, parcial ou bloqueado.
- Registrar falhas sem ocultar validacoes.
- Incluir `git status --short`.
- Confirmar escopo de arquivos.
- Nao incluir secrets, clientes reais ou XMLs fiscais reais.

## Indice

| Prompt | Relatorio                                                                      | Status    |
| ------ | ------------------------------------------------------------------------------ | --------- |
| 001    | [Workspace bootstrap](001-workspace-bootstrap.md)                              | Concluido |
| 002    | [Local infrastructure](002-local-infrastructure.md)                            | Concluido |
| 003    | [Module boundaries](003-module-boundaries.md)                                  | Concluido |
| 004    | [Quality gates and CI](004-quality-gates-and-ci.md)                            | Concluido |
| 005    | [Documentation governance](005-documentation-governance.md)                    | Concluido |
| 005a   | [Typecheck quality gate](005a-typecheck-quality-gate.md)                       | Concluido |
| 006    | [API foundation, tentativa 1](006-attempt-1-api-foundation-blocked.md)         | Bloqueado |
| 006    | [API foundation](006-api-foundation.md)                                        | Concluido |
| 007    | [Database foundation](007-database-foundation.md)                              | Concluido |
| 008    | [Authentication, tentativa 1](008-attempt-1-authentication-partial.md)         | Parcial   |
| 008.1  | [Authentication](008-authentication.md)                                        | Concluido |
| 009    | [Organizations and RBAC](009-organizations-rbac.md)                            | Concluido |
| 010    | [Companies, branches and environments](010-companies-branches-environments.md) | Concluido |
| 010a   | [Branch fiscal field contracts](010a-branch-fiscal-field-contracts.md)         | Concluido |
| 011    | [Environment tax strategy](011-environment-tax-strategy.md)                    | Concluido |
| 011.5a | [Research source governance](011.5a-research-source-governance.md)             | Concluido |

Artefatos relacionados:

- [Nx Graph](003-nx-graph.html)
- `tes-engine-prompt-001-web.png`
