import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantSqlRepository } from '@tes-engine/backend/companies';
import { OrganizationRequestContext } from '@tes-engine/backend/organizations';
import { PinoLogger } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

export interface ParameterMappingView {
  id: string;
  environmentId: string;
  parameterName: string;
  parameterValue: string;
  normalizedValue: string | null;
  canonicalDomain: string;
  canonicalCode: string | null;
  version: number;
}

interface MappingRow {
  id: string;
  environment_id: string;
  parameter_name: string;
  parameter_value: string;
  normalized_value: string | null;
  canonical_domain: string;
  canonical_code: string | null;
  version: number;
}

@Injectable()
export class ParameterMappingsService {
  constructor(
    private readonly repository: TenantSqlRepository,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(ParameterMappingsService.name);
  }

  async list(
    context: OrganizationRequestContext,
    environmentId: string,
  ): Promise<ParameterMappingView[]> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) =>
        await client.query<MappingRow>(
          `
          SELECT id, environment_id, parameter_name, parameter_value, normalized_value,
            canonical_domain, canonical_code, version
          FROM app.protheus_parameter_mappings
          WHERE organization_id = $1 AND environment_id = $2 AND deleted_at IS NULL
          ORDER BY captured_at DESC, created_at DESC
          `,
          [context.organizationId, environmentId],
        ),
    );
    return result.rows.map((row) => this.toView(row));
  }

  async create(
    context: OrganizationRequestContext,
    input: {
      environmentId: string;
      parameterName: string;
      parameterValue: string;
      normalizedValue?: string | null;
      canonicalDomain: string;
      canonicalCode?: string | null;
      sourceType: string;
    },
  ): Promise<ParameterMappingView> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const environment = await client.query(
          'SELECT 1 FROM app.protheus_environments WHERE organization_id = $1 AND id = $2 AND deleted_at IS NULL',
          [context.organizationId, input.environmentId],
        );
        if (environment.rowCount !== 1) {
          throw new NotFoundException('ENVIRONMENT_NOT_FOUND');
        }
        const inserted = await client.query<MappingRow>(
          `
          INSERT INTO app.protheus_parameter_mappings (
            id, organization_id, environment_id, parameter_name, parameter_value,
            normalized_value, canonical_domain, canonical_code, source_type, captured_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
          RETURNING id, environment_id, parameter_name, parameter_value, normalized_value,
            canonical_domain, canonical_code, version
          `,
          [
            randomUUID(),
            context.organizationId,
            input.environmentId,
            input.parameterName.trim().toUpperCase(),
            input.parameterValue,
            input.normalizedValue ?? null,
            input.canonicalDomain,
            input.canonicalCode ?? null,
            input.sourceType,
          ],
        );
        return inserted.rows[0];
      },
    );
    this.logger.info(
      { organizationId: context.organizationId, mappingId: result.id },
      'protheus_parameter_mapping.created',
    );
    return this.toView(result);
  }

  async validate(
    context: OrganizationRequestContext,
    mappingId: string,
    input: { canonicalCode?: string | null; version: number },
  ): Promise<ParameterMappingView> {
    const result = await this.repository.withTenantTransaction(
      { organizationId: context.organizationId, userId: context.user.userId },
      async (client) => {
        const updated = await client.query<MappingRow>(
          `
          UPDATE app.protheus_parameter_mappings
          SET canonical_code = COALESCE($3, canonical_code),
            validated_at = now(),
            validated_by_user_id = $4,
            updated_at = now(),
            version = version + 1
          WHERE organization_id = $1 AND id = $2 AND version = $5 AND deleted_at IS NULL
          RETURNING id, environment_id, parameter_name, parameter_value, normalized_value,
            canonical_domain, canonical_code, version
          `,
          [
            context.organizationId,
            mappingId,
            input.canonicalCode ?? null,
            context.user.userId,
            input.version,
          ],
        );
        if (updated.rowCount !== 1) {
          throw new NotFoundException('PROTHEUS_PARAMETER_MAPPING_NOT_FOUND');
        }
        return updated.rows[0];
      },
    );
    return this.toView(result);
  }

  private toView(row: MappingRow): ParameterMappingView {
    return {
      id: row.id,
      environmentId: row.environment_id,
      parameterName: row.parameter_name,
      parameterValue: row.parameter_value,
      normalizedValue: row.normalized_value,
      canonicalDomain: row.canonical_domain,
      canonicalCode: row.canonical_code,
      version: row.version,
    };
  }
}
