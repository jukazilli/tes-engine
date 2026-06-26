import { Injectable } from '@nestjs/common';
import { TenantSqlRepository } from '@tes-engine/backend/companies';
import {
  ReferenceOption,
  TAX_OWNER_OPTIONS,
  TAX_STRATEGY_MODE_OPTIONS,
  TAX_STRATEGY_SOURCE_TYPE_OPTIONS,
} from '../domain/reference-data';

interface TaxDomainRow {
  code: string;
  label: string;
  description: string | null;
  active: boolean;
  supports_legacy: boolean;
  supports_configtrib: boolean;
}

@Injectable()
export class TaxDomainsService {
  constructor(private readonly repository: TenantSqlRepository) {}

  modes(): ReferenceOption[] {
    return TAX_STRATEGY_MODE_OPTIONS;
  }

  owners(): ReferenceOption[] {
    return TAX_OWNER_OPTIONS;
  }

  sourceTypes(): ReferenceOption[] {
    return TAX_STRATEGY_SOURCE_TYPE_OPTIONS;
  }

  async domains(): Promise<ReferenceOption[]> {
    const result = await this.repository.query<TaxDomainRow>(
      `
      SELECT code, label, description, active, supports_legacy, supports_configtrib
      FROM app.tax_domains
      ORDER BY display_order ASC
      `,
    );
    return result.rows.map((row) => ({
      code: row.code,
      label: row.label,
      description: row.description ?? undefined,
      active: row.active,
      metadata: {
        supportsLegacy: row.supports_legacy,
        supportsConfigtrib: row.supports_configtrib,
      },
    }));
  }
}
