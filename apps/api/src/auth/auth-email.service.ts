import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { EMAIL_PROVIDER } from './auth.tokens';
import { EmailMessageType, EmailProvider, EmailSendResult } from './email/email-provider';

@Injectable()
export class AuthEmailService {
  constructor(@Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider) {}

  async sendVerificationEmail(input: { to: string; token: string }): Promise<EmailSendResult> {
    return await this.send({
      type: 'email_verification',
      to: input.to,
      subject: 'Verifique seu e-mail no TES Engine',
      text: ['Use o token abaixo para verificar seu e-mail:', '', input.token, ''].join('\n'),
      html: `<p>Use o token abaixo para verificar seu e-mail:</p><p><strong>${input.token}</strong></p>`,
    });
  }

  async sendPasswordResetEmail(input: { to: string; token: string }): Promise<EmailSendResult> {
    return await this.send({
      type: 'password_reset',
      to: input.to,
      subject: 'Redefina sua senha no TES Engine',
      text: ['Use o token abaixo para redefinir sua senha:', '', input.token, ''].join('\n'),
      html: `<p>Use o token abaixo para redefinir sua senha:</p><p><strong>${input.token}</strong></p>`,
    });
  }

  async sendPasswordChangedEmail(input: { to: string }): Promise<EmailSendResult> {
    return await this.send({
      type: 'password_changed',
      to: input.to,
      subject: 'Senha alterada no TES Engine',
      text: 'Sua senha foi alterada. Se voce nao fez essa alteracao, acione o suporte.',
      html: '<p>Sua senha foi alterada. Se voce nao fez essa alteracao, acione o suporte.</p>',
    });
  }

  private async send(message: {
    type: EmailMessageType;
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<EmailSendResult> {
    try {
      return await this.emailProvider.send(message);
    } catch (error) {
      throw new ServiceUnavailableException(
        `Unable to send auth e-mail: ${(error as Error).message}`,
      );
    }
  }
}
