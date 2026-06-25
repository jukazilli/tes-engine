# Padrao de documentacao

Status: ACCEPTED

## Regras de escrita

- Escrever em portugues brasileiro.
- Usar termos em ingles apenas quando forem nomes estabelecidos.
- Iniciar cada documento com H1 claro.
- Informar status quando o documento for normativo.
- Listar documentos relacionados quando aplicavel.
- Apontar para a fonte canonica em vez de duplicar decisoes.
- Diferenciar MVP de evolucao futura.
- Diferenciar decisao confirmada de hipotese.
- Evitar links absolutos locais.
- Nao incluir secrets, credenciais, dados reais de clientes ou XMLs fiscais reais.

## Status documentais

- DRAFT
- PROPOSED
- ACCEPTED
- SUPERSEDED
- DEPRECATED
- HISTORICAL

## Mermaid

Diagramas Mermaid sao permitidos quando houver explicacao textual adjacente. Nao coloque informacao
critica apenas no diagrama.

## Validacao

Use:

```powershell
pnpm docs:validate
```

Documentos relacionados:

- [Fonte de verdade](source-of-truth.md)
- [Templates](../templates/execution-report-template.md)
