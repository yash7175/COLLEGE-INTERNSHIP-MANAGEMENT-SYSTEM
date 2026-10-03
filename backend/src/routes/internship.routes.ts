import { Router } from 'express';
import {
  getAllInternships,
  getInternshipById,
  createInternship,
  updateInternship,
  updateInternshipStatus,
  deleteInternship,
} from '../controllers/internship.controller';
import { authenticateUser, requireAdmin, requireFaculty } from '../middleware/auth';

const router = Router();

// Browsing and reading internships (Supports query params: search, domain, companyId, location, stipend range, status, page, limit)
router.get('/', getAllInternships);
router.get('/:id', getInternshipById);

// Create internship (Faculty and Admin)
router.post('/', authenticateUser, requireFaculty, createInternship);

// Update internship (Owner Faculty or Admin)
router.put('/:id', authenticateUser, requireFaculty, updateInternship);

// Status change / Approval workflow (Admin or Faculty for draft)
router.patch('/:id/status', authenticateUser, requireAdmin, updateInternshipStatus);

// Delete internship
router.delete('/:id', authenticateUser, requireAdmin, deleteInternship);

export default router;
