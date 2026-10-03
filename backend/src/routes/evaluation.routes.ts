import { Router } from 'express';
import {
  createOrUpdateEvaluation,
  getEvaluationByApplication,
  getAllEvaluations,
} from '../controllers/evaluation.controller';
import { authenticateUser, requireFaculty } from '../middleware/auth';

const router = Router();

router.use(authenticateUser);

router.get('/', requireFaculty, getAllEvaluations);
router.get('/application/:applicationId', getEvaluationByApplication);
router.post('/', requireFaculty, createOrUpdateEvaluation);

export default router;
