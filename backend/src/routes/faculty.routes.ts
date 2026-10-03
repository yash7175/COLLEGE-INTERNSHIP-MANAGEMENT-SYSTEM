import { Router } from 'express';
import {
  getFacultyProfile,
  updateFacultyProfile,
  getAllFaculty,
} from '../controllers/faculty.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', requireAdmin, getAllFaculty);
router.get('/profile', getFacultyProfile);
router.get('/profile/:id', getFacultyProfile);
router.put('/profile', updateFacultyProfile);
router.put('/profile/:id', updateFacultyProfile);

export default router;
