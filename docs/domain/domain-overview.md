# Visao do dominio

Status: ACCEPTED

Este documento registra contextos conceituais previstos. Nao define classes, tabelas ou schemas.

| Contexto              | Responsabilidade      | Entradas               | Saidas                 | Nao pertence         |
| --------------------- | --------------------- | ---------------------- | ---------------------- | -------------------- |
| Identity              | Identidade futura     | Usuarios               | Identidade autenticada | Regra fiscal         |
| Organizations         | Fronteira tenant      | Cadastro               | Organizacao            | Tabela fisica        |
| Companies             | Empresas e filiais    | Dados cadastrais       | Empresa e filial       | Autenticacao         |
| Protheus Environments | Ambientes alvo        | Configuracao           | Ambiente Protheus      | Upload fiscal        |
| Projects              | Recorte de trabalho   | Objetivo e organizacao | Projeto                | Motor de regra       |
| Files                 | Arquivos enviados     | Upload                 | Arquivo preservado     | Interpretacao fiscal |
| Fiscal Documents      | Documento normalizado | Arquivo processado     | Documento conceitual   | UI                   |
| Processing            | Execucoes versionadas | Documentos e regras    | Resultado processado   | Aprovacao            |
| Rules                 | Criterios do motor    | Parametros             | Resultado de regra     | Persistencia fisica  |
| Scenarios             | Agrupamentos          | Processamento          | Cenarios               | Layout MILE          |
| Protheus Matching     | Comparacao TES        | TES existentes         | Similaridade           | Criacao cega         |
| Review                | Analise humana        | Cenarios               | Parecer                | Exportacao imutavel  |
| Approval              | Liberacao critica     | Revisao                | Aprovacao              | Calculo fiscal       |
| Exports               | Artefatos finais      | Aprovacao              | Exportacao             | Revisao              |
| Audit                 | Evidencias            | Eventos                | Trilha                 | Decisao fiscal       |

Documentos relacionados:

- [Linguagem ubiqua](ubiquitous-language.md)
- [Decisoes pendentes](open-domain-decisions.md)
