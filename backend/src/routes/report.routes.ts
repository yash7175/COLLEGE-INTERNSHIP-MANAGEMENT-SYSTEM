import { Router } from 'express';
import {
  getAdminDashboardStats,
  getAdminReports,
  getFacultyDashboardStats,
  getStudentDashboardStats,
} from '../controllers/report.controller';
import { authenticateUser, requireAdmin, requireFaculty, requireStudent } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/admin/stats', requireAdmin, getAdminDashboardStats);
router.get('/admin', requireAdmin, getAdminReports);
router.get('/faculty/stats', requireFaculty, getFacultyDashboardStats);
router.get('/student/stats', requireStudent, getStudentDashboardStats);

export default router;
