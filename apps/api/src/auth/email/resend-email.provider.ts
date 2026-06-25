import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { AppConfigService } from '../../config/app-config.service';
import { EmailMessage, EmailProvider, EmailSendResult } from './email-provider';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  constructor(private readonly appConfigService: AppConfigService) {}

  async send(message: EmailMessage): Promise<EmailSendResult> {
    const config = this.appConfigService.value.email;
    const resend = new Resend(config.resendApiKey);
    const fromAddress = config.resendFromAddress ?? config.fromAddress;
    const result = await resend.emails.send({
      from: `${config.fromName} <${fromAddress}>`,
      to: message.to,
      subject: message.subject,
      text: message.text,
      html: message.html,
    });

    return { provider: 'resend', providerMessageId: result.data?.id };
  }
}
