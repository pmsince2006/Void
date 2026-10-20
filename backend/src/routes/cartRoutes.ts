import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  mergeCart
} from '../controllers/cartController';

const router = Router();

// Protect all cart routes with authenticated session check
router.use(requireAuth);

router.get('/', getCart);
router.post('/items', addItem);
router.put('/items', updateItem);
router.delete('/items/:id', removeItem);
router.delete('/', clearCart);
router.post('/merge', mergeCart);

export default router;
