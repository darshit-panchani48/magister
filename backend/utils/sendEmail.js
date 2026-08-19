// utils/sendEmail.js — Nodemailer Gmail SMTP

const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set — skipping email');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'smtp.gmail.com',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Use Gmail App Password (not account password)
    },
  });

  const mailOptions = {
    from:    `"Magister — ASSC" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html:    html || `<p>${text}</p>`,
    text:    text || subject,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('✅ Email sent:', info.messageId);
  return info;
};

module.exports = sendEmail;
