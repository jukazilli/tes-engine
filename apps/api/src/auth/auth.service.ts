import {
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { DATABASE, TesDatabase } from '@tes-engine/backend/database';
import {
  emailDeliveryEvents,
  emailVerificationTokens,
  loginAttempts,
  passwordResetTokens,
  userCredentials,
  userSessions,
  users,
} from '@tes-engine/backend/database';
import {
  AuthCsrfResponse,
  AuthGenericMessageResponse,
  AuthLoginRequest,
  AuthLoginResponse,
  AuthMeResponse,
  AuthRegisterRequest,
  AuthRegisterResponse,
  AuthResetPasswordRequest,
  AuthSessionResponse,
  AuthVerifyEmailRequest,
  AuthVerifyEmailResponse,
} from '@tes-engine/shared/contracts';
import { and, desc, eq, gt, isNull, ne, sql } from 'drizzle-orm';
import { AppConfigService } from '../config/app-config.service';
import { AuthEmailService } from './auth-email.service';
import { AuthRateLimitService } from './rate-limit.service';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';

const RESEND_VERIFICATION_MESSAGE = 'Se houver uma conta pendente, enviaremos uma nova mensagem.';
const FORGOT_PASSWORD_MESSAGE =
  'Se houver uma conta, enviaremos instrucoes para redefinir a senha.';

interface RequestMetadata {
  ip?: string;
  userAgent?: string;
  origin?: string;
}

interface AuthSessionContext {
  sessionId: string;
  sessionTokenHash: string;
  csrfTokenHash: string;
  user: AuthMeResponse;
  expiresAt: Date;
}

export interface LoginResult {
  response: AuthLoginResponse;
  sessionToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly database: TesDatabase,
    private readonly appConfigService: AppConfigService,
    private readonly authEmailService: AuthEmailService,
    private readonly rateLimitService: AuthRateLimitService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(
    input: AuthRegisterRequest,
    metadata: RequestMetadata,
  ): Promise<AuthRegisterResponse> {
    const email = this.normalizeEmail(input.email);
    this.consumeEmailLimit('register', email, metadata.ip);
    const passwordHash = await this.passwordService.hash(input.password);
    const verificationToken = this.tokenService.createOpaqueToken();
    const tokenHash = this.tokenService.digestToken(verificationToken);
    const expiresAt = this.fromNow(this.appConfigService.value.auth.emailVerificationTtlSeconds);

    const result = await this.translateUniqueViolation(async () =>
      this.database.transaction(async (tx): Promise<AuthRegisterResponse> => {
        const [user] = await tx
          .insert(users)
          .values({
            email,
            displayName: input.displayName.trim(),
            status: 'PENDING_VERIFICATION',
          })
          .returning({ id: users.id });

        await tx.insert(userCredentials).values({ userId: user.id, passwordHash });
        await tx.insert(emailVerificationTokens).values({
          userId: user.id,
          tokenDigest: tokenHash,
          expiresAt,
        });

        return { userId: user.id, emailVerificationRequired: true };
      }),
    );

    await this.sendAndRecordEmail({
      userId: result.userId,
      recipient: email,
      type: 'email_verification',
      send: () =>
        this.authEmailService.sendVerificationEmail({ to: email, token: verificationToken }),
    });

    return result;
  }

  async resendVerification(
    emailInput: string,
    metadata: RequestMetadata,
  ): Promise<AuthGenericMessageResponse> {
    const email = this.normalizeEmail(emailInput);
    this.consumeEmailLimit('resend-verification', email, metadata.ip);
    const [user] = await this.findUserByEmail(email);

    if (!user || user.status !== 'PENDING_VERIFICATION') {
      return { message: RESEND_VERIFICATION_MESSAGE };
    }

    const verificationToken = this.tokenService.createOpaqueToken();
    await this.database.transaction(async (tx) => {
      await tx
        .update(emailVerificationTokens)
        .set({ consumedAt: new Date() })
        .where(
          and(
            eq(emailVerificationTokens.userId, user.id),
            isNull(emailVerificationTokens.consumedAt),
          ),
        );
      await tx.insert(emailVerificationTokens).values({
        userId: user.id,
        tokenDigest: this.tokenService.digestToken(verificationToken),
        expiresAt: this.fromNow(this.appConfigService.value.auth.emailVerificationTtlSeconds),
      });
    });

    await this.sendAndRecordEmail({
      userId: user.id,
      recipient: email,
      type: 'email_verification',
      send: () =>
        this.authEmailService.sendVerificationEmail({ to: email, token: verificationToken }),
    });

    return { message: RESEND_VERIFICATION_MESSAGE };
  }

  async verifyEmail(
    input: AuthVerifyEmailRequest,
    metadata: RequestMetadata,
  ): Promise<AuthVerifyEmailResponse> {
    this.consumeEmailLimit('verify-email', input.token.slice(0, 16), metadata.ip);
    const tokenHash = this.tokenService.digestToken(input.token);
    const [token] = await this.database
      .select({ id: emailVerificationTokens.id, userId: emailVerificationTokens.userId })
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.tokenDigest, tokenHash),
          isNull(emailVerificationTokens.consumedAt),
          gt(emailVerificationTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!token) {
      throw new UnprocessableEntityException('Invalid or expired verification token.');
    }

    await this.database.transaction(async (tx) => {
      await tx
        .update(emailVerificationTokens)
        .set({ consumedAt: new Date() })
        .where(eq(emailVerificationTokens.id, token.id));
      await tx.update(users).set({ status: 'ACTIVE' }).where(eq(users.id, token.userId));
    });

    return { verified: true };
  }

  async login(input: AuthLoginRequest, metadata: RequestMetadata): Promise<LoginResult> {
    const email = this.normalizeEmail(input.email);
    this.consumeLoginLimit(email, metadata.ip);
    const [user] = await this.findUserWithCredential(email);
    const emailFingerprint = this.fingerprint(email);
    const ipFingerprint = metadata.ip ? this.fingerprint(metadata.ip) : null;

    if (!user || !(await this.passwordService.verify(input.password, user.passwordHash))) {
      await this.recordLoginAttempt({
        userId: user?.id,
        emailFingerprint,
        ipFingerprint,
        successful: false,
        failureReason: 'invalid_credentials',
      });
      throw new UnauthorizedException('Invalid credentials.');
    }

    if (user.status !== 'ACTIVE') {
      await this.recordLoginAttempt({
        userId: user.id,
        emailFingerprint,
        ipFingerprint,
        successful: false,
        failureReason: 'inactive_user',
      });
      throw new UnauthorizedException('Invalid credentials.');
    }

    const sessionToken = this.tokenService.createOpaqueToken();
    const csrfToken = this.tokenService.createOpaqueToken();
    const expiresAt = this.fromNow(this.appConfigService.value.auth.sessionTtlSeconds);
    await this.database.insert(userSessions).values({
      userId: user.id,
      tokenHash: this.tokenService.digestToken(sessionToken),
      csrfTokenHash: this.tokenService.digestToken(csrfToken),
      expiresAt,
      ipHash: ipFingerprint,
      userAgent: metadata.userAgent?.slice(0, 512),
    });
    await this.recordLoginAttempt({
      userId: user.id,
      emailFingerprint,
      ipFingerprint,
      successful: true,
    });

    return {
      sessionToken,
      response: {
        user: {
          id: user.id,
          email: user.email,
          displayName: user.displayName,
          status: user.status,
        },
      },
    };
  }

  async currentUser(sessionToken: string | undefined): Promise<AuthMeResponse> {
    const session = await this.requireSession(sessionToken);
    return session.user;
  }

  async csrf(sessionToken: string | undefined): Promise<AuthCsrfResponse> {
    await this.requireSession(sessionToken);
    const csrfToken = this.tokenService.createOpaqueToken();
    await this.database
      .update(userSessions)
      .set({ csrfTokenHash: this.tokenService.digestToken(csrfToken), lastSeenAt: new Date() })
      .where(eq(userSessions.tokenHash, this.tokenService.digestToken(sessionToken ?? '')));
    return { csrfToken };
  }

  async logout(
    sessionToken: string | undefined,
    csrfToken: string | undefined,
    metadata: RequestMetadata,
  ): Promise<void> {
    const session = await this.requireMutatingSession(sessionToken, csrfToken, metadata);
    await this.revokeSessionById(session.sessionId, 'LOGOUT');
  }

  async logoutAll(
    sessionToken: string | undefined,
    csrfToken: string | undefined,
    metadata: RequestMetadata,
  ): Promise<void> {
    const session = await this.requireMutatingSession(sessionToken, csrfToken, metadata);
    await this.database
      .update(userSessions)
      .set({ status: 'REVOKED', revokedAt: new Date(), revokedReason: 'LOGOUT_ALL' })
      .where(and(eq(userSessions.userId, session.user.id), eq(userSessions.status, 'ACTIVE')));
  }

  async listSessions(sessionToken: string | undefined): Promise<AuthSessionResponse[]> {
    const session = await this.requireSession(sessionToken);
    const rows = await this.database
      .select({
        id: userSessions.id,
        createdAt: userSessions.createdAt,
        lastSeenAt: userSessions.lastSeenAt,
        expiresAt: userSessions.expiresAt,
        status: userSessions.status,
        userAgent: userSessions.userAgent,
      })
      .from(userSessions)
      .where(eq(userSessions.userId, session.user.id))
      .orderBy(desc(userSessions.createdAt));

    return rows.map((row) => ({
      id: row.id,
      createdAt: row.createdAt.toISOString(),
      lastSeenAt: row.lastSeenAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      current: row.id === session.sessionId,
      status: row.status,
      userAgent: row.userAgent ?? undefined,
    }));
  }

  async revokeOwnSession(
    sessionToken: string | undefined,
    csrfToken: string | undefined,
    sessionId: string,
    metadata: RequestMetadata,
  ): Promise<boolean> {
    const session = await this.requireMutatingSession(sessionToken, csrfToken, metadata);
    const result = await this.database
      .update(userSessions)
      .set({ status: 'REVOKED', revokedAt: new Date(), revokedReason: 'USER_REVOKED' })
      .where(
        and(
          eq(userSessions.id, sessionId),
          eq(userSessions.userId, session.user.id),
          eq(userSessions.status, 'ACTIVE'),
        ),
      )
      .returning({ id: userSessions.id });

    if (result.length === 0) {
      throw new ForbiddenException('Session cannot be revoked.');
    }

    return session.sessionId === sessionId;
  }

  async forgotPassword(
    emailInput: string,
    metadata: RequestMetadata,
  ): Promise<AuthGenericMessageResponse> {
    const email = this.normalizeEmail(emailInput);
    this.consumeEmailLimit('forgot-password', email, metadata.ip);
    const [user] = await this.findUserByEmail(email);
    if (!user || user.status !== 'ACTIVE') {
      return { message: FORGOT_PASSWORD_MESSAGE };
    }

    const resetToken = this.tokenService.createOpaqueToken();
    await this.database.transaction(async (tx) => {
      await tx
        .update(passwordResetTokens)
        .set({ consumedAt: new Date() })
        .where(
          and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.consumedAt)),
        );
      await tx.insert(passwordResetTokens).values({
        userId: user.id,
        tokenHash: this.tokenService.digestToken(resetToken),
        expiresAt: this.fromNow(this.appConfigService.value.auth.passwordResetTtlSeconds),
        requestedIpHash: metadata.ip ? this.fingerprint(metadata.ip) : null,
      });
    });

    await this.sendAndRecordEmail({
      userId: user.id,
      recipient: email,
      type: 'password_reset',
      send: () => this.authEmailService.sendPasswordResetEmail({ to: email, token: resetToken }),
    });

    return { message: FORGOT_PASSWORD_MESSAGE };
  }

  async resetPassword(
    input: AuthResetPasswordRequest,
    metadata: RequestMetadata,
  ): Promise<AuthGenericMessageResponse> {
    this.consumeEmailLimit('reset-password', input.token.slice(0, 16), metadata.ip);
    const newPasswordHash = await this.passwordService.hash(input.newPassword);
    const tokenHash = this.tokenService.digestToken(input.token);
    const [token] = await this.database
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        email: users.email,
      })
      .from(passwordResetTokens)
      .innerJoin(users, eq(users.id, passwordResetTokens.userId))
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.consumedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (!token) {
      throw new UnprocessableEntityException('Invalid or expired password reset token.');
    }

    await this.database.transaction(async (tx) => {
      await tx
        .update(userCredentials)
        .set({
          passwordHash: newPasswordHash,
          passwordChangedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userCredentials.userId, token.userId));
      await tx
        .update(passwordResetTokens)
        .set({ consumedAt: new Date() })
        .where(eq(passwordResetTokens.id, token.id));
      await tx
        .update(passwordResetTokens)
        .set({ consumedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokens.userId, token.userId),
            ne(passwordResetTokens.id, token.id),
            isNull(passwordResetTokens.consumedAt),
          ),
        );
      await tx
        .update(userSessions)
        .set({ status: 'REVOKED', revokedAt: new Date(), revokedReason: 'PASSWORD_RESET' })
        .where(and(eq(userSessions.userId, token.userId), eq(userSessions.status, 'ACTIVE')));
    });

    await this.sendAndRecordEmail({
      userId: token.userId,
      recipient: token.email,
      type: 'password_changed',
      send: () => this.authEmailService.sendPasswordChangedEmail({ to: token.email }),
    });

    return { message: 'Senha redefinida com sucesso.' };
  }

  private async requireMutatingSession(
    sessionToken: string | undefined,
    csrfToken: string | undefined,
    metadata: RequestMetadata,
  ): Promise<AuthSessionContext> {
    this.assertAllowedOrigin(metadata.origin);
    const session = await this.requireSession(sessionToken);
    if (
      !csrfToken ||
      !this.tokenService.secureCompareDigest(
        this.tokenService.digestToken(csrfToken),
        session.csrfTokenHash,
      )
    ) {
      throw new ForbiddenException('Invalid CSRF token.');
    }
    return session;
  }

  private async requireSession(sessionToken: string | undefined): Promise<AuthSessionContext> {
    if (!sessionToken) {
      throw new UnauthorizedException('Authentication required.');
    }

    const tokenHash = this.tokenService.digestToken(sessionToken);
    const [session] = await this.database
      .select({
        id: userSessions.id,
        tokenHash: userSessions.tokenHash,
        csrfTokenHash: userSessions.csrfTokenHash,
        expiresAt: userSessions.expiresAt,
        userId: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
      })
      .from(userSessions)
      .innerJoin(users, eq(users.id, userSessions.userId))
      .where(and(eq(userSessions.tokenHash, tokenHash), eq(userSessions.status, 'ACTIVE')))
      .limit(1);

    if (!session || session.expiresAt <= new Date() || session.status !== 'ACTIVE') {
      if (session) {
        await this.revokeSessionById(session.id, 'EXPIRED');
      }
      throw new UnauthorizedException('Authentication required.');
    }

    await this.database
      .update(userSessions)
      .set({ lastSeenAt: new Date() })
      .where(eq(userSessions.id, session.id));
    return {
      sessionId: session.id,
      sessionTokenHash: session.tokenHash,
      csrfTokenHash: session.csrfTokenHash,
      expiresAt: session.expiresAt,
      user: {
        id: session.userId,
        email: session.email,
        displayName: session.displayName,
        status: session.status,
      },
    };
  }

  private async revokeSessionById(sessionId: string, reason: string): Promise<void> {
    await this.database
      .update(userSessions)
      .set({
        status: reason === 'EXPIRED' ? 'EXPIRED' : 'REVOKED',
        revokedAt: new Date(),
        revokedReason: reason,
      })
      .where(eq(userSessions.id, sessionId));
  }

  private async sendAndRecordEmail(input: {
    userId: string;
    recipient: string;
    type: 'email_verification' | 'password_reset' | 'password_changed';
    send: () => Promise<{ provider: 'smtp' | 'resend' | 'fake'; providerMessageId?: string }>;
  }): Promise<void> {
    const recipientFingerprint = this.fingerprint(input.recipient);
    try {
      const result = await input.send();
      await this.database.insert(emailDeliveryEvents).values({
        userId: input.userId,
        messageType: input.type,
        provider: result.provider,
        providerMessageId: result.providerMessageId,
        recipientFingerprint,
        status: 'SENT',
      });
    } catch (error) {
      await this.database.insert(emailDeliveryEvents).values({
        userId: input.userId,
        messageType: input.type,
        provider: this.appConfigService.value.email.provider,
        recipientFingerprint,
        status: 'FAILED',
        errorCode: (error as Error).name,
      });
      throw error;
    }
  }

  private async findUserByEmail(email: string) {
    return await this.database
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
      })
      .from(users)
      .where(and(eq(sql`lower(${users.email})`, email), isNull(users.deletedAt)))
      .limit(1);
  }

  private async findUserWithCredential(email: string) {
    return await this.database
      .select({
        id: users.id,
        email: users.email,
        displayName: users.displayName,
        status: users.status,
        passwordHash: userCredentials.passwordHash,
      })
      .from(users)
      .innerJoin(userCredentials, eq(userCredentials.userId, users.id))
      .where(and(eq(sql`lower(${users.email})`, email), isNull(users.deletedAt)))
      .limit(1);
  }

  private async recordLoginAttempt(input: {
    userId?: string;
    emailFingerprint: string;
    ipFingerprint: string | null;
    successful: boolean;
    failureReason?: string;
  }): Promise<void> {
    await this.database.insert(loginAttempts).values({
      userId: input.userId,
      emailFingerprint: input.emailFingerprint,
      ipFingerprint: input.ipFingerprint,
      successful: input.successful,
      failureReason: input.failureReason,
    });
  }

  private consumeLoginLimit(email: string, ip?: string): void {
    const config = this.appConfigService.value.auth;
    this.rateLimitService.consume({
      key: `login:${this.fingerprint(email)}:${ip ? this.fingerprint(ip) : 'no-ip'}`,
      limit: config.loginLimit,
      windowSeconds: config.loginWindowSeconds,
    });
  }

  private consumeEmailLimit(action: string, value: string, ip?: string): void {
    const config = this.appConfigService.value.auth;
    this.rateLimitService.consume({
      key: `${action}:${this.fingerprint(value)}:${ip ? this.fingerprint(ip) : 'no-ip'}`,
      limit: config.emailLimit,
      windowSeconds: config.emailWindowSeconds,
    });
  }

  private assertAllowedOrigin(origin?: string): void {
    if (!origin) {
      return;
    }

    const allowedOrigins = this.appConfigService.value.corsOrigins;
    if (!allowedOrigins.includes(origin)) {
      throw new ForbiddenException('Origin is not allowed.');
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private fingerprint(value: string): string {
    return this.tokenService.digestToken(value);
  }

  private fromNow(seconds: number): Date {
    return new Date(Date.now() + seconds * 1000);
  }

  private async translateUniqueViolation<T>(callback: () => Promise<T>): Promise<T> {
    try {
      return await callback();
    } catch (error) {
      if ((error as { code?: string }).code === '23505') {
        throw new ConflictException('User e-mail already exists.');
      }
      throw error;
    }
  }
}
