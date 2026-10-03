import { Router } from 'express';
import {
  submitStudentFeedback,
  getFeedbacksByInternship,
  getFeedbacksByCompany,
  getAllFeedbacks,
  submitSystemFeedback,
  getSystemFeedbacks,
  updateSystemFeedback,
} from '../controllers/feedback.controller';
import { authenticateUser, requireAdmin, requireStudent } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

// Student feedbacks on companies/internships
router.post('/student', requireStudent, submitStudentFeedback);
router.get('/internship/:internshipId', getFeedbacksByInternship);
router.get('/company/:companyId', getFeedbacksByCompany);
router.get('/', getAllFeedbacks);

// System feedback (bugs, features, improvements)
router.post('/system', submitSystemFeedback);
router.get('/system', getSystemFeedbacks);
router.patch('/system/:id', requireAdmin, updateSystemFeedback);

export default router;
