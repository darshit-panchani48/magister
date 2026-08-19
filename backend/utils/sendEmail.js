// utils/sendEmail.js — Strict Port 465 Gmail Configuration
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set — skipping email');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // Port 465 के लिए true होना अनिवार्य है
    family: 4,    // Render पर IPv6 की समस्या रोकने के लिए
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 60000,
    greetingTimeout: 60000,
    socketTimeout: 60000,
  });

  const mailOptions = {
    from:    `"Magister — ASSC" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html:    html || `<p>${text}</p>`,
    text:    text || subject,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Gmail SMTP Success:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Gmail SMTP Failed:', error.message);
  }
};

module.exports = sendEmail;