import { Inject, Injectable } from '@nestjs/common';
import { DATABASE_POOL, DatabasePool } from '@tes-engine/backend/database';
import { createHash, timingSafeEqual } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { authenticationRequired, permissionDenied } from '../domain/organization.errors';
import {
  AuthenticatedUserContext,
  OrganizationApiRequest,
} from '../context/organization-request-context';

@Injectable()
export class RequestAuthService {
  constructor(
    @Inject(DATABASE_POOL) private readonly pool: DatabasePool,
    private readonly configService: ConfigService,
  ) {}

  async requireSession(request: OrganizationApiRequest): Promise<AuthenticatedUserContext> {
    if (request.authenticatedUser) {
      return request.authenticatedUser;
    }

    const token = this.sessionToken(request);
    if (!token) {
      throw authenticationRequired();
    }

    const result = await this.pool.query(
      `
      SELECT user_sessions.id AS session_id,
        user_sessions.csrf_token_hash,
        user_sessions.expires_at,
        users.id AS user_id,
        users.email,
        users.display_name,
        users.status
      FROM app.user_sessions
      JOIN app.users ON users.id = user_sessions.user_id
      WHERE user_sessions.token_hash = $1
        AND user_sessions.status = 'ACTIVE'
        AND users.status = 'ACTIVE'
      LIMIT 1
      `,
      [this.digest(token)],
    );

    const session = result.rows[0];
    if (!session || new Date(session.expires_at) <= new Date()) {
      throw authenticationRequired();
    }

    await this.pool.query('UPDATE app.user_sessions SET last_seen_at = now() WHERE id = $1', [
      session.session_id,
    ]);

    const context: AuthenticatedUserContext = {
      sessionId: session.session_id,
      userId: session.user_id,
      email: session.email,
      displayName: session.display_name,
      status: session.status,
      csrfTokenHash: session.csrf_token_hash,
    };
    request.authenticatedUser = context;
    return context;
  }

  async requireMutatingSession(request: OrganizationApiRequest): Promise<AuthenticatedUserContext> {
    this.assertAllowedOrigin(this.header(request, 'origin'));
    const session = await this.requireSession(request);
    const csrf = this.header(request, this.configService.get('CSRF_HEADER_NAME') ?? 'X-CSRF-Token');
    if (!csrf || !this.secureCompare(this.digest(csrf), session.csrfTokenHash)) {
      throw permissionDenied();
    }
    return session;
  }

  digest(value: string): string {
    return createHash('sha256').update(value).digest('hex');
  }

  fingerprint(value: string): string {
    return this.digest(value.trim().toLowerCase());
  }

  header(request: OrganizationApiRequest, name: string): string | undefined {
    const value = request.headers[name] ?? request.headers[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
  }

  private sessionToken(request: OrganizationApiRequest): string | undefined {
    const cookieHeader = this.header(request, 'cookie');
    if (!cookieHeader) {
      return undefined;
    }
    const cookieName = this.configService.get('SESSION_COOKIE_NAME') ?? 'tes_session';
    return cookieHeader
      .split(';')
      .map((cookie) => cookie.trim())
      .find((cookie) => cookie.startsWith(`${cookieName}=`))
      ?.slice(cookieName.length + 1);
  }

  private assertAllowedOrigin(origin?: string): void {
    if (!origin) {
      return;
    }
    const allowedOrigins = ((this.configService.get('CORS_ORIGINS') ?? '') as string)
      .split(',')
      .map((value: string) => value.trim())
      .filter(Boolean);
    if (!allowedOrigins.includes(origin)) {
      throw permissionDenied();
    }
  }

  private secureCompare(left: string, right: string): boolean {
    const leftBuffer = Buffer.from(left);
    const rightBuffer = Buffer.from(right);
    return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
  }
}
