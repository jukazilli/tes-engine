import { Module } from '@nestjs/common';
import { AppConfigService } from '../config/app-config.service';
import { AuthController } from './auth.controller';
import { AuthEmailService } from './auth-email.service';
import { AuthService } from './auth.service';
import { EMAIL_PROVIDER } from './auth.tokens';
import { FakeEmailProvider } from './email/fake-email.provider';
import { ResendEmailProvider } from './email/resend-email.provider';
import { SmtpEmailProvider } from './email/smtp-email.provider';
import { PasswordService } from './password.service';
import { AuthRateLimitService } from './rate-limit.service';
import { TokenService } from './token.service';

@Module({
  controllers: [AuthController],
  providers: [
    AppConfigService,
    AuthEmailService,
    AuthRateLimitService,
    AuthService,
    FakeEmailProvider,
    PasswordService,
    ResendEmailProvider,
    SmtpEmailProvider,
    TokenService,
    {
      provide: EMAIL_PROVIDER,
      inject: [AppConfigService, SmtpEmailProvider, ResendEmailProvider, FakeEmailProvider],
      useFactory: (
        appConfigService: AppConfigService,
        smtp: SmtpEmailProvider,
        resend: ResendEmailProvider,
        fake: FakeEmailProvider,
      ) => {
        const provider = appConfigService.value.email.provider;
        if (provider === 'resend') {
          return resend;
        }
        if (provider === 'fake') {
          return fake;
        }
        return smtp;
      },
    },
  ],
})
export class AuthModule {}
