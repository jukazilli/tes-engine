import { ReferenceOption } from './contracts';

export const TAX_REGIME_CODES = [
  'LUCRO_REAL',
  'LUCRO_PRESUMIDO',
  'SIMPLES_NACIONAL',
  'MEI',
  'IMUNE',
  'ISENTA',
  'OUTROS',
  'NAO_INFORMADO',
] as const;
export type TaxRegimeCode = (typeof TAX_REGIME_CODES)[number];

export const NFE_CRT_CODES = ['1', '2', '3', '4', 'NAO_INFORMADO'] as const;
export type NfeCrtCode = (typeof NFE_CRT_CODES)[number];

export const ICMS_TAXPAYER_INDICATORS = [
  'CONTRIBUINTE',
  'CONTRIBUINTE_ISENTO',
  'NAO_CONTRIBUINTE',
  'NAO_INFORMADO',
] as const;
export type IcmsTaxpayerIndicator = (typeof ICMS_TAXPAYER_INDICATORS)[number];

export const ESTABLISHMENT_TYPES = ['MATRIZ', 'FILIAL', 'OUTRO'] as const;
export type EstablishmentType = (typeof ESTABLISHMENT_TYPES)[number];

export const RECORD_STATUSES = ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'] as const;
export type RecordStatus = (typeof RECORD_STATUSES)[number];

export const BRANCH_FISCAL_PROFILE_STATUSES = [
  'DRAFT',
  'PENDING_REVIEW',
  'CONFIRMED',
  'SUPERSEDED',
  'DEACTIVATED',
] as const;
export type BranchFiscalProfileStatus = (typeof BRANCH_FISCAL_PROFILE_STATUSES)[number];

export const FISCAL_SOURCE_TYPES = [
  'MANUAL',
  'PROTHEUS_PARAMETER',
  'IMPORTED_FILE',
  'SYSTEM_INFERENCE',
  'FISCAL_REVIEW',
] as const;
export type FiscalSourceType = (typeof FISCAL_SOURCE_TYPES)[number];

export const ENVIRONMENT_TYPES = ['DEVELOPMENT', 'HOMOLOGATION', 'PRODUCTION', 'OTHER'] as const;

export const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
] as const;

export const TAX_REGIME_OPTIONS: ReferenceOption[] = [
  { code: 'LUCRO_REAL', label: 'Lucro Real', active: true },
  { code: 'LUCRO_PRESUMIDO', label: 'Lucro Presumido', active: true },
  { code: 'SIMPLES_NACIONAL', label: 'Simples Nacional', active: true },
  { code: 'MEI', label: 'Microempreendedor Individual', active: true },
  { code: 'IMUNE', label: 'Imune', active: true },
  { code: 'ISENTA', label: 'Isenta', active: true },
  { code: 'OUTROS', label: 'Outros', active: true },
  { code: 'NAO_INFORMADO', label: 'Nao informado', active: true },
];

export const NFE_CRT_OPTIONS: ReferenceOption[] = [
  { code: '1', label: 'Simples Nacional', active: true },
  { code: '2', label: 'Simples Nacional - excesso de sublimite', active: true },
  { code: '3', label: 'Regime Normal', active: true },
  { code: '4', label: 'Simples Nacional - MEI', active: true },
  { code: 'NAO_INFORMADO', label: 'Nao informado', active: true },
];

export const ICMS_TAXPAYER_OPTIONS: ReferenceOption[] = [
  { code: 'CONTRIBUINTE', label: 'Contribuinte do ICMS', active: true, metadata: { indIEDest: 1 } },
  {
    code: 'CONTRIBUINTE_ISENTO',
    label: 'Contribuinte isento de inscricao estadual',
    active: true,
    metadata: { indIEDest: 2 },
  },
  {
    code: 'NAO_CONTRIBUINTE',
    label: 'Nao contribuinte',
    active: true,
    metadata: { indIEDest: 9 },
  },
  { code: 'NAO_INFORMADO', label: 'Nao informado', active: true },
];

export const ESTABLISHMENT_TYPE_OPTIONS: ReferenceOption[] = [
  { code: 'MATRIZ', label: 'Matriz', active: true },
  { code: 'FILIAL', label: 'Filial', active: true },
  { code: 'OUTRO', label: 'Outro', active: true },
];

export const ENVIRONMENT_TYPE_OPTIONS: ReferenceOption[] = [
  { code: 'DEVELOPMENT', label: 'Desenvolvimento', active: true },
  { code: 'HOMOLOGATION', label: 'Homologacao', active: true },
  { code: 'PRODUCTION', label: 'Producao', active: true },
  { code: 'OTHER', label: 'Outro', active: true },
];

export const STATE_OPTIONS: ReferenceOption[] = BRAZILIAN_STATES.map((state) => ({
  code: state,
  label: state,
  active: true,
}));

export const COUNTRY_OPTIONS: ReferenceOption[] = [{ code: 'BR', label: 'Brasil', active: true }];
