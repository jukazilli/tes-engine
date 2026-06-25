# Fases de implementacao

Status: ACCEPTED

| Fase                               | Objetivo               | Dependencias     | Entregaveis                 | Status      |
| ---------------------------------- | ---------------------- | ---------------- | --------------------------- | ----------- |
| Fundacao tecnica                   | Monorepo, apps e libs  | Nenhuma          | Nx, Angular, NestJS         | Concluida   |
| Fundacao SaaS                      | Base operacional SaaS  | Fundacao tecnica | Auth, tenants, persistencia | Planejada   |
| Interface e projetos               | UX de projetos         | Fundacao SaaS    | Telas e fluxos              | Planejada   |
| Documentos e processamento         | Upload e processamento | Projetos         | Parser e runs               | Planejada   |
| Motor de TES                       | Regras e cenarios      | Processamento    | Engines e rulesets          | Planejada   |
| Integracao conceitual com Protheus | Dados Protheus         | Motor            | Matching                    | Planejada   |
| Revisao e aprovacao                | Governanca humana      | Cenarios         | Workflow de aprovacao       | Planejada   |
| Exportacoes                        | Artefatos MILE         | Aprovacao        | Export imutavel             | Planejada   |
| Qualidade e entrega                | Hardening              | Todas            | CI, testes e seguranca      | Em evolucao |

Documentos relacionados:

- [Sequencia de prompts](prompt-sequence.md)
- [Escopo MVP](../product/mvp-scope.md)
