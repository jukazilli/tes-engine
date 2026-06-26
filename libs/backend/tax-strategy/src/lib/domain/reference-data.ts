export interface ReferenceOption {
  code: string;
  label: string;
  description?: string;
  active: boolean;
  metadata?: Record<string, string | number | boolean | null>;
}

export const TAX_STRATEGY_MODE_OPTIONS: ReferenceOption[] = [
  {
    code: 'LEGACY',
    label: 'Legado TES',
    description: 'Todos os tributos aplicaveis permanecem sob responsabilidade da TES.',
    active: true,
    metadata: { requiresSf4Snapshot: true, executionReadyThisCut: false },
  },
  {
    code: 'HYBRID',
    label: 'Hibrido',
    description: 'Combina tributos sob TES legada e Configurador de Tributos.',
    active: true,
    metadata: {
      requiresSf4Snapshot: true,
      requiresConfigtribCoverage: true,
      executionReadyThisCut: false,
    },
  },
  {
    code: 'FULL_CONFIGTRIB',
    label: 'Configurador de Tributos',
    description: 'Todos os tributos aplicaveis ficam sob responsabilidade do Configurador.',
    active: true,
    metadata: { requiresConfigtribCoverage: true, executionReadyThisCut: false },
  },
];

export const TAX_OWNER_OPTIONS: ReferenceOption[] = [
  {
    code: 'LEGACY_TES',
    label: 'TES legada',
    description: 'O tributo sera tratado pelos campos tributarios da TES.',
    active: true,
  },
  {
    code: 'CONFIGTRIB',
    label: 'Configurador de Tributos',
    description: 'O tributo sera tratado pelo Configurador de Tributos.',
    active: true,
  },
  {
    code: 'NOT_APPLICABLE',
    label: 'Nao aplicavel',
    description: 'Decisao explicita com justificativa, sem significar isencao fiscal.',
    active: true,
  },
];

export const TAX_STRATEGY_SOURCE_TYPE_OPTIONS: ReferenceOption[] = [
  {
    code: 'MANUAL',
    label: 'Manual',
    description: 'Configuracao informada manualmente.',
    active: true,
  },
  {
    code: 'IMPORTED_CONFIGURATION',
    label: 'Configuracao importada',
    description: 'Configuracao originada de artefato importado.',
    active: true,
  },
  {
    code: 'FISCAL_REVIEW',
    label: 'Revisao fiscal',
    description: 'Configuracao definida em revisao fiscal.',
    active: true,
  },
  {
    code: 'SYSTEM_SUGGESTION',
    label: 'Sugestao do sistema',
    description: 'Sugestao nao confirmavel automaticamente.',
    active: true,
  },
];
