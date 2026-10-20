import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getWishlist,
  toggleItem,
  mergeWishlist
} from '../controllers/wishlistController';

const router = Router();

// Protect all wishlist routes with authenticated session check
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/toggle', toggleItem);
router.post('/merge', mergeWishlist);

export default router;
