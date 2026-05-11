import { Router } from 'express';
import { register, login, guestLogin, refresh, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/guest', guestLogin);
router.post('/refresh', refresh);
router.get('/me', authenticate, getMe);

export default router;
