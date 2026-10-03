import { Router } from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  archiveCompany,
  deleteCompany,
} from '../controllers/company.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

// Companies list and details can be browsed publicly or by logged-in users
router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);

// Administrative operations
router.post('/', authenticateUser, requireAdmin, createCompany);
router.put('/:id', authenticateUser, requireAdmin, updateCompany);
router.patch('/:id/archive', authenticateUser, requireAdmin, archiveCompany);
router.delete('/:id', authenticateUser, requireAdmin, deleteCompany);

export default router;
