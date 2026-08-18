// routes/admin.routes.js — Admin routes

const express = require('express');
const router  = express.Router();
const {
  createMember, getAllMembers, getMemberRecords,
  toggleMemberStatus, adminDeleteRecord,
} = require('../controllers/adminController');
const { getAdminProfile, upsertAdminProfile } = require('../controllers/adminProfileController');
const { protect }   = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');
const upload        = require('../config/multer');

router.use(protect, adminOnly);

// Members
router.get('/members',                   getAllMembers);
router.post('/members',                  createMember);
router.get('/members/:id/records',       getMemberRecords);
router.put('/members/:id/toggle-status', toggleMemberStatus);

// Records
router.delete('/records/:id',            adminDeleteRecord);

// Admin profile
router.get('/profile',  getAdminProfile);
router.put('/profile',  upload.single('photo'), upsertAdminProfile);

module.exports = router;
