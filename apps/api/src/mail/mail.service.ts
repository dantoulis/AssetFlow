import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

interface MailSender {
  email: string;
  name?: string;
}

@Injectable()
export class MailService {
  private parseEnvBoolean(value: string | undefined, defaultValue: boolean): boolean {
    if (value === undefined) {
      return defaultValue;
    }

    return value.trim().toLowerCase() === 'true';
  }

  private getTransportOptions(): SMTPTransport.Options {
    const host = process.env.SMTP_HOST?.trim() || 'localhost';
    const port = parseInt(process.env.SMTP_PORT ?? '1025', 10);
    const user = process.env.SMTP_USER?.trim();
    const pass = process.env.SMTP_PASS?.trim();

    if (isNaN(port)) {
      throw new InternalServerErrorException('SMTP_PORT must be a valid number');
    }

    return {
      host,
      port,
      secure: this.parseEnvBoolean(process.env.SMTP_SECURE, false),
      ignoreTLS: this.parseEnvBoolean(process.env.SMTP_IGNORE_TLS, true),
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      auth: user && pass ? { user, pass } : undefined,
    };
  }

  private getTransporter() {
    return nodemailer.createTransport(this.getTransportOptions());
  }

  private getMailFrom(): { raw: string; sender: MailSender } {
    const mailFrom = process.env.MAIL_FROM?.trim();

    if (!mailFrom) {
      throw new InternalServerErrorException('MAIL_FROM is not configured');
    }

    const senderMatch = mailFrom.match(/^(.*?)<([^<>]+)>$/);

    if (!senderMatch) {
      return {
        raw: mailFrom,
        sender: { email: mailFrom },
      };
    }

    const name = senderMatch[1].trim().replace(/^["']|["']$/g, '');
    const email = senderMatch[2].trim();

    return {
      raw: mailFrom,
      sender: {
        email,
        ...(name ? { name } : {}),
      },
    };
  }

  private async sendWithBrevoApi(options: {
    apiKey: string;
    emailTo: string;
    resetUrl: string;
    sender: MailSender;
  }): Promise<void> {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'api-key': options.apiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: options.sender,
        to: [{ email: options.emailTo }],
        subject: 'Reset your AssetFlow password',
        htmlContent: `<p>Reset your password:</p><p><a href="${options.resetUrl}">${options.resetUrl}</a></p>`,
        textContent: `Reset your password: ${options.resetUrl}`,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      const details = responseBody || response.statusText;

      throw new Error(`Brevo API send failed (${response.status}): ${details}`);
    }
  }

  async sendPasswordResetEmail(emailTo: string, resetUrl: string): Promise<void> {
    const mailFrom = this.getMailFrom();
    const brevoApiKey = process.env.BREVO_API_KEY?.trim();

    if (brevoApiKey) {
      try {
        await this.sendWithBrevoApi({
          apiKey: brevoApiKey,
          emailTo,
          resetUrl,
          sender: mailFrom.sender,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Brevo API send failed';

        throw new InternalServerErrorException(message);
      }

      return;
    }

    const transporter = this.getTransporter();

    try {
      await transporter.sendMail({
        from: mailFrom.raw,
        to: emailTo,
        subject: 'Reset your AssetFlow password',
        html: `<p>Reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
        text: `Reset your password: ${resetUrl}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'SMTP send failed';

      throw new InternalServerErrorException(message);
    }
  }
}
