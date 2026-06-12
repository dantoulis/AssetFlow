import { Injectable, InternalServerErrorException } from '@nestjs/common';
import nodemailer from 'nodemailer';
import type SMTPTransport from 'nodemailer/lib/smtp-transport';

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
      auth: user && pass ? { user, pass } : undefined,
    };
  }

  private getTransporter() {
    return nodemailer.createTransport(this.getTransportOptions());
  }

  async sendPasswordResetEmail(emailTo: string, resetUrl: string): Promise<void> {
    const mailFrom = process.env.MAIL_FROM?.trim();

    if (!mailFrom) {
      throw new InternalServerErrorException('MAIL_FROM is not configured');
    }

    const transporter = this.getTransporter();

    try {
      await transporter.sendMail({
        from: mailFrom,
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
