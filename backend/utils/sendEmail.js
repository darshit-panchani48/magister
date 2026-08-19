// utils/sendEmail.js — Timeout increased to 60 seconds
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set — skipping email');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // 🌟 यहाँ टाइमआउट बढ़ाकर 60 सेकंड कर दिया गया है
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
    console.log('✅ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
  }
};

module.exports = sendEmail;