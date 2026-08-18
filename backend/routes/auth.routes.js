// routes/auth.routes.js — Auth routes

const express = require('express');
const router  = express.Router();
const { login, getMe, forgotPassword, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login',           login);
router.post('/forgot-password', forgotPassword);
router.get('/me',               protect, getMe);
router.put('/change-password',  protect, changePassword);

module.exports = router;
