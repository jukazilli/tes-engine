# Contexto do sistema

Status: ACCEPTED

Esta visao equivale ao nivel de contexto do C4.

```mermaid
flowchart LR
  consultor[Consultor Protheus]
  fiscal[Analista fiscal]
  admin[Administrador]
  tes[TES Engine]
  protheus[Protheus]
  mile[MILE]
  email[Servico de e-mail]
  storage[Object storage]

  consultor --> tes
  fiscal --> tes
  admin --> tes
  tes --> protheus
  tes --> mile
  tes --> email
  tes --> storage
```

## Limites de confianca

- Navegador do usuario e externo ao backend.
- API publica valida entradas.
- Worker nao e publico.
- Object storage deve ser privado.
- Arquivos enviados sao entradas nao confiaveis.
- Protheus e MILE sao sistemas externos ao TES Engine.

Documentos relacionados:

- [Visao geral](system-overview.md)
- [Fronteiras de seguranca](security-boundaries.md)
