// utils/generateToken.js — JWT token generator

const jwt = require('jsonwebtoken');

const generateToken = (id, role, appId) => {
  return jwt.sign(
    { id, role, appId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
