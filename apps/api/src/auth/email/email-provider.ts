export type EmailMessageType = 'email_verification' | 'password_reset' | 'password_changed';

export interface EmailMessage {
  type: EmailMessageType;
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailSendResult {
  provider: 'smtp' | 'resend' | 'fake';
  providerMessageId?: string;
}

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailSendResult>;
}
