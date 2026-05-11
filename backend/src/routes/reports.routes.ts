import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { reportComment, markReportInvalid } from '../controllers/reports.controller';

const router = Router();

// Protect all report routes
router.use(authenticate); 

router.post('/', reportComment);

// In a real app, this should be protected by Admin-only middleware
// For now, it will be accessed via a secure token from Discord webhook
router.post('/mark-invalid/:id', markReportInvalid);

export default router;
