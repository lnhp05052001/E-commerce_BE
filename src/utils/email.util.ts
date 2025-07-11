import fs from 'fs';
import Handlebars from 'handlebars';
import nodemailer from 'nodemailer';
import path from 'path';
import './handlebars-helpers';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: Record<string, any>;
}

// Create a transporter
const transporter = nodemailer.createTransport({
  // Configure according to your email provider
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send email using a template
 */
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    // Read the template file
    const templatePath = path.join(__dirname, '..', 'templates', `${options.template}.hbs`);
    const templateContent = fs.readFileSync(templatePath, 'utf8');
    
    // Compile the template
    const template = Handlebars.compile(templateContent);
    
    // Render the template with context
    const html = template(options.context);
    
    // Send the email
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'your-email@example.com',
      to: options.to,
      subject: options.subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
