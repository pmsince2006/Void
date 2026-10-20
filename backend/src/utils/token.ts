import jwt, { SignOptions } from 'jsonwebtoken';
import { CookieOptions } from 'express';

export const SESSION_COOKIE_NAME = 'void_session';

export interface TokenPayload {
  userId: string;
  email: string;
}

/**
 * Retrieve the JWT signing secret from environment.
 * Enforces security in production.
 */
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: JWT_SECRET environment variable is missing in production.');
    }
    // Safe deterministic development secret (never used in production)
    return 'void_dev_insecure_jwt_secret_do_not_use_in_production_key';
  }
  return secret;
}

/**
 * Generates a signed, tamper-proof JSON Web Token.
 */
export function generateToken(payload: TokenPayload): string {
  const secret = getJwtSecret();
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

  return jwt.sign(payload, secret, {
    expiresIn,
    algorithm: 'HS256'
  });
}

/**
 * Verifies a JWT token. Returns the payload or null if invalid/expired.
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = getJwtSecret();
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256']
    }) as TokenPayload;

    return decoded;
  } catch {
    return null;
  }
}

/**
 * Returns hardened cookie configuration options.
 * HttpOnly protects against XSS token theft.
 * SameSite & Secure protect against CSRF and network eavesdropping.
 */
export function getSessionCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Inaccessible to browser JavaScript (anti-XSS)
    secure: isProduction, // HTTPS only in production (allows HTTP for local development)
    sameSite: isProduction ? 'strict' : 'lax', // Protects against cross-site request forgery
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  };
}

/**
 * Options for clearing session cookie (omits maxAge as per Express best practices).
 */
export function getClearCookieOptions(): CookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  };
}
