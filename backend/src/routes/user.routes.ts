import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile, deleteAccount } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.delete('/', deleteAccount);

export default router;
