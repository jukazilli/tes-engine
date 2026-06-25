import { Injectable } from '@nestjs/common';
import { createTransport } from 'nodemailer';
import { AppConfigService } from '../../config/app-config.service';
import { EmailMessage, EmailProvider, EmailSendResult } from './email-provider';

@Injectable()
export class SmtpEmailProvider implements EmailProvider {
  constructor(private readonly appConfigService: AppConfigService) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const config = this.appConfigService.value.email;
    const transport = createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth:
        config.smtpUser && config.smtpPassword
          ? { user: config.smtpUser, pass: config.smtpPassword }
          : undefined,
    });

    const result = await transport.sendMail({
      from: { name: config.fromName, address: config.fromAddress },
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return { provider: 'smtp', providerMessageId: result.messageId };
  }
}
