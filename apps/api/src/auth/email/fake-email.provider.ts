import { Injectable } from '@nestjs/common';
import { EmailMessage, EmailProvider, EmailSendResult } from './email-provider';

@Injectable()
export class FakeEmailProvider implements EmailProvider {
  private readonly messages: EmailMessage[] = [];

  async send(message: EmailMessage): Promise<EmailSendResult> {
    this.messages.push(message);
    return { provider: 'fake', providerMessageId: `fake-${this.messages.length}` };
  }

  listMessages(): readonly EmailMessage[] {
    return this.messages;
  }

  clear(): void {
    this.messages.length = 0;
  }
}
