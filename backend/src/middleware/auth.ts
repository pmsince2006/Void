import { Request, Response, NextFunction } from 'express';
import { verifyToken, SESSION_COOKIE_NAME, getClearCookieOptions } from '../utils/token';
import { User } from '../models/User';

/**
 * Authentication Middleware:
 * Inspects incoming request for HttpOnly session cookie or Bearer token,
 * validates JWT signature and loads the active user from MongoDB.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Extract token from HttpOnly cookie or Authorization Bearer header
    let token = req.cookies?.[SESSION_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Authentication required. Please log in to access this resource.'
      });
      return;
    }

    // 2. Cryptographically verify token
    const payload = verifyToken(token);
    if (!payload || !payload.userId) {
      // Clear corrupt or expired cookie
      res.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());
      res.status(401).json({
        status: 'error',
        message: 'Session expired or invalid. Please log in again.'
      });
      return;
    }

    // 3. Retrieve user from MongoDB to ensure account still exists
    const user = await User.findById(payload.userId);
    if (!user) {
      res.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());
      res.status(401).json({
        status: 'error',
        message: 'User account not found.'
      });
      return;
    }

    // 4. Attach verified user document to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error verifying session'
    });
  }
}
