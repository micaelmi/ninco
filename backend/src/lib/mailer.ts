import nodemailer from 'nodemailer';
import { env } from './env';

export const mailer = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string, replyTo?: string) => {
  // If no SMTP host is configured, log the email content (for development/testing without credentials)
  if (!env.SMTP_HOST || env.SMTP_HOST === 'smtp.example.com') {
    console.log('--- EMAIL SIMULATION ---');
    console.log(`To: ${to}`);
    console.log(`Reply-To: ${replyTo}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${html}`);
    console.log('------------------------');
    return;
  }

  try {
    await mailer.sendMail({
      from: env.SMTP_FROM,
      to,
      replyTo,
      subject,
      html,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};
