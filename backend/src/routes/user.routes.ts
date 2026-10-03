import { Router } from 'express';
import {
  getAllUsers,
  createUserByAdmin,
  toggleUserStatus,
  deleteUser,
} from '../controllers/user.controller';
import { authenticateUser, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateUser, requireAdmin);

router.get('/', getAllUsers);
router.post('/', createUserByAdmin);
router.patch('/:id/status', toggleUserStatus);
router.delete('/:id', deleteUser);

export default router;
