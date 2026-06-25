# Decisoes de dominio pendentes

Status: ACCEPTED

| ID      | Questao                    | Motivo                         | Impacto              | Prazo recomendado          | Documento ou prompt decisor   | Status |
| ------- | -------------------------- | ------------------------------ | -------------------- | -------------------------- | ----------------------------- | ------ |
| ODD-001 | ORM                        | Persistencia ainda nao existe. | Arquitetura backend. | Antes de entidades.        | Prompt futuro de persistencia | OPEN   |
| ODD-002 | Formato dos IDs            | Afeta contratos e banco.       | APIs e multi-tenant. | Antes dos contratos reais. | ADR futuro                    | OPEN   |
| ODD-003 | Autenticacao               | Necessaria para SaaS.          | Seguranca.           | Antes de usuarios reais.   | Prompt futuro de auth         | OPEN   |
| ODD-004 | Object storage futuro      | MinIO e local.                 | Deploy e custos.     | Antes de producao.         | ADR futuro                    | OPEN   |
| ODD-005 | Multi-tenant fisico        | Modelo fisico nao definido.    | Isolamento.          | Antes do schema.           | ADR futuro                    | OPEN   |
| ODD-006 | Retencao comercial         | Afeta custo e compliance.      | Storage e auditoria. | Antes de producao.         | RFC futuro                    | OPEN   |
| ODD-007 | DSL de regras              | Motor fiscal nao existe.       | Engines.             | Antes do motor.            | RFC futuro                    | OPEN   |
| ODD-008 | Importacao SX3/SF4         | Fonte Protheus nao definida.   | Matching.            | Antes de matching.         | Prompt futuro                 | OPEN   |
| ODD-009 | Layout MILE inicial        | Exportacao real nao existe.    | Exports.             | Antes de exportacao.       | ADR futuro                    | OPEN   |
| ODD-010 | Similaridade de TES        | Algoritmo nao definido.        | Reutilizacao TES.    | Antes de cenarios.         | RFC futuro                    | OPEN   |
| ODD-011 | Primeira biblioteca fiscal | Escopo fiscal nao definido.    | Motor.               | Antes de regras.           | Prompt futuro                 | OPEN   |
| ODD-012 | Versoes de rulesets        | Governanca do motor futura.    | Auditoria.           | Antes do motor.            | ADR futuro                    | OPEN   |

Documentos relacionados:

- [Registro de regras](business-rules-register.md)
- [Processo de decisao](../governance/decision-process.md)
