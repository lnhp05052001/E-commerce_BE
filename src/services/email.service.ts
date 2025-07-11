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
   * Validate email format
   * @param email - Email address to validate
   * @returns True if email is valid
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

export default new EmailService();
