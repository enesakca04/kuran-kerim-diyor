import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getProfile } from '../controllers/user.controller';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);

export default router;
