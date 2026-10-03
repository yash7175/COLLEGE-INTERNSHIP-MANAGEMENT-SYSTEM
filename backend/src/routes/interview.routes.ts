import { Router } from 'express';
import {
  scheduleInterview,
  updateInterview,
  getInterviews,
} from '../controllers/interview.controller';
import { authenticateUser, requireFaculty } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', getInterviews);
router.post('/schedule', requireFaculty, scheduleInterview);
router.put('/:id', requireFaculty, updateInterview);

export default router;
