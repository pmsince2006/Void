import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

/**
 * Strict rate limiter for authentication endpoints (signup, login).
 * Protects against brute-force password guessing and registration spam.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: process.env.NODE_ENV === 'test' ? 1000 : 15, // Allow high limit in tests, 15 in normal use
  standardHeaders: true, // Return standard RateLimit headers in responses
  legacyHeaders: false, // Disable X-RateLimit-* legacy headers
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many authentication attempts. Please try again after 15 minutes.'
    });
  }
});

/**
 * General API rate limiter for standard routes.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'test' ? 5000 : 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      status: 'error',
      message: 'Too many requests. Please slow down.'
    });
  }
});
