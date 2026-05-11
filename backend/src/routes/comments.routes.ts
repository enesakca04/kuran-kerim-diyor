import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../middleware/auth';
import { getComments, addComment, deleteComment, getMyComments, toggleLike } from '../controllers/comments.controller';

const router = Router();

// Private routes (Giriş gerektirenler)
router.get('/my', authenticate, getMyComments);
router.post('/', authenticate, addComment);
router.post('/:commentId/like', authenticate, toggleLike);
router.delete('/:id', authenticate, deleteComment);

// Public routes (Herkese açık olanlar - En altta olmalı)
router.get('/:ayahId', optionalAuthenticate, getComments);

export default router;
