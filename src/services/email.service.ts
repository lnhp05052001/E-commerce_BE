import fs from 'fs';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
import '../utils/handlebars-helpers';

/**
 * Service for handling email operations
 */
class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  /**
   * Send email with order details
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param template - Template name (without extension)
   * @param context - Data to be passed to the template
   */
  async sendOrderEmail(to: string, subject: string, template: string, context: Record<string, any>): Promise<void> {
    try {
      // Validate email format
      if (!this.isValidEmail(to)) {
        throw new Error('Invalid email address');
      }

      // Read the template file
      const templatePath = path.join(__dirname, '..', 'templates', `${template}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf8');
      
      // Compile the template
      const compiledTemplate = Handlebars.compile(templateContent);
      
      // Render the template with context
      const html = compiledTemplate(context);
      
      // Send the email
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Cửa hàng" <noreply@example.com>',
        to,
        subject,
        html,
      });

      console.log(`Email sent to ${to}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Send simple email (for reset password, notifications, etc.)
   * @param to - Recipient email address
   * @param subject - Email subject
   * @param text - Plain text content
   * @param html - HTML content (optional)
   */
  async sendEmail(to: string, subject: string, text: string, html?: string): Promise<boolean> {
    try {
      // Validate email format
      if (!this.isValidEmail(to)) {
        throw new Error('Invalid email address');
      }

      // Send the email
      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Fashion Factory" <noreply@example.com>',
        to,
        subject,
        text,
        html: html || text,
      });

      console.log(`Email sent to ${to}`);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Validate email format
   * @param email - Email address to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Verify email service connection
   * @returns Promise<boolean>
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('✅ Email service connected successfully');
      return true;
    } catch (error) {
      console.error('❌ Email service connection failed:', error);
      return false;
    }
  }
}

export default new EmailService();
