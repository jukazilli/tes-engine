# Politica de fontes NF-e

Status: ACCEPTED

## Fonte normativa

Schemas, notas tecnicas e documentacao oficial do Portal Nacional NF-e prevalecem para estrutura da
NF-e modelo 55. XSD oficial define grupos, tipos e obrigatoriedade estrutural de XML.

## Limites

XSD nao resolve toda interpretacao fiscal. Regras semanticas podem exigir notas tecnicas, manuais,
legislacao federal, legislacao estadual e validacao por UF.

## XML sintetico

XML sintetico pode ser usado para fixture de teste estrutural, desde que marcado como
`SYNTHETIC_XML` e sem dados fiscais reais. Ele nao pode ser `PRIMARY_NORMATIVE`.
