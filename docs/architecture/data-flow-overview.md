# Visao de fluxo de dados

Status: ACCEPTED

Fluxo conceitual previsto:

```text
arquivo original
-> validacao
-> normalizacao
-> processamento
-> cenario operacional
-> cenario tributario
-> revisao
-> aprovacao
-> exportacao
```

## Regras de alto nivel

- Arquivo original e imutavel.
- Execucao de processamento e versionada.
- Exportacao e imutavel.
- Cenario operacional e cenario tributario sao separados.
- Mudancas geram nova execucao ou nova versao.
- Modelo fisico ainda nao esta definido.

Documentos relacionados:

- [Dominio](../domain/domain-overview.md)
- [Regras de negocio](../domain/business-rules-register.md)
