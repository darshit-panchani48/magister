// utils/sendEmail.js — Updated with Timeout Handling
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
    // 🌟 यहाँ टाइमआउट बढ़ा दें ताकि Render के स्लो नेटवर्क पर कनेक्शन न टूटे
    connectionTimeout: 20000, // 20 seconds
    greetingTimeout: 20000,
    socketTimeout: 20000,
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
    // non-critical है इसलिए एरर को आगे थ्रो (throw) नहीं किया जा रहा ताकि ऐप क्रैश न हो
  }
};

module.exports = sendEmail;