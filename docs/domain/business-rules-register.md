# Registro de regras de negocio

Status: ACCEPTED

As regras abaixo sao conceituais e precisam de detalhamento antes de implementacao.

| ID     | Titulo                             | Descricao                                                      | Origem documental | Status   | Modulo futuro     | Criticidade | Criterio de verificacao            |
| ------ | ---------------------------------- | -------------------------------------------------------------- | ----------------- | -------- | ----------------- | ----------- | ---------------------------------- |
| BR-001 | Nao criar TES por item             | TES deve ser consolidada por resultado, nao por linha isolada. | Prompt 05         | ACCEPTED | Scenarios         | Alta        | Cenario agrupa itens equivalentes. |
| BR-002 | Consolidar resultados              | Consolidar pelo resultado operacional e tributario.            | Prompt 05         | ACCEPTED | Processing        | Alta        | Resultado duplicado e agrupado.    |
| BR-003 | Separar cenarios                   | Cenario operacional e tributario sao distintos.                | Prompt 05         | ACCEPTED | Scenarios         | Alta        | Ambos aparecem separados.          |
| BR-004 | Considerar modos Protheus          | Suportar legado, hibrido e Configurador como conceitos.        | Prompt 05         | ACCEPTED | Protheus Matching | Media       | Modo fica explicito.               |
| BR-005 | Reutilizar TES                     | TES existente deve ser avaliada antes de proposta nova.        | Prompt 05         | ACCEPTED | Protheus Matching | Alta        | Similaridade consultada antes.     |
| BR-006 | Nao copiar CFOP/CST cegamente      | Perspectivas operacional e tributaria nao sao intercambiaveis. | Prompt 05         | ACCEPTED | Rules             | Alta        | Regra exige justificativa.         |
| BR-007 | Preservar calculados e overrides   | Valores calculados e alteracoes humanas devem ter rastreio.    | Prompt 05         | ACCEPTED | Audit             | Alta        | Snapshot contem evidencia.         |
| BR-008 | Exportacao critica exige aprovacao | Etapa critica nao exporta sem aprovacao.                       | Prompt 05         | ACCEPTED | Approval          | Alta        | Export bloqueia sem aprovacao.     |
| BR-009 | Exportacoes imutaveis              | Exportacao gerada nao deve ser alterada.                       | Prompt 05         | ACCEPTED | Exports           | Alta        | Nova mudanca gera nova exportacao. |
| BR-010 | Processamentos versionados         | Cada execucao relevante possui versao.                         | Prompt 05         | ACCEPTED | Processing        | Alta        | Historico preservado.              |
| BR-011 | MILE depende de layout             | Arquivo MILE depende de layout definido.                       | Prompt 05         | ACCEPTED | Exports           | Media       | Layout registrado antes.           |
| BR-012 | Homologacao primeiro               | Ambiente de homologacao e primeiro destino.                    | Prompt 05         | ACCEPTED | Exports           | Alta        | Producao nao e destino inicial.    |
| BR-013 | Nao gravar SF4 no MVP              | MVP nao grava diretamente na SF4.                              | Prompt 05         | ACCEPTED | Exports           | Alta        | Exportacao e arquivo/controlada.   |
| BR-014 | TES neutralizada exige cobertura   | Neutralizacao exige cobertura tributaria correspondente.       | Prompt 05         | ACCEPTED | Rules             | Alta        | Regra valida cobertura.            |

Documentos relacionados:

- [Decisoes pendentes](open-domain-decisions.md)
- [Fluxo de dados](../architecture/data-flow-overview.md)
