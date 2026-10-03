import { Router } from 'express';
import {
  applyForInternship,
  getMyApplications,
  getAllApplications,
  getApplicationById,
  updateApplicationStatus,
  withdrawApplication,
} from '../controllers/application.controller';
import { authenticateUser, requireStudent, requireFaculty } from '../middleware/auth';
import { uploadResume } from '../middleware/upload';

const router = Router();

router.use(authenticateUser);

// Student submits application (with optional direct PDF file upload)
router.post('/apply', requireStudent, uploadResume.single('resume'), applyForInternship);

// Student gets own applications
router.get('/my', requireStudent, getMyApplications);

// Faculty & Admin view list of applications
router.get('/', requireFaculty, getAllApplications);

// View specific application details (Student if own, or Faculty/Admin)
router.get('/:id', getApplicationById);

// Update status (shortlist, reject, accept by Faculty/Admin, or withdraw by Student)
router.patch('/:id/status', updateApplicationStatus);

// Explicit student withdrawal endpoint
router.post('/:id/withdraw', requireStudent, withdrawApplication);

export default router;
