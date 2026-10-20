import { Router } from 'express';
import { signup, login, logout, getCurrentUser } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// Authentication Endpoints
router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

export default router;
