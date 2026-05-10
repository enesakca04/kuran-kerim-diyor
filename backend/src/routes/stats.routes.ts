import { Router } from 'express';
import { getAyahStats } from '../controllers/stats.controller';

const router = Router();

router.get('/:ayahId', getAyahStats);

export default router;
