import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { generateToken, SESSION_COOKIE_NAME, getSessionCookieOptions, getClearCookieOptions } from '../utils/token';

// Constant-time dummy hash used to prevent timing-based user enumeration attacks
const DUMMY_HASH = '$2a$10$wK1k6xZ9Lw2K9G8oZ6B2JePjOqZl8A8J9xUe.Y9I2qE0pP4hH0Zia';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * POST /api/auth/signup
 * Creates a new user, hashes password, saves to MongoDB, sets HttpOnly session cookie.
 */
export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password } = req.body || {};

    // 1. Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      res.status(400).json({
        status: 'error',
        message: 'Name is required and must be at least 2 characters long.'
      });
      return;
    }
    if (name.trim().length > 100) {
      res.status(400).json({
        status: 'error',
        message: 'Name cannot exceed 100 characters.'
      });
      return;
    }

    // 2. Validate email
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      res.status(400).json({
        status: 'error',
        message: 'Please provide a valid email address.'
      });
      return;
    }

    // 3. Validate password
    if (!password || typeof password !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Password is required.'
      });
      return;
    }
    if (password.length < 8) {
      res.status(400).json({
        status: 'error',
        message: 'Password must be at least 8 characters long.'
      });
      return;
    }
    if (password.length > 128) {
      res.status(400).json({
        status: 'error',
        message: 'Password cannot exceed 128 characters.'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 4. Check for duplicate email
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
      return;
    }

    // 5. Hash password with bcrypt (cost factor 10)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 6. Save new user to MongoDB
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    // 7. Generate session token and set secure HttpOnly cookie
    const token = generateToken({
      userId: newUser._id.toString(),
      email: newUser.email
    });

    res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    // 8. Return safe user profile (zero password/secret exposure)
    res.status(201).json({
      status: 'ok',
      message: 'Account created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (error: any) {
    // Handle edge-case race condition for duplicate email (MongoDB error 11000)
    if (error?.code === 11000) {
      res.status(409).json({
        status: 'error',
        message: 'An account with this email address already exists.'
      });
      return;
    }

    console.error('Signup error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error processing registration'
    });
  }
}

/**
 * POST /api/auth/login
 * Verifies email and password hash, sets HttpOnly session cookie on success.
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body || {};

    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        status: 'error',
        message: 'Please provide both email and password.'
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Mitigate timing attack if user doesn't exist
    if (!user) {
      await bcrypt.compare(password, DUMMY_HASH);
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
      return;
    }

    // Verify password against stored hash
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.'
      });
      return;
    }

    // Issue session token via HttpOnly cookie
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email
    });

    res.cookie(SESSION_COOKIE_NAME, token, getSessionCookieOptions());

    res.status(200).json({
      status: 'ok',
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error processing login'
    });
  }
}

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export function logout(_req: Request, res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, getClearCookieOptions());
  res.status(200).json({
    status: 'ok',
    message: 'Logged out successfully'
  });
}

/**
 * GET /api/auth/me
 * Returns currently authenticated user's safe profile. Requires requireAuth middleware.
 */
export function getCurrentUser(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).json({
      status: 'error',
      message: 'Not authenticated'
    });
    return;
  }

  res.status(200).json({
    status: 'ok',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    }
  });
}
