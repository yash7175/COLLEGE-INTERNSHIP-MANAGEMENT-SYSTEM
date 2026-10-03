import { Router } from 'express';
import {
  getStudentProfile,
  updateStudentProfile,
  uploadResumeFile,
  getStudentResumes,
  deleteResumeFile,
  getAllStudents,
} from '../controllers/student.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

router.use(authenticateUser);

router.get('/', requireAdmin, getAllStudents);
router.get('/profile', getStudentProfile);
router.get('/profile/:id', getStudentProfile);
router.put('/profile', updateStudentProfile);
router.put('/profile/:id', updateStudentProfile);

router.post('/resume', uploadResume.single('resume'), uploadResumeFile);
router.get('/resumes', getStudentResumes);
router.delete('/resumes/:id', deleteResumeFile);

export default router;
