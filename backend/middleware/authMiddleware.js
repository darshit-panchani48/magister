// middleware/authMiddleware.js — JWT auth middleware

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized. No token.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.role = decoded.role;

    if (decoded.role === 'admin') {
      const admin = await Admin.findById(decoded.id);
      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin account not found or inactive.',
        });
      }
      req.user = admin;
    } else {
      const user = await User.findById(decoded.id);
      if (!user) {
        return res
          .status(401)
          .json({ success: false, message: 'User not found.' });
      }
      if (!user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account deactivated. Contact admin.',
        });
      }
      req.user = user;
    }

    next();
  } catch (err) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized. Invalid token.' });
  }
};

module.exports = { protect };