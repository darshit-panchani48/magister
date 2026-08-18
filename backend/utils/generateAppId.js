// utils/generateAppId.js — Auto generate unique APP ID for new users

const User = require('../models/User');

const generateAppId = async () => {
  const year    = new Date().getFullYear();
  const prefix  = `ASSC/${year}/`;
  const count   = await User.countDocuments();
  const padded  = String(count + 1).padStart(3, '0');
  let   appId   = `${prefix}${padded}`;

  // Ensure uniqueness
  let exists = await User.findOne({ appId });
  let suffix = count + 1;
  while (exists) {
    suffix++;
    appId  = `${prefix}${String(suffix).padStart(3, '0')}`;
    exists = await User.findOne({ appId });
  }

  return appId;
};

module.exports = generateAppId;
