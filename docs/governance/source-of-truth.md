# Fonte de verdade

Status: ACCEPTED

Este documento define a precedencia entre documentos e codigo quando houver divergencia.

## Precedencia

1. ADR aceito.
2. Contrato tecnico versionado.
3. Documento arquitetural canonico.
4. Documento de produto canonico.
5. Modelo ou especificacao de dominio.
6. Relatorio de execucao.
7. README operacional.
8. Comentarios de codigo.

## Regras

- Relatorio de execucao descreve o que ocorreu, mas nao substitui ADR.
- README ensina a operar, mas nao substitui arquitetura.
- Comentario de codigo nao define regra de negocio.
- Divergencias entre documentos devem ser registradas e resolvidas por ADR ou RFC.
- Uma decisao substituida deve apontar para sua sucessora.
- Documentos historicos nao devem ser apagados apenas por estarem superados.
- Exemplos nao sao regras definitivas.

## Documentos relacionados

- [Processo de decisao](decision-process.md)
- [Padrao de documentacao](documentation-standard.md)
- [Indice de ADRs](../adr/README.md)
