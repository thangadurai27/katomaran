const nodemailer = require('nodemailer');
const logger = require('./logger');

const hasEmailConfig = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasEmailConfig
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 3000,
        greetingTimeout: 3000,
        socketTimeout: 5000,
    })
    : null;

const sendEmail = async ({ to, subject, html, text }) => {
    if (!transporter) return { success: false, skipped: true };
    try {
        const info = await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            html,
            text,
        });
        logger.info(`Email sent: ${info.messageId} to ${to}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        logger.error(`Email sending failed: ${error.message}`);
        throw error;
    }
};

const sendVerificationEmail = async (user, token) => {
    if (!transporter) return;
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    return sendEmail({
        to: user.email,
        subject: 'Verify your SnapLink AI account',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <h1 style="color: #6366f1; text-align: center;">SnapLink AI</h1>
        <h2 style="text-align: center;">Verify Your Email</h2>
        <p>Hi ${user.name},</p>
        <p>Thank you for signing up for SnapLink AI! Please verify your email address to get started.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background: #6366f1; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Verify Email</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, ignore this email.</p>
      </div>
    `,
    });
};

const sendPasswordResetEmail = async (user, token) => {
    if (!transporter) return;
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    return sendEmail({
        to: user.email,
        subject: 'Reset your SnapLink AI password',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 40px; border-radius: 12px;">
        <h1 style="color: #6366f1; text-align: center;">SnapLink AI</h1>
        <h2 style="text-align: center;">Reset Your Password</h2>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the button below to choose a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background: #ef4444; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">Reset Password</a>
        </div>
        <p style="color: #94a3b8; font-size: 14px;">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
      </div>
    `,
    });
};

module.exports = { sendEmail, sendVerificationEmail, sendPasswordResetEmail };
