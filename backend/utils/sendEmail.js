const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('EMAIL_USER or EMAIL_PASS is missing');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.verify();

  const info = await transporter.sendMail({
    from: `"Magister — ASSC" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: html || `<p>${text || subject}</p>`,
    text: text || subject,
  });

  console.log('✅ EMAIL SENT:', info.messageId);

  return info;
};

module.exports = sendEmail;