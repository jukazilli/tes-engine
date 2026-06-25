# Fronteiras de seguranca

Status: ACCEPTED

## Fronteiras

- Navegador: ambiente nao confiavel.
- API publica: primeira fronteira de validacao no backend.
- Worker: processo nao publico.
- Infraestrutura local: rede Docker de desenvolvimento.
- Object storage: privado por padrao.
- Organizacao: fronteira multi-tenant conceitual.
- Arquivos: entradas nao confiaveis.
- Secrets: fora do repositorio.

## Futuro threat model

Um threat model completo deve detalhar autenticacao, autorizacao, upload, isolamento tenant,
retencao, auditoria, exportacao e integracoes externas.

Documentos relacionados:

- [Contexto](system-context.md)
- [Quality strategy](quality-strategy.md)
