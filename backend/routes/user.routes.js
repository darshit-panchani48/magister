// routes/user.routes.js — User routes

const express = require('express');
const router  = express.Router();
const { getDashboard } = require('../controllers/userController');
const { protect }      = require('../middleware/authMiddleware');
const { userOnly }     = require('../middleware/adminMiddleware');

router.use(protect);
router.get('/dashboard', userOnly, getDashboard);

module.exports = router;
