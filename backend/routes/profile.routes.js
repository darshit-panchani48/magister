// routes/profile.routes.js — Profile routes

const express = require('express');
const router  = express.Router();
const { getProfile, upsertProfile } = require('../controllers/profileController');
const { protect }  = require('../middleware/authMiddleware');
const { userOnly } = require('../middleware/adminMiddleware');
const upload       = require('../config/multer');

router.use(protect, userOnly);

router.get('/', getProfile);
router.put('/', upload.single('photo'), upsertProfile);

module.exports = router;
