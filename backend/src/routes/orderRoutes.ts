import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { orderLimiter } from '../middleware/rateLimiter';
import {
  createOrder,
  getOrders,
  getOrderById
} from '../controllers/orderController';

const router = Router();

// All order operations require a verified authenticated session
router.use(requireAuth);

/**
 * @route   POST /api/orders
 * @desc    Creates an authenticated order with live inventory reservation
 */
router.post('/', orderLimiter, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Retrieves current user's order history (paginated, newest first)
 */
router.get('/', getOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Retrieves a single order by ID or orderNumber (strictly scoped to owner)
 */
router.get('/:id', getOrderById);

export default router;
