import nodemailer from 'nodemailer';
import config from '@config/env';
import logger from '@utils/logger';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  cc?: string;
  bcc?: string;
  attachments?: any[];
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: true,
      auth: {
        user: config.smtp_user,
        pass: config.smtp_password,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `${config.smtp_from_name} <${config.smtp_from}>`,
        ...options,
      });

      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error(`Failed to send email to ${options.to}:`, error);
      throw error;
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${config.frontend_url}/verify-email?token=${token}`;
    const html = `
      <h1>Welcome to Yoya!</h1>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link expires in 24 hours.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - Yoya',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${config.frontend_url}/reset-password?token=${token}`;
    const html = `
      <h1>Password Reset Request</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - Yoya',
      html,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome, ${name}!</h1>
      <p>Your Yoya account is ready. Start exploring our AI-powered communication features!</p>
      <a href="${config.frontend_url}">Go to Yoya</a>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to Yoya!',
      html,
    });
  }

  async sendPaymentReceiptEmail(
    email: string,
    amount: number,
    planName: string,
    invoiceId: string
  ): Promise<void> {
    const html = `
      <h1>Payment Received</h1>
      <p>Thank you for your payment!</p>
      <p>Plan: ${planName}</p>
      <p>Amount: $${amount}</p>
      <p>Invoice ID: ${invoiceId}</p>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Payment Receipt - Yoya',
      html,
    });
  }
}

export default new EmailService();
