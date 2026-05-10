import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getFavorites, addFavorite, removeFavorite, syncFavorites } from '../controllers/favorites.controller';

const router = Router();

router.use(authenticate); // Protect all favorite routes

router.get('/', getFavorites);
router.post('/', addFavorite);
router.delete('/:ayahId', removeFavorite);
router.post('/sync', syncFavorites);

export default router;
