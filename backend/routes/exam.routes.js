// routes/exam.routes.js — Exam routes

const express = require('express');
const router  = express.Router();
const {
  createExam, getMyExams, getExamById, updateExam, deleteExam,
} = require('../controllers/examController');
const { protect }  = require('../middleware/authMiddleware');
const { userOnly } = require('../middleware/adminMiddleware');

router.use(protect, userOnly);

router.get('/',     getMyExams);
router.post('/',    createExam);
router.get('/:id',  getExamById);
router.put('/:id',  updateExam);
router.delete('/:id', deleteExam);

module.exports = router;
