# Dados de referencia

Status: ACCEPTED

Catalogos controlados expostos pela API usam `ReferenceOption`: codigo estavel, label exibivel,
descrição opcional, ativo e metadata. A UI envia codigo, nunca label.

Endpoints globais:

- `GET /api/reference-data/tax-regimes`;
- `GET /api/reference-data/nfe-crt`;
- `GET /api/reference-data/icms-taxpayer-indicators`;
- `GET /api/reference-data/establishment-types`;
- `GET /api/reference-data/environment-types`;
- `GET /api/reference-data/states`;
- `GET /api/reference-data/countries`.

Esses catalogos nao exigem tenant porque nao carregam dado de cliente. Mapeamentos de parametro
Protheus continuam tenant-scoped.
