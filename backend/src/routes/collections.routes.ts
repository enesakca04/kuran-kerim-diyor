import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { 
  getCollections, 
  createCollection, 
  deleteCollection, 
  addItemToCollection, 
  removeItemFromCollection 
} from '../controllers/collections.controller';

const router = Router();

router.use(authenticate); // Protect all collection routes

router.get('/', getCollections);
router.post('/', createCollection);
router.delete('/:id', deleteCollection);
router.post('/:id/items', addItemToCollection);
router.delete('/:id/items/:favoriteId', removeItemFromCollection);

export default router;
