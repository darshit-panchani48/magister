// utils/seedAdmin.js — Create default admin (run once)

require('dotenv').config();
const mongoose = require('mongoose');
const Admin    = require('../models/Admin');
const connectDB = require('../config/db');

const seedAdmin = async () => {
  await connectDB();

  const appId    = process.env.ADMIN_DEFAULT_APP_ID    || 'ASSC/ADMIN/001';
  const password = process.env.ADMIN_DEFAULT_PASSWORD  || 'admin123';

  const existing = await Admin.findOne({ appId });
  if (existing) {
    console.log(`✅ Admin already exists: ${appId}`);
    process.exit(0);
  }

  await Admin.create({ appId, password, name: 'Super Admin' });
  console.log(`✅ Admin created successfully!`);
  console.log(`   APP ID   : ${appId}`);
  console.log(`   Password : ${password}`);
  console.log(`   ⚠️  Change this password after first login!`);

  process.exit(0);
};

seedAdmin().catch(err => {
  console.error('Seed error:', err.message);
  process.exit(1);
});
