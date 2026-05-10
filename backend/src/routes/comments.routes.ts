import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getComments, addComment, deleteComment, getMyComments } from '../controllers/comments.controller';

const router = Router();

// Private routes (Giriş gerektirenler)
router.get('/my', authenticate, getMyComments);
router.post('/', authenticate, addComment);
router.delete('/:id', authenticate, deleteComment);

// Public routes (Herkese açık olanlar - En altta olmalı)
router.get('/:ayahId', getComments);

export default router;
