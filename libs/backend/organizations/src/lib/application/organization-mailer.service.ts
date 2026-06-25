import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

export interface OrganizationInvitationEmailInput {
  to: string;
  organizationName: string;
  roleName: string;
  expiresAt: Date;
  token: string;
}

@Injectable()
export class OrganizationMailerService {
  readonly fakeMessages: OrganizationInvitationEmailInput[] = [];

  constructor(private readonly configService: ConfigService) {}

  async sendInvitation(input: OrganizationInvitationEmailInput): Promise<{
    provider: 'smtp' | 'resend' | 'fake';
    providerMessageId?: string;
  }> {
    const provider = this.configService.get<'smtp' | 'resend' | 'fake'>('EMAIL_PROVIDER') ?? 'smtp';
    if (provider === 'fake') {
      this.fakeMessages.push(input);
      return { provider: 'fake', providerMessageId: `fake-${this.fakeMessages.length}` };
    }

    const message = this.buildMessage(input);
    if (provider === 'resend') {
      const apiKey = this.configService.get('RESEND_API_KEY');
      if (!apiKey) {
        throw new ServiceUnavailableException('RESEND_API_KEY is required.');
      }
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: this.fromAddress(),
        to: input.to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      });
      return { provider: 'resend', providerMessageId: result.data?.id };
    }

    const transport = nodemailer.createTransport({
      host: this.configService.get('SMTP_HOST'),
      port: Number(this.configService.get('SMTP_PORT') ?? 1025),
      secure: this.configService.get('SMTP_SECURE') === 'true',
      auth: this.configService.get('SMTP_USER')
        ? {
            user: this.configService.get('SMTP_USER'),
            pass: this.configService.get('SMTP_PASSWORD'),
          }
        : undefined,
    });
    const result = await transport.sendMail({
      from: this.fromAddress(),
      to: input.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
    return { provider: 'smtp', providerMessageId: result.messageId };
  }

  private buildMessage(input: OrganizationInvitationEmailInput) {
    const appWebUrl = this.configService.get('APP_WEB_URL') ?? 'http://localhost:4200';
    const link = `${appWebUrl}/aceitar-convite?token=${input.token}`;
    const expiresAt = input.expiresAt.toISOString();
    return {
      subject: 'Convite para organizacao',
      text: [
        `Voce recebeu um convite para a organizacao ${input.organizationName}.`,
        `Papel inicial: ${input.roleName}.`,
        `Valido ate: ${expiresAt}.`,
        `Acesse: ${link}`,
      ].join('\n'),
      html: [
        `<p>Voce recebeu um convite para a organizacao <strong>${input.organizationName}</strong>.</p>`,
        `<p>Papel inicial: <strong>${input.roleName}</strong>.</p>`,
        `<p>Valido ate: ${expiresAt}.</p>`,
        `<p><a href="${link}">Aceitar convite</a></p>`,
      ].join(''),
    };
  }

  private fromAddress(): string {
    const resendFrom = this.configService.get('RESEND_FROM_ADDRESS');
    const fromAddress = resendFrom || this.configService.get('EMAIL_FROM_ADDRESS');
    const fromName = this.configService.get('EMAIL_FROM_NAME') ?? 'TES Engine';
    return `${fromName} <${fromAddress}>`;
  }
}
