// config/db.js — MongoDB connection

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // 🌟 यहाँ से पुराने useNewUrlParser और useUnifiedTopology हटा दिए गए हैं
    const conn = await mongoose.connect(process.env.MONGO_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;