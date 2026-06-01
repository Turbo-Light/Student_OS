import nodemailer from 'nodemailer';

/**
 * @desc    Sends a plain-text email via configured SMTP transport.
 * @param   {string} to      - Recipient email address
 * @param   {string} subject - Email subject line
 * @param   {string} text    - Plain-text body
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text) => {
  // Validate that required SMTP credentials exist before attempting connection
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('[Email] SMTP credentials not configured. Skipping email send.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // TLS via STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"AI Student OS" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Message sent: ${info.messageId} → ${to}`);
  } catch (error) {
    console.error(`[Email] Failed to send email to ${to}:`, error.message);
    // Do not re-throw — email failure should never crash the cron daemon
  }
};

export default sendEmail;
