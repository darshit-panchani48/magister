// utils/sendEmail.js — Ultimate Gmail Fix with Port 465 & IPv4 for Render
const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  EMAIL_USER or EMAIL_PASS not set — skipping email');
    return;
  }

  // 🌟 यहाँ पोर्ट 465 और secure: true का उपयोग किया गया है जो रेंडर पर कभी ब्लॉक नहीं होता
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for 465, false for 587
    family: 4,    // Render पर IPv6 की समस्या को खत्म करने के लिए
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
    console.log('✅ Email sent successfully to Gmail:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email send failed:', error.message);
  }
};

module.exports = sendEmail;