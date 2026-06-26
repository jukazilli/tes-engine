import { Injectable } from '@nestjs/common';
import { TaxDomainCode } from '../domain/tax-domain';
import { TaxOwnerCode } from '../domain/tax-owner';
import { TaxStrategyItemInput } from '../domain/tax-strategy';
import { TaxStrategyMode } from '../domain/tax-strategy-mode';

export interface ValidationIssue {
  code: string;
  message: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export interface TaxStrategyValidationResult {
  valid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

@Injectable()
export class TaxStrategyValidationService {
  validate(
    mode: TaxStrategyMode,
    items: TaxStrategyItemInput[],
    activeTaxDomains: TaxDomainCode[],
    options: { requireComplete: boolean },
  ): TaxStrategyValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];
    const seen = new Set<string>();
    const active = new Set(activeTaxDomains);

    for (const item of items) {
      if (seen.has(item.taxDomainCode)) {
        errors.push({
          code: 'TAX_DOMAIN_DUPLICATED',
          message: `Tax domain ${item.taxDomainCode} appears more than once.`,
        });
      }
      seen.add(item.taxDomainCode);

      if (!active.has(item.taxDomainCode)) {
        errors.push({
          code: 'TAX_DOMAIN_NOT_FOUND',
          message: `Tax domain ${item.taxDomainCode} is not active.`,
        });
      }

      if (item.ownerCode === 'NOT_APPLICABLE' && !item.notApplicableReason?.trim()) {
        errors.push({
          code: 'NOT_APPLICABLE_REASON_REQUIRED',
          message: `Tax domain ${item.taxDomainCode} requires a reason when not applicable.`,
        });
      }

      if (item.ownerCode !== 'NOT_APPLICABLE' && item.notApplicableReason?.trim()) {
        errors.push({
          code: 'TAX_OWNER_INVALID',
          message: `Tax domain ${item.taxDomainCode} cannot keep a not-applicable reason.`,
        });
      }
    }

    if (options.requireComplete) {
      for (const domain of activeTaxDomains) {
        if (!seen.has(domain)) {
          errors.push({
            code: 'TAX_STRATEGY_INCOMPLETE',
            message: `Tax domain ${domain} must be explicitly classified before confirmation.`,
          });
        }
      }
    }

    const applicableOwners = items
      .filter((item) => active.has(item.taxDomainCode) && item.ownerCode !== 'NOT_APPLICABLE')
      .map((item) => item.ownerCode);

    if (options.requireComplete && applicableOwners.length === 0) {
      errors.push({
        code: 'TAX_STRATEGY_INCOMPLETE',
        message: 'At least one tax domain must be applicable before confirmation.',
      });
    }

    this.validateMode(mode, applicableOwners, errors);
    return { valid: errors.length === 0, errors, warnings };
  }

  private validateMode(
    mode: TaxStrategyMode,
    applicableOwners: TaxOwnerCode[],
    errors: ValidationIssue[],
  ): void {
    const hasLegacy = applicableOwners.includes('LEGACY_TES');
    const hasConfigtrib = applicableOwners.includes('CONFIGTRIB');

    if (mode === 'LEGACY' && hasConfigtrib) {
      errors.push({
        code: 'TAX_STRATEGY_MODE_MISMATCH',
        message: 'LEGACY strategy cannot assign applicable taxes to ConfigTrib.',
      });
    }

    if (mode === 'FULL_CONFIGTRIB' && hasLegacy) {
      errors.push({
        code: 'TAX_STRATEGY_MODE_MISMATCH',
        message: 'FULL_CONFIGTRIB strategy cannot assign applicable taxes to legacy TES.',
      });
    }

    if (mode === 'HYBRID' && applicableOwners.length > 0 && (!hasLegacy || !hasConfigtrib)) {
      errors.push({
        code: 'TAX_STRATEGY_MODE_MISMATCH',
        message: 'HYBRID strategy requires at least one legacy tax and one ConfigTrib tax.',
      });
    }
  }
}
