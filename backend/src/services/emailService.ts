import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Default email credentials for demo/development
// These allow the app to work immediately when cloned
const DEFAULT_GMAIL_USER = 'acrodriguez012@gmail.com';
const DEFAULT_GMAIL_APP_PASSWORD = 'etlm nmor ploh igua';

// Initialize nodemailer transporter for Gmail
// Uses environment variables if set, otherwise falls back to defaults
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || DEFAULT_GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD || DEFAULT_GMAIL_APP_PASSWORD,
  },
});

/**
 * Generate a random 6-digit OTP code
 */
export function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP code via email
 */
export async function sendOTPEmail(
  email: string,
  code: string,
  purpose: 'signup' | 'login' | 'password-reset'
): Promise<boolean> {
  try {
    const subject = {
      signup: '🎉 Verify Your E-Wallet Account',
      login: '🔐 Verify Your Login',
      'password-reset': '🔑 Reset Your Password',
    }[purpose];

    const htmlContent = {
      signup: `
        <h2>Welcome to E-Wallet!</h2>
        <p>Thank you for signing up. To complete your registration, please verify your email using the code below:</p>
        <h1 style="color: #4CAF50; font-size: 36px; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't sign up for this account, please ignore this email.</p>
      `,
      login: `
        <h2>Verify Your Login</h2>
        <p>Someone is trying to access your E-Wallet account. If this was you, use the code below to verify:</p>
        <h1 style="color: #2196F3; font-size: 36px; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't attempt to log in, please ignore this email.</p>
      `,
      'password-reset': `
        <h2>Reset Your Password</h2>
        <p>We received a request to reset your password. Use the code below to proceed:</p>
        <h1 style="color: #FF9800; font-size: 36px; letter-spacing: 5px;">${code}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request a password reset, please ignore this email.</p>
      `,
    }[purpose];

    const fromEmail = process.env.GMAIL_USER || DEFAULT_GMAIL_USER;
    
    console.log(`📧 Sending OTP email to ${email} from ${fromEmail}...`);
    
    await transporter.sendMail({
      from: fromEmail,
      to: email,
      subject: subject,
      html: htmlContent,
    });

    console.log(`✅ OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    return false;
  }
}

/**
 * Send transaction confirmation email
 */
export async function sendTransactionEmail(
  email: string,
  transactionType: string,
  amount: number,
  currency: string
): Promise<boolean> {
  try {
    const htmlContent = `
      <h2>Transaction Confirmation</h2>
      <p>Your ${transactionType} transaction has been processed successfully.</p>
      <p><strong>Amount:</strong> ${amount} ${currency}</p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
      <p>Thank you for using E-Wallet!</p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: `Transaction Confirmation - ${transactionType}`,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending transaction email:', error);
    return false;
  }
}

/**
 * Send password changed email
 */
export async function sendPasswordChangedEmail(email: string): Promise<boolean> {
  try {
    const htmlContent = `
      <h2>Password Changed</h2>
      <p>Your E-Wallet password has been changed successfully.</p>
      <p>If you didn't make this change, please contact our support team immediately.</p>
      <p>Thank you for using E-Wallet!</p>
    `;

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Changed Confirmation',
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('Error sending password changed email:', error);
    return false;
  }
}
