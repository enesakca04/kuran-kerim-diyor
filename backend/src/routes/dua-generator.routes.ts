import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuthenticate, checkBanned } from '../middleware/auth';
import { generateDua } from '../controllers/dua-generator.controller';

const router = Router();

const duaLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  limit: 15,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { message: 'AI_DUA_RATE_LIMITED' },
});

router.use(optionalAuthenticate, checkBanned);
router.post('/', duaLimiter, generateDua);

export default router;
