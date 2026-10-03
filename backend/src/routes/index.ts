import { Router } from 'express';
import authRoutes from './auth.routes';
import studentRoutes from './student.routes';
import facultyRoutes from './faculty.routes';
import companyRoutes from './company.routes';
import internshipRoutes from './internship.routes';
import applicationRoutes from './application.routes';
import interviewRoutes from './interview.routes';
import evaluationRoutes from './evaluation.routes';
import feedbackRoutes from './feedback.routes';
import notificationRoutes from './notification.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/students', studentRoutes);
router.use('/faculty', facultyRoutes);
router.use('/companies', companyRoutes);
router.use('/internships', internshipRoutes);
router.use('/applications', applicationRoutes);
router.use('/interviews', interviewRoutes);
router.use('/evaluations', evaluationRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);

export default router;
