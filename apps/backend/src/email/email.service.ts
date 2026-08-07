import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@/config/config.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const emailProvider = process.env.EMAIL_PROVIDER || 'smtp';
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;

    if (emailProvider === 'smtp' && smtpHost && smtpUser && smtpPassword) {
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPassword,
        },
      });
    } else {
      // For development, use a test account (ethereal)
      if (process.env.NODE_ENV !== 'production') {
        // Skip email sending in development if no SMTP configured
        console.warn('Email service: No SMTP configured, emails will be logged only');
      }
    }
  }

  async sendReportEmail(to: string, subject: string, htmlContent: string): Promise<void> {
    if (!this.transporter) {
      console.log(`[EMAIL] To: ${to}, Subject: ${subject}`);
      return;
    }

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || 'noreply@oakami.com',
        to,
        subject,
        html: htmlContent,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new BadRequestException('Failed to send email');
    }
  }

  async sendWasteAlert(
    to: string,
    organizationName: string,
    wasteData: {
      totalCost: number;
      totalQuantity: number;
      topCategory: string;
      categoryCount: number;
    },
  ): Promise<void> {
    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #dc2626;">Waste Alert - ${organizationName}</h2>
            <p>High waste detected in your organization.</p>
            <div style="background-color: #fee2e2; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p><strong>Total Waste Cost:</strong> $${wasteData.totalCost.toFixed(2)}</p>
              <p><strong>Total Quantity:</strong> ${wasteData.totalQuantity.toFixed(2)} kg</p>
              <p><strong>Top Category:</strong> ${wasteData.topCategory} (${wasteData.categoryCount} records)</p>
            </div>
            <p style="color: #666; font-size: 12px;">
              This is an automated alert from Oakami Waste Intelligence System.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendReportEmail(to, `Waste Alert - ${organizationName}`, htmlContent);
  }

  async sendExpiryAlert(
    to: string,
    organizationName: string,
    items: Array<{ name: string; expiryDate: string }>,
  ): Promise<void> {
    const itemsList = items.map((item) => `<li>${item.name} - Expires on ${item.expiryDate}</li>`).join('');

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #ea580c;">Expiry Alert - ${organizationName}</h2>
            <p>The following items are expiring soon:</p>
            <ul style="background-color: #fef3c7; padding: 15px; border-radius: 4px; margin: 20px 0;">
              ${itemsList}
            </ul>
            <p style="color: #666; font-size: 12px;">
              This is an automated alert from Oakami Waste Intelligence System.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendReportEmail(to, `Expiry Alert - ${organizationName}`, htmlContent);
  }

  async sendLowStockAlert(
    to: string,
    organizationName: string,
    items: Array<{ name: string; currentQuantity: number; minThreshold: number }>,
  ): Promise<void> {
    const itemsList = items
      .map((item) => `<li>${item.name} - Current: ${item.currentQuantity}, Min: ${item.minThreshold}</li>`)
      .join('');

    const htmlContent = `
      <html>
        <body style="font-family: Arial, sans-serif; color: #333; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #7c3aed;">Low Stock Alert - ${organizationName}</h2>
            <p>The following items are below their minimum threshold:</p>
            <ul style="background-color: #ede9fe; padding: 15px; border-radius: 4px; margin: 20px 0;">
              ${itemsList}
            </ul>
            <p style="color: #666; font-size: 12px;">
              This is an automated alert from Oakami Waste Intelligence System.
            </p>
          </div>
        </body>
      </html>
    `;

    await this.sendReportEmail(to, `Low Stock Alert - ${organizationName}`, htmlContent);
  }
}
