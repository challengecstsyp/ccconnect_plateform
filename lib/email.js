import crypto from 'crypto';
import nodemailer from 'nodemailer';

const EMAIL_FROM = process.env.SMTP_USER || process.env.EMAIL_FROM || 'noreply@utopiahire.com';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Create reusable transporter
const createTransporter = () => {
  // Check if SMTP credentials are provided
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Debug logging to see what we have
  console.log('🔍 SMTP Configuration Check:');
  console.log('  SMTP_HOST:', smtpHost ? '✓ Set' : '✗ Missing');
  console.log('  SMTP_USER:', smtpUser ? '✓ Set' : '✗ Missing');
  console.log('  SMTP_PASS:', smtpPass ? '✓ Set' : '✗ Missing');
  console.log('  SMTP_PORT:', process.env.SMTP_PORT || '587 (default)');

  // If no SMTP credentials, return null to use console logging
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn('⚠️ SMTP credentials not found. Email will be logged to console only.');
    console.warn('⚠️ Make sure .env.local has SMTP_HOST, SMTP_USER, and SMTP_PASS');
    console.warn('⚠️ Restart your Next.js dev server after adding .env.local variables');
    return null;
  }

  // Create transporter with SMTP configuration
  return nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    // Add TLS options for better compatibility
    tls: {
      rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false',
    },
  });
};

/**
 * Generate email verification token
 */
export function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Send email using nodemailer or console (development)
 */
async function sendEmail({ to, subject, html, text }) {
  const transporter = createTransporter();
  const smtpHost = process.env.SMTP_HOST;

  // If no transporter (no SMTP configured), log to console
  if (!transporter) {
    console.log('\n📧 EMAIL (NO SMTP CONFIGURED - LOGGING TO CONSOLE)');
    console.log('=====================================');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`\n${text || html}\n`);
    console.log('=====================================');
    console.log('⚠️ To send real emails, configure SMTP_HOST, SMTP_USER, and SMTP_PASS in .env.local\n');
    return { success: true };
  }

  try {
    const mailOptions = {
      from: `"UtopiaHire" <${EMAIL_FROM}>`,
      to,
      subject,
      html,
      text,
    };

    console.log(`📤 Attempting to send email to ${to} via ${smtpHost}:${process.env.SMTP_PORT || '587'}`);
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📧 Message ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    console.error('Error details:', {
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      errno: error.errno,
    });
    
    // Provide more helpful error messages
    let errorMessage = error.message;
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Check SMTP_USER and SMTP_PASS in .env.local';
    } else if (error.code === 'ECONNECTION') {
      errorMessage = `Could not connect to SMTP server ${smtpHost || 'unknown'}. Check SMTP_HOST and SMTP_PORT in .env.local`;
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'SMTP connection timed out. Check your network and SMTP settings.';
    }
    
    // Don't throw - let the caller handle it
    return { success: false, error: errorMessage, details: error };
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email, token, name) {
  const verificationLink = `${APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify your email - UtopiaHire</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">UtopiaHire</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Hello ${name}!</h2>
        <p>Thank you for signing up with UtopiaHire. Please verify your email address by clicking the button below:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">Verify Email Address</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #667eea; font-size: 12px; word-break: break-all;">${verificationLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          This link will expire in 24 hours.<br>
          If you didn't create an account with UtopiaHire, please ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${name}!

Thank you for signing up with UtopiaHire. Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 24 hours.

If you didn't create an account with UtopiaHire, please ignore this email.

Best regards,
The UtopiaHire Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify your UtopiaHire account',
    html,
    text,
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, token, name) {
  const resetLink = `${APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset your password - UtopiaHire</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">UtopiaHire</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Hello ${name}!</h2>
        <p>You requested to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
        <p style="color: #667eea; font-size: 12px; word-break: break-all;">${resetLink}</p>
        <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          This link will expire in 1 hour.<br>
          If you didn't request a password reset, please ignore this email and your password will remain unchanged.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${name}!

You requested to reset your password. Click the link below to create a new password:

${resetLink}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email and your password will remain unchanged.

Best regards,
The UtopiaHire Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset your UtopiaHire password',
    html,
    text,
  });
}

/**
 * Send welcome email (after verification)
 */
export async function sendWelcomeEmail(email, name) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to UtopiaHire!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Welcome to UtopiaHire!</h1>
      </div>
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #667eea; margin-top: 0;">Hello ${name}!</h2>
        <p>Your email has been verified successfully. Welcome to UtopiaHire!</p>
        <p>You can now start exploring our AI-powered career tools:</p>
        <ul style="color: #666;">
          <li>📄 Optimize your resume with AI</li>
          <li>🎯 Find perfect job matches</li>
          <li>🎤 Practice interviews with AI</li>
          <li>📊 Track your career progress</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${APP_URL}/dashboard" style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold;">Go to Dashboard</a>
        </div>
        <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          Thank you for joining UtopiaHire!<br>
          If you have any questions, feel free to contact our support team.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${name}!

Your email has been verified successfully. Welcome to UtopiaHire!

You can now start exploring our AI-powered career tools:
- Optimize your resume with AI
- Find perfect job matches
- Practice interviews with AI
- Track your career progress

Visit your dashboard: ${APP_URL}/dashboard

Thank you for joining UtopiaHire!
If you have any questions, feel free to contact our support team.

Best regards,
The UtopiaHire Team
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to UtopiaHire!',
    html,
    text,
  });
}
