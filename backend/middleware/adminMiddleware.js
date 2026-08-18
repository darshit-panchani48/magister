// middleware/adminMiddleware.js — Role-based access control

const adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin only.',
    });
  }
  next();
};

const userOnly = (req, res, next) => {
  if (req.role !== 'user') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Users only.',
    });
  }
  next();
};

module.exports = { adminOnly, userOnly };
